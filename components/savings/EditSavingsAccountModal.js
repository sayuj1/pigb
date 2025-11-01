import { Modal, Form, Input, InputNumber, DatePicker } from "antd";
import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";

export default function EditSavingsAccountModal({
  visible,
  onClose,
  onSuccess,
  initialData,
}) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible && initialData) {
      form.setFieldsValue({
        accountName: initialData.accountName,
        savingsType: initialData.savingsType,
        amount: initialData.amount,
        accountStartDate: initialData.createdAt ? dayjs(initialData.createdAt) : null,
        maturityDate: initialData.maturityDate ? dayjs(initialData.maturityDate) : null,
      });
    } else {
      form.resetFields();
    }
  }, [visible, initialData]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const updatedData = {
        ...values,
        createdAt: values.accountStartDate
          ? values.accountStartDate.toISOString()
          : null,
        maturityDate: values.maturityDate
          ? values.maturityDate.toISOString()
          : null,
      };

      setSubmitting(true);
      await axios.put(`/api/savings/saving?id=${initialData._id}`, updatedData);
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error updating savings account:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Edit Savings Account"
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={submitting}
      okText="Update"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="accountName"
          label="Account Name"
          rules={[{ required: true, message: "Please enter a name" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="amount"
          label="Initial Balance (INR)"
          rules={[{ required: true, message: "Please enter amount" }]}
        >
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          name="savingsType"
          label="Savings Type"
          rules={[{ required: true, message: "Please select type" }]}
        >
          <Input
            readOnly
            className="cursor-not-allowed focus:ring-0 focus:outline-none"
          />
        </Form.Item>

        {/* Account Start Date */}
        <Form.Item
          name="accountStartDate"
          label="Account Start Date"
          rules={[{ required: true, message: "Please select account start date" }]}
        >
          <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
        </Form.Item>

        {/* Maturity Date (Optional) */}
        <Form.Item name="maturityDate" label="Maturity Date (Optional)">
          <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
