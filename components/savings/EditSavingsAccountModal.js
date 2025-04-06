import { Modal, Form, Input, InputNumber, Select, Spin } from "antd";
import { useEffect, useState } from "react";
import axios from "axios";

const { Option } = Select;

export default function EditSavingsAccountModal({
  visible,
  onClose,
  onSuccess,
  initialData,
}) {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible && initialData) {
      fetchCategories();
      form.setFieldsValue({
        accountName: initialData.accountName,
        savingsType: initialData.savingsType?.split(" ").slice(1).join(" "),
        amount: initialData.amount,
      });
    }
  }, [visible, initialData]);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const res = await fetch("/api/categories/category?type=savings");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err) {
      console.error("Failed to fetch savings categories:", err);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const selectedCategory = categories.find(
        (cat) => cat.name === values.savingsType
      );
      const updatedData = {
        ...values,
        savingsType: `${selectedCategory.icon} ${selectedCategory.name}`,
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
          name="savingsType"
          label="Savings Type"
          rules={[{ required: true, message: "Please select type" }]}
        >
          {loadingCategories ? (
            <Spin />
          ) : (
            <Select
              showSearch
              placeholder="Select savings type"
              optionFilterProp="label"
              filterOption={(input, option) =>
                option?.label?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {categories.map((cat) => (
                <Option key={cat.name} value={cat.name} label={cat.name}>
                  <span className="flex items-center gap-2">
                    {cat.icon} {cat.name}
                  </span>
                </Option>
              ))}
            </Select>
          )}
        </Form.Item>

        <Form.Item
          name="amount"
          label="Initial Balance (INR)"
          rules={[{ required: true, message: "Please enter amount" }]}
        >
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
