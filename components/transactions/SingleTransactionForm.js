import { useEffect, useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  message,
  Row,
  Col,
  Button,
} from "antd";
import { PiArrowCircleUpFill, PiArrowCircleDownFill } from "react-icons/pi";
import { getIconComponent } from "@/utils/getIcons";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
const { Option } = Select;

export default function SingleTransactionForm({
  onClose,
  onAddTransaction,
  initialValues = {},
  accounts,
  fetchAccounts,
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    form.setFieldsValue({
      billDate: dayjs(),
      ...initialValues,
    });
  }, [initialValues]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes] = await Promise.all([
          fetch("/api/categories/category"),
        ]);
        await fetchAccounts();

        const categoriesData = await categoriesRes.json();

        setCategories(categoriesData.categories);
      } catch (error) {
        message.error("Failed to load categories and accounts");
      }
    };

    fetchData();
  }, []);

  const handleFinish = async (values) => {
    const selectedCategory = categories.find(
      (cat) => cat.name === values.category
    );

    const formattedValues = {
      ...values,
      category: `${selectedCategory.icon} ${values.category}`,
      billDate: dayjs(values.billDate).startOf("day").utc().format(),
    };

    setLoading(true);
    try {
      const res = await fetch("/api/transactions/transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedValues),
      });

      if (!res.ok) throw new Error("Failed to add transaction");

      message.success("Transaction added successfully!");
      form.resetFields();
      form.setFieldsValue({ billDate: dayjs() });
      await fetchAccounts();
      onAddTransaction();
      onClose();
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    form.resetFields();
    form.setFieldsValue({ billDate: dayjs() });
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleFinish}>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="type"
            label="Transaction Type"
            rules={[{ required: true }]}
          >
            <Select placeholder="Select type" optionLabelProp="label">
              <Option
                value="income"
                label={
                  <span
                    style={{
                      color: "green",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <PiArrowCircleUpFill /> Income
                  </span>
                }
              >
                <span
                  style={{
                    color: "green",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <PiArrowCircleUpFill /> Income
                </span>
              </Option>
              <Option
                value="expense"
                label={
                  <span
                    style={{
                      color: "red",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <PiArrowCircleDownFill /> Expense
                  </span>
                }
              >
                <span
                  style={{
                    color: "red",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <PiArrowCircleDownFill /> Expense
                </span>
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true }]}
          >
            <Select
              showSearch
              placeholder="Select category"
              optionFilterProp="label"
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
            >
              {categories.map((cat) => (
                <Option key={cat._id} value={cat.name} label={cat.name}>
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    {cat.icon} {cat.name}
                  </span>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input placeholder="Enter description" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            name="accountId"
            label="Account"
            rules={[{ required: true }]}
          >
            <Select placeholder="Select account">
              {accounts.map((acc) => (
                <Option key={acc._id} value={acc._id}>
                  <div className="flex items-center gap-2">
                    <span>
                      {getIconComponent(acc.icon)({
                        size: 20,
                        color: acc.color,
                      })}
                    </span>
                    <span className="flex-1">
                      {acc.name}{" "}
                      <span className="text-gray-500">
                        (₹{acc.balance.toFixed(2)})
                      </span>
                    </span>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="billDate" label="Bill Date" initialValue={dayjs()}>
            <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
            <InputNumber style={{ width: "100%" }} placeholder="Enter amount" />
          </Form.Item>
        </Col>
      </Row>

      <div className="flex justify-end gap-2">
        <Button onClick={handleReset} danger>
          Reset
        </Button>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="primary" htmlType="submit" loading={loading}>
          Add
        </Button>
      </div>
    </Form>
  );
}
