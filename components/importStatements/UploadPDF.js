import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Upload, Button, message, Select, Typography, Progress, Alert } from 'antd';
import { UploadOutlined, DeleteOutlined, CloudUploadOutlined } from '@ant-design/icons';
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

    const bankOptions = [
        { value: "AXIS", label: "Axis Bank", color: "#951a31" },
        { value: "ICICI", label: "ICICI Bank", color: "#f37e20" },
        { value: "HDFC", label: "HDFC Bank", color: "#004c8f" },
        { value: "SBI", label: "SBI Bank", color: "#280071" }, // Example addition
    ];

    const currentBank = bankOptions.find(b => b.value === bank);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Text strong className="text-gray-700">Select Bank</Text>
                    <Select
                        value={bank}
                        onChange={setBank}
                        style={{ width: '100%' }}
                        size="large"
                        disabled={!!fileInfo}
                        placeholder="Select Bank"
                        className="w-full"
                    >
                        {bankOptions.map(b => (
                            <Option key={b.value} value={b.value}>{b.label}</Option>
                        ))}
                    </Select>
                </div>

                <div className="space-y-2">
                    <Text strong className="text-gray-700">Target Account</Text>
                    <Select
                        placeholder="Select account to import to"
                        value={selectedAccount}
                        onChange={setSelectedAccount}
                        style={{ width: '100%' }}
                        size="large"
                        disabled={!!fileInfo}
                    >
                        {accounts.map((acc) => (
                            <Option key={acc._id} value={acc._id}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span>{getIconComponent(acc.icon)({ size: 18, color: acc.color })}</span>
                                    <span className="font-medium text-gray-700">{acc.name}</span>
                                    <span className="text-gray-400 text-xs">(₹{acc.balance.toLocaleString()})</span>
                                </div>
                            </Option>
                        ))}
                    </Select>
                </div>
            </div>

            {!fileInfo ? (
                <Upload.Dragger
                    customRequest={({ file }) => handleUpload(file)}
                    showUploadList={false}
                    accept="application/pdf"
                    multiple={false}
                    disabled={uploading || !selectedAccount} // Disable if no account
                    beforeUpload={(file) => {
                        const isPdf = file.type === 'application/pdf';
                        const isLt10M = file.size / 1024 / 1024 < 10;
                        if (!isPdf) message.error('Only PDF files are allowed!');
                        if (!isLt10M) message.error('File must be smaller than 10MB!');
                        return isPdf && isLt10M;
                    }}
                    className="bg-gray-50  border-dashed border-gray-300 rounded-xl hover:border-blue-500 transition-colors"
                >
                    <div className="p-8">
                        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CloudUploadOutlined style={{ fontSize: '32px' }} />
                        </div>
                        <p className="text-lg font-semibold text-gray-700">Click or drag PDF statement here</p>
                        <p className="text-gray-500 mb-4 text-sm max-w-sm mx-auto">
                            Support for {currentBank?.label} PDF statements. Max size 10MB.
                        </p>
                        {!selectedAccount ? (
                            <div className="flex justify-center">
                                <Alert
                                    message="Please select an account first"
                                    type="warning"
                                    showIcon
                                    className="w-fit"
                                />
                            </div>
                        ) : (
                            <Button type="primary" size="large" loading={uploading} icon={<UploadOutlined />}>
                                {uploading ? 'Parsing Statement...' : 'Select PDF File'}
                            </Button>
                        )}
                    </div>
                </Upload.Dragger>
            ) : (
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-50 text-red-500 rounded-lg">
                                <FileOutlined style={{ fontSize: '24px' }} />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-800 m-0">{fileInfo.name}</h4>
                                <Text type="secondary" className="text-xs">
                                    {uploadProgress < 100 ? 'Uploading & Parsing...' : 'Parsed Successfully'}
                                </Text>
                            </div>
                        </div>
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleRemoveFile(true)}
                            type="text"
                            className="bg-red-50 hover:bg-red-100 text-red-600"
                        >
                            Remove File
                        </Button>
                    </div>

                    {uploadProgress < 100 && (
                        <Progress percent={uploadProgress} status="active" size="small" className="mt-4" />
                    )}

                    {NOT_CREDIT_DETECTED_BANKS.includes(bank) && (
                        <Alert
                            description={
                                <div className="text-sm text-yellow-800">
                                    For <strong>{bank}</strong> statements, credit/income entries may not be auto-detected correctly. Please verify transaction types in the next step.
                                </div>
                            }
                            type="warning"
                            showIcon
                            className="mt-4 border-yellow-200 bg-yellow-50"
                        />
                    )}
                </div>
            )}
        </div>
    );
});

export default UploadPDF;
