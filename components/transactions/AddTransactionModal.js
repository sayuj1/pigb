import { getIconComponent } from "@/utils/getIcons";
import {
  Modal,
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
import { useEffect, useState } from "react";
import { PiArrowCircleUpFill, PiArrowCircleDownFill } from "react-icons/pi";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc"; // Import UTC plugin

dayjs.extend(utc); // Enable UTC support

const { Option } = Select;

export default function AddTransactionModal({
  visible,
  onClose,
  onAddTransaction,
  initialValues = {},
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        billDate: dayjs(),
        ...initialValues,
      });
    }
  }, [visible, initialValues]);

  // Fetch Categories & Accounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, accountsRes] = await Promise.all([
          fetch("/api/categories/category"),
          fetch("/api/accounts/account"),
        ]);

        const categoriesData = await categoriesRes.json();
        const accountsData = await accountsRes.json();

        setCategories(categoriesData.categories);
        setAccounts(accountsData.accounts);
      } catch (error) {
        message.error("Failed to load categories and accounts");
      }
    };

    if (visible) fetchData();
  }, [visible]);

  // Handle Form Submission
  const handleFinish = async (values) => {
    // Find the selected category object
    const selectedCategory = categories.find(
      (cat) => cat.name === values.category
    );

    const formattedValues = {
      ...values,
      category: `${selectedCategory.icon} ${values.category}`,
      billDate: dayjs(values.billDate)
        .startOf("day") // Ensures time is at the start of the day (00:00:00)
        .utc() // Converts to UTC
        .format(), // Formats it to ISO string (YYYY-MM-DDTHH:mm:ssZ)
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
      form.setFieldsValue({ billDate: dayjs() }); // Reset date to today
      onAddTransaction();
      onClose();
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Reset
  const handleReset = () => {
    form.resetFields();
    form.setFieldsValue({ billDate: dayjs() }); // Reset date to today
  };

  return (
    <Modal
      title="Add Transaction"
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
          loading={loading}
          onClick={() => form.submit()}
        >
          Add
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Row gutter={16}>
          {/* Left Column */}
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

          {/* Right Column */}
          <Col span={12}>
            <Form.Item
              name="amount"
              label="Amount"
              rules={[{ required: true }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Enter amount"
              />
            </Form.Item>

            <Form.Item
              name="accountId"
              label="Account"
              rules={[{ required: true }]}
            >
              <Select placeholder="Select account">
                {accounts.map((acc) => (
                  <Option key={acc._id} value={acc._id}>
                    <div className="flex items-center gap-2">
                      {/* Account Icon */}
                      <span>
                        {getIconComponent(acc.icon)({
                          size: 20,
                          color: acc.color,
                        })}
                      </span>

                      {/* Account Name & Balance */}
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

            <Form.Item
              name="billDate"
              label="Bill Date"
              initialValue={dayjs()} // Set today's date as default
            >
              <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
