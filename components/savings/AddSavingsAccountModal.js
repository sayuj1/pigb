import { Modal, Form, Input, InputNumber, Select, Spin, Button, DatePicker } from "antd";
import { useEffect, useState } from "react";
import axios from "axios";
import * as PiIcons from "react-icons/pi"; // Phosphor Icons
import dayjs from "dayjs";

const { Option } = Select;

export default function AddSavingsAccountModal({
  visible,
  onClose,
  onSuccess,
}) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchCategories();
      // Set default account start date to today
      form.setFieldsValue({
        accountStartDate: dayjs(),
      });
    } else {
      form.resetFields();
    }
  }, [visible]);

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
      // Find the selected category object
      const selectedCategory = categories.find(
        (cat) => cat.name === values.savingsType
      );
      const formattedValues = {
        ...values,
        savingsType: `${selectedCategory.icon} ${selectedCategory.name}`,
        createdAt: values.accountStartDate
          ? values.accountStartDate.toISOString()
          : null,
        maturityDate: values.maturityDate
          ? values.maturityDate.toISOString()
          : null,
      };
      // console.log("value ", formattedValues);
      setSubmitting(true);
      await axios.post("/api/savings/saving", formattedValues);
      form.resetFields();
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error creating savings account:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    form.resetFields();
    // Reset today's date again manually
    form.setFieldsValue({ accountStartDate: dayjs() });
  };

  return (
    <Modal
      title="Create Savings Account"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="reset" onClick={handleReset} danger>
          Reset
        </Button>,
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={submitting}
          onClick={handleSubmit}
        >
          Create
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="accountName"
          label="Account Name"
          rules={[
            {
              required: true,
              message: "Please enter a name for the savings account",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="savingsType"
          label="Savings Type"
          rules={[{ required: true, message: "Please select savings type" }]}
        >
          <Select
            showSearch
            placeholder="Select savings type"
            optionFilterProp="label"
            loading={loadingCategories}
            disabled={loadingCategories}
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
        </Form.Item>

        <Form.Item
          name="amount"
          label="Initial Balance (INR)"
          rules={[{ required: true, message: "Please enter amount" }]}
        >
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>
        {/*  Account Start Date */}
        <Form.Item
          name="accountStartDate"
          label="Account Start Date"
          rules={[
            { required: true, message: "Please select account start date" },
          ]}
        >
          <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
        </Form.Item>

        {/*  Maturity Date (Optional) */}
        <Form.Item name="maturityDate" label="Maturity Date (Optional)">
          <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
