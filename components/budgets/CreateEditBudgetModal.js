import { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  Spin,
  message,
} from "antd";
import dayjs from "dayjs";

const CreateEditBudgetModal = ({
  visible,
  onClose,
  editingBudget,
  fetchBudgets,
}) => {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/categories/category");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err) {
      message.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) fetchCategories();
  }, [visible]);

  useEffect(() => {
    if (editingBudget && categories.length > 0) {
      // Parse category to get category name
      const matchedCategory = categories.find(
        (cat) => `${cat.icon} ${cat.name}` === editingBudget.category
      );

      form.setFieldsValue({
        budgetName: editingBudget.budgetName,
        category: matchedCategory?._id,
        limitAmount: editingBudget.limitAmount,
        dateRange: [
          dayjs(editingBudget.startDate),
          dayjs(editingBudget.endDate),
        ],
      });
    } else {
      form.resetFields();
    }
  }, [editingBudget, categories]);

  const handleOk = () => {
    form.validateFields().then(async (values) => {
      const selectedCategory = categories.find(
        (cat) => cat._id === values.category
      );

      const [startDate, endDate] = values.dateRange;
      const payload = {
        budgetName: values.budgetName,
        category: `${selectedCategory.icon} ${selectedCategory.name}`,
        limitAmount: values.limitAmount,
        startDate,
        endDate,
      };

      const isEditing = !!editingBudget;
      const url = isEditing
        ? `/api/budgets/budget?id=${editingBudget._id}`
        : "/api/budgets/budget";

      try {
        setSubmitting(true);
        const res = await fetch(url, {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (res.ok) {
          message.success(isEditing ? "Budget updated!" : "Budget added!");
          onClose();
          form.resetFields();
          fetchBudgets();
        } else {
          message.error(data.error || "Something went wrong");
        }
      } catch (err) {
        message.error("Something went wrong! Please try again");
      } finally {
        setSubmitting(false);
      }
    });
  };

  return (
    <Modal
      title={editingBudget ? "Edit Budget" : "Add Budget"}
      open={visible}
      onOk={handleOk}
      confirmLoading={submitting}
      okText={editingBudget ? "Update Budget" : "Add Budget"}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      centered
      width={600}
      okButtonProps={{ size: "large" }}
      cancelButtonProps={{ size: "large" }}
    >
      <Form layout="vertical" form={form} className="mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            name="budgetName"
            label="Budget Name"
            rules={[{ required: true }]}
          >
            <Input placeholder="e.g., Groceries" size="large" />
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true }]}
          >
            <Select
              showSearch
              placeholder="Select a category"
              loading={loading}
              optionFilterProp="label"
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
              size="large"
            >
              {categories.map((cat) => (
                <Select.Option key={cat._id} value={cat._id} label={cat.name}>
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {cat.icon} {cat.name}
                  </span>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            name="limitAmount"
            label="Limit Amount"
            rules={[{ required: true }]}
          >
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              prefix="₹"
              size="large"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
            />
          </Form.Item>

          <Form.Item
            name="dateRange"
            label="Date Range"
            rules={[{ required: true, message: "Please select a date range" }]}
          >
            <DatePicker.RangePicker
              style={{ width: "100%" }}
              format="DD-MM-YYYY"
              size="large"
            />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateEditBudgetModal;
