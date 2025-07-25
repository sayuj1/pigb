import { Modal, Form, Input, InputNumber } from "antd";
import { useEffect, useState } from "react";
import axios from "axios";


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
      });
    }
  }, [visible, initialData]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const updatedData = {
        ...values,
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
          <Input value={form.getFieldValue("savingsType")} readOnly className="cursor-not-allowed focus:ring-0 focus:outline-none" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
