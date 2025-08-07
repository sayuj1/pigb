import { useEffect } from 'react';
import { Table, Input, DatePicker, Select, Typography, Popover } from 'antd';
import dayjs from 'dayjs';
import { CloseOutlined } from '@ant-design/icons'; // Import icon

const { Option } = Select;
const { Text } = Typography;

const types = ['expense', 'income'];

export default function TransactionReviewTable({ data, onChange, categories, errors, setErrors, loading }) {


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
            title: 'Amount',
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
        <Table
            columns={columns}
            dataSource={data}
            rowKey={(_, i) => i}
            pagination={false}
            loading={loading}
        />
    );
}
