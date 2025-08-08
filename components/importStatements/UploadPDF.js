import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Upload, Button, message, Select, Typography, Progress, Alert } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import { FileOutlined } from '@ant-design/icons';
import { getIconComponent } from '@/utils/getIcons';
import { formatTransactionDates } from '@/utils/dateFormatter';
import { NOT_CREDIT_DETECTED_BANKS } from '@/contants/app_constants';

const { Option } = Select;
const { Text } = Typography;

const UploadPDF = forwardRef(({ onSuccess, onRemoveTransactions, selectedAccount, setSelectedAccount, accounts }, ref) => {
    const [bank, setBank] = useState('AXIS');
    const [fileInfo, setFileInfo] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleUpload = async (file) => {
        const formData = new FormData();
        formData.append('pdf', file);
        formData.append('bank', bank);

        setUploading(true);
        setUploadProgress(0);
        setFileInfo({ name: file.name });

        try {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/api/import/upload-statement');

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percent = Math.round((event.loaded / event.total) * 100);
                    setUploadProgress(percent);
                }
            };

            xhr.onload = async () => {
                setUploading(false);
                if (xhr.status === 200) {
                    const data = JSON.parse(xhr.responseText);
                    message.success('Transactions extracted');
                    const updatedTransactions = await formatTransactionDates(data.transactions, 'DD-MM-YYYY', 'YYYY-MM-DD');
                    onSuccess(updatedTransactions);
                } else {
                    message.error('Upload failed');
                    setFileInfo(null);
                }
            };

            xhr.onerror = () => {
                setUploading(false);
                message.error('Upload failed');
                setFileInfo(null);
            };

            xhr.send(formData);
        } catch (err) {
            message.error('Upload failed');
            setUploading(false);
            setFileInfo(null);
        }
    };

    const handleRemoveFile = (showMessage = false) => {
        setFileInfo(null);
        setUploadProgress(0);
        if (typeof onRemoveTransactions === 'function') {
            onRemoveTransactions(showMessage); // remove data from review table
        }
    };

    // ✅ Expose methods to parent
    useImperativeHandle(ref, () => ({
        removeFile: handleRemoveFile
    }));

    return (
        <>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Text strong style={{ marginBottom: 8 }}>Select Bank</Text>
                    <Select
                        value={bank}
                        onChange={setBank}
                        style={{ width: 200 }}
                        disabled={fileInfo}
                        placeholder="Select Bank"
                    >
                        <Option value="AXIS">AXIS</Option>
                        <Option value="ICICI">ICICI</Option>
                        <Option value="HDFC">HDFC</Option>
                    </Select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Text strong style={{ marginBottom: 8 }}>Select Account</Text>
                    <Select
                        placeholder="Select account"
                        value={selectedAccount}
                        onChange={setSelectedAccount}
                        style={{ minWidth: 200 }}
                    >
                        {accounts.map((acc) => (
                            <Option key={acc._id} value={acc._id}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span>{getIconComponent(acc.icon)({ size: 20, color: acc.color })}</span>
                                    <span>
                                        {acc.name} <span style={{ color: '#888' }}>(₹{acc.balance.toFixed(2)})</span>
                                    </span>
                                </div>
                            </Option>
                        ))}
                    </Select>
                </div>
            </div>

            {!fileInfo ? (
                <div
                    style={{
                        border: '2px dashed #d9d9d9',
                        padding: '24px',
                        borderRadius: '8px',
                        textAlign: 'center',
                        backgroundColor: '#fafafa',
                        marginTop: 5,
                        width: '100%',
                        height: 200,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                    }}
                >
                    <Upload
                        customRequest={({ file }) => handleUpload(file)}
                        showUploadList={false}
                        accept="application/pdf"
                        beforeUpload={(file) => {
                            const isPdf = file.type === 'application/pdf';
                            const isLt10M = file.size / 1024 / 1024 < 10;

                            if (!isPdf) {
                                message.error('Only PDF files are allowed!');
                            }

                            if (!isLt10M) {
                                message.error('File must be smaller than 10MB!');
                            }

                            return isPdf && isLt10M;
                        }}
                    >
                        <Button
                            type="primary"
                            icon={<UploadOutlined />}
                            loading={uploading}
                            style={{
                                borderRadius: '6px',
                                padding: '0 16px',
                                fontWeight: 500,
                                marginTop: 8,
                            }}
                        >
                            {`Upload ${bank} Bank Statement`}
                        </Button>
                    </Upload>
                    <div style={{ marginTop: 12, color: '#888' }}>
                        <Text type="secondary">Only PDF format is supported. Max file size: 10MB.</Text>
                    </div>
                </div>
            ) : (
                <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                        <Text style={{ fontWeight: 'bolder', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <FileOutlined />
                            {fileInfo.name}
                        </Text>
                        <Progress percent={uploadProgress} size="small" style={{ width: 150 }} />
                        <Button
                            type="text"
                            icon={<DeleteOutlined />}
                            danger
                            onClick={() => handleRemoveFile(true)}
                        />
                    </div>
                    {NOT_CREDIT_DETECTED_BANKS.includes(bank) && (
                        <Alert
                            description={
                                <>
                                    For <strong>{bank}</strong> Bank statements, credit amounts may not be automatically detected. Please carefully review and verify the transaction types, especially for  <strong>credit</strong> entries, before saving.
                                </>
                            }
                            type="warning"
                            showIcon
                            style={{ marginBottom: 16 }}
                        />
                    )}
                </>
            )}
        </>
    );
});

export default UploadPDF;
