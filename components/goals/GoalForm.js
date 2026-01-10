import React, { useEffect } from "react";
import { Modal, Form, Input, InputNumber, DatePicker, Select } from "antd";
import dayjs from "dayjs";
import { GOAL_CATEGORIES } from "@/contants/goalCategories";

const GoalForm = ({ visible, onCancel, onFinish, initialValues, loading }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible && initialValues) {
            form.setFieldsValue({
                ...initialValues,
                deadline: dayjs(initialValues.deadline),
            });
        } else {
            form.resetFields();
        }
    }, [visible, initialValues, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            onFinish({
                ...values,
                deadline: values.deadline.toISOString(),
            });
        } catch (error) {
            console.error("Validation failed:", error);
        }
    };

    return (
        <Modal
            title={initialValues ? "Edit Goal" : "Create New Goal"}
            open={visible}
            onCancel={onCancel}
            onOk={handleSubmit}
            confirmLoading={loading}
            centered
            className="rounded-xl overflow-hidden"
        >
            <Form form={form} layout="vertical" className="mt-4">
                <Form.Item
                    name="name"
                    label="Goal Name"
                    rules={[{ required: true, message: "Please enter the goal name" }]}
                >
                    <Input placeholder="e.g., Buy a New Car" />
                </Form.Item>

                <Form.Item
                    name="category"
                    label="Category"
                    initialValue="General"
                >
                    <Select placeholder="Select a category">
                        {GOAL_CATEGORIES.map(cat => (
                            <Select.Option key={cat} value={cat}>{cat}</Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                        name="targetAmount"
                        label="Target Amount (₹)"
                        rules={[{ required: true, message: "Required" }]}
                    >
                        <InputNumber className="w-full" min={1} placeholder="10000" />
                    </Form.Item>

                    <Form.Item
                        name="currentAmount"
                        label="Current Amount (₹)"
                        initialValue={0}
                    >
                        <InputNumber className="w-full" min={0} placeholder="0" />
                    </Form.Item>
                </div>

                <Form.Item
                    name="deadline"
                    label="Deadline"
                    rules={[{ required: true, message: "Please select a deadline" }]}
                >
                    <DatePicker className="w-full" disabledDate={(current) => current && current < dayjs().startOf('day')} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default GoalForm;
