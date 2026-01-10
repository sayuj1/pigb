import React from "react";
import { Modal, Form, InputNumber, Input, DatePicker, message } from "antd";
import dayjs from "dayjs";
import axios from "axios";

const AddMoneyModal = ({ goalId, visible, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = React.useState(false);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            await axios.post(`/api/goals/transactions?goalId=${goalId}`, {
                ...values,
                date: values.date ? values.date.toISOString() : new Date().toISOString(),
            });
            message.success("Money added successfully!");
            form.resetFields();
            onSuccess();
        } catch (error) {
            message.error(error.response?.data?.message || "Failed to add money");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Add Money to Goal"
            open={visible}
            onCancel={onCancel}
            onOk={handleSubmit}
            confirmLoading={loading}
            centered
            className="rounded-xl overflow-hidden"
        >
            <Form form={form} layout="vertical" initialValues={{ date: dayjs() }}>
                <Form.Item
                    name="amount"
                    label="Amount (₹)"
                    rules={[{ required: true, message: "Please enter amount" }]}
                >
                    <InputNumber className="w-full" min={1} placeholder="Enter amount" />
                </Form.Item>
                <Form.Item name="description" label="Description (Optional)">
                    <Input placeholder="e.g., Monthly contribution" />
                </Form.Item>
                <Form.Item name="date" label="Date">
                    <DatePicker className="w-full" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AddMoneyModal;
