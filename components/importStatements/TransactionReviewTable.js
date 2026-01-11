import { useEffect, useState } from 'react';
import { Table, Input, DatePicker, Select, Typography, Popover, Space, Button, message, Modal, Alert } from 'antd';
import dayjs from 'dayjs';
import { CloseOutlined, ExclamationCircleOutlined } from '@ant-design/icons'; // Import icon

const { Option } = Select;
const { Text } = Typography;

const types = ['expense', 'income'];

let previousSelectedRowKeys = [];
export default function TransactionReviewTable({ data, onChange, categories, errors, setErrors, loading }) {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [bulkCategory, setBulkCategory] = useState({ key: Date.now(), value: undefined });
    const [bulkDate, setBulkDate] = useState({ key: Math.random(), value: undefined });


    const arraysAreEqual = (a, b) =>
        a.length === b.length && a.every((val, i) => val === b[i]);

    useEffect(() => {
        if (!arraysAreEqual(selectedRowKeys, previousSelectedRowKeys)) {
            setBulkCategory({ key: Date.now(), value: undefined });
            setBulkDate({ key: Math.random(), value: undefined })
            previousSelectedRowKeys = selectedRowKeys;

        }
        // previousSelectedRowKeys = selectedRowKeys;
    }, [selectedRowKeys]);

    useEffect(() => {
        validateAll();
    }, [data]);

    const validateRow = (row, i) => {
        const newErrors = {};
        if (!row.date) newErrors.date = 'Required';
        if (!row.amount) newErrors.amount = 'Required';
        if (!row.type) newErrors.type = 'Required';
        if (!row.category) newErrors.category = 'Required';
        return { [i]: newErrors };
    };

    const validateAll = () => {
        const allErrors = {};
        data.forEach((row, i) => {
            Object.assign(allErrors, validateRow(row, i));
        });
        setErrors(allErrors);
    };

    const updateRow = (index, key, value) => {
        const updated = [...data];
        updated[index][key] = value;
        onChange(updated);
    };

    // Remove row handler
    const removeRow = (index) => {
        const updated = [...data];
        updated.splice(index, 1);
        onChange(updated);

        const updatedErrors = { ...errors };
        delete updatedErrors[index];

        // Re-index error keys after removal
        const reindexedErrors = {};
        Object.keys(updatedErrors).forEach((key) => {
            const idx = parseInt(key, 10);
            if (idx > index) {
                reindexedErrors[idx - 1] = updatedErrors[key];
            } else if (idx < index) {
                reindexedErrors[idx] = updatedErrors[key];
            }
        });

        setErrors(reindexedErrors);
    };


    const columns = [
        {
            title: '',
            dataIndex: 'action',
            width: 50,
            align: 'center',
            render: (_, __, i) => (
                <Popover content="Remove this transaction" placement="top">
                    <CloseOutlined
                        onClick={() => removeRow(i)}
                        style={{ color: 'red', cursor: 'pointer', fontSize: 16 }}
                    />
                </Popover>
            ),
        },
        {
            title: 'Date',
            dataIndex: 'date',
            render: (text, _, i) => (
                <div>
                    <DatePicker
                        value={text ? dayjs(text, 'YYYY-MM-DD') : null}
                        onChange={(date, dateStr) => updateRow(i, 'date', dateStr)}
                        status={errors[i]?.date ? 'error' : ''}
                        style={{ width: "100%" }}

                    />
                    {errors[i]?.date && <Text type="danger">{errors[i].date}</Text>}
                </div>
            ),
        },
        {
            title: 'Description',
            dataIndex: 'description',
            render: (text, _, i) => (
                <Input
                    value={text}
                    onChange={(e) => updateRow(i, 'description', e.target.value)}
                    placeholder="Optional"
                />
            ),
        },
        {
            title: 'Amount (Rs.)',
            dataIndex: 'amount',
            render: (text, _, i) => (
                <div>
                    <Input
                        type="number"
                        value={text}
                        onChange={(e) =>
                            updateRow(i, 'amount', parseFloat(e.target.value) || '')
                        }
                        status={errors[i]?.amount ? 'error' : ''}
                    />
                    {errors[i]?.amount && <Text type="danger">{errors[i].amount}</Text>}
                </div>
            ),
        },
        {
            title: 'Type',
            dataIndex: 'type',
            render: (value, _, i) => (
                <div>
                    <Select
                        value={value}
                        onChange={(val) => updateRow(i, 'type', val)}
                        status={errors[i]?.type ? 'error' : ''}
                        optionLabelProp="label"
                        style={{ width: "100%" }}
                    >
                        {types.map((type) => (
                            <Option
                                key={type}
                                value={type}
                                style={{ color: type === 'expense' ? 'red' : 'green' }}
                                label={
                                    <span style={{ color: type === 'expense' ? 'red' : 'green' }}>
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </span>
                                }
                            >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </Option>
                        ))}
                    </Select>
                    {errors[i]?.type && <Text type="danger">{errors[i].type}</Text>}
                </div>
            ),
        },
        {
            title: 'Category',
            dataIndex: 'category',
            render: (value, _, i) => (
                <div>
                    <Select
                        showSearch
                        placeholder="Select category"
                        optionFilterProp="label"
                        value={value}
                        onChange={(val) => updateRow(i, 'category', val)}
                        status={errors[i]?.category ? 'error' : ''}
                        style={{ width: "100%" }}
                        filterOption={(input, option) =>
                            option?.label?.toLowerCase().includes(input.toLowerCase())
                        }
                    >
                        {categories.map((cat) => (
                            <Option key={cat._id} value={cat.name} label={cat.name}>
                                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    {cat.icon} {cat.name}
                                </span>
                            </Option>
                        ))}
                    </Select>
                    {errors[i]?.category && <Text type="danger">{errors[i].category}</Text>}
                </div>
            ),
        },
    ];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-100 flex flex-wrap gap-3 items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-gray-500 font-medium text-sm">Bulk Actions ({selectedRowKeys.length} selected):</span>
                    <Select
                        key={bulkCategory.key}
                        value={bulkCategory.value}
                        placeholder="Assign Category"
                        style={{ width: 180 }}
                        size="small"
                        onChange={(cat) => {
                            const updated = [...data];
                            selectedRowKeys.forEach((i) => {
                                updated[i].category = cat;
                            });
                            onChange(updated);
                            validateAll();
                            message.success(cat ? `Assigned "${cat}" to selected` : `Category removed for selected`);
                        }}
                        disabled={!selectedRowKeys.length}
                        allowClear
                    >
                        {categories.map((cat) => (
                            <Option key={cat._id} value={cat.name}>
                                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    {cat.icon} {cat.name}
                                </span>
                            </Option>
                        ))}
                    </Select>

                    <DatePicker
                        key={bulkDate.key}
                        value={bulkDate.value}
                        placeholder="Set Date"
                        size="small"
                        style={{ width: 140 }}
                        onChange={(_, dateStr) => {
                            const updated = [...data];
                            selectedRowKeys.forEach((i) => updated[i].date = dateStr);
                            onChange(updated);
                            validateAll();
                            message.success(dateStr ? `Date updated to ${dateStr}` : "Date removed");
                        }}
                        disabled={!selectedRowKeys.length}
                    />
                </div>

                <div className="flex gap-2">
                    <Button
                        danger
                        size="small"
                        disabled={!selectedRowKeys.length}
                        onClick={() => setShowConfirmDelete(true)}
                        icon={<CloseOutlined />}
                    >
                        Delete
                    </Button>
                    <Button
                        size="small"
                        onClick={() => setSelectedRowKeys([])}
                        disabled={!selectedRowKeys.length}
                    >
                        Deselect
                    </Button>
                </div>
            </div>

            <Table
                columns={columns}
                dataSource={data}
                rowKey={(_, i) => i}
                pagination={false}
                loading={loading}
                rowSelection={{
                    selectedRowKeys,
                    onChange: (keys) => setSelectedRowKeys(keys),
                }}
            />
            <Modal
                open={showConfirmDelete}
                title={
                    <div className="flex items-center gap-2 text-red-600">
                        <ExclamationCircleOutlined className="text-xl" />
                        <span>Delete Transactions</span>
                    </div>
                }
                onOk={() => {
                    const updated = data.filter((_, i) => !selectedRowKeys.includes(i));
                    const updatedErrors = { ...errors };

                    // Clean up and reindex errors
                    const reindexedErrors = {};
                    updated.forEach((_, newIndex) => {
                        const oldIndex = data.findIndex((_, i) => !selectedRowKeys.includes(i) && i === newIndex);
                        if (errors[oldIndex]) {
                            reindexedErrors[newIndex] = errors[oldIndex];
                        }
                    });

                    onChange(updated);
                    setErrors(reindexedErrors);
                    setSelectedRowKeys([]);
                    setShowConfirmDelete(false);
                    message.success("Deleted selected transactions");
                }}
                onCancel={() => setShowConfirmDelete(false)}
                okText="Yes, Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true, size: 'large' }}
                cancelButtonProps={{ size: 'large' }}
                destroyOnClose
            >
                <div className="py-4">
                    <Alert
                        message="Warning"
                        description={`You are about to permanently delete ${selectedRowKeys.length} selected transaction(s). This action cannot be undone.`}
                        type="error"
                        showIcon
                        className="mb-4 bg-red-50 border-red-100"
                    />
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-gray-600 text-sm">
                        <ul className="list-disc pl-4 space-y-1">
                            <li>Removed transactions will not be imported.</li>
                            <li>You can re-upload the file if you need them back.</li>
                        </ul>
                    </div>
                </div>
            </Modal>
        </div>
    );
}


