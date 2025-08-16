import { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Row,
  Col,
  message,
  Button
} from "antd";
import dayjs from "dayjs";
import { PiArrowCircleUpFill, PiArrowCircleDownFill } from "react-icons/pi";
import { getIconComponent } from "@/utils/getIcons";

const { Option } = Select;

export default function EditTransactionModal({
  visible,
  onClose,
  transaction,
  onUpdate,
}) {

  const [form] = Form.useForm();
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);


  // Fetch accounts and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accountsRes, categoriesRes] = await Promise.all([
          fetch("/api/accounts/account"),
          fetch("/api/categories/category"),
        ]);

        const accountsData = await accountsRes.json();
        const categoriesData = await categoriesRes.json();

        setAccounts(accountsData.accounts);
        setCategories(categoriesData.categories);
      } catch (error) {
        message.error("Failed to load accounts or categories");
      }
    };

    if (visible) {
      fetchData();
      form.setFieldsValue({
        ...transaction,
        accountId: transaction.accountId && transaction.accountId._id,
        date: dayjs(transaction.date),
      });
    }
  }, [visible, transaction]);

  const handleSubmit = async (values) => {

    let selectedCategory = categories.find((cat) => `${cat.icon} ${cat.name}` === values.category);
    if (!selectedCategory) {
      selectedCategory = categories.find((cat) => cat.name === values.category);
    }

    const formattedValues = {
      ...values,
      category: `${selectedCategory.icon} ${selectedCategory.name}`,
      date: values.date.toISOString(),
    };

    setLoading(true);

    try {
      const res = await fetch(`/api/transactions/transaction?id=${transaction._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedValues),
      });

      if (!res.ok) throw new Error("Failed to update transaction");

      message.success("Transaction updated successfully!");
      onUpdate();
      onClose();
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Edit Transaction"
      open={visible}
      width={700}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={() => form.submit()}
        >
          Update
        </Button>,
      ]}
    >
      <Form layout="vertical" form={form} onFinish={handleSubmit}>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item name="type" label="Transaction Type" rules={[{ required: true }]}>
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
          </Col>
          <Col xs={24} sm={12}>
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
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {cat.icon} {cat.name}
                    </span>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="accountId"
              label="Account"
              rules={[{ required: true }]}
            >
              <Select
                placeholder="Select account"
                showSearch
                optionFilterProp="label"
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }

                disabled
              >
                {accounts.map((acc) => (
                  <Option key={acc._id} value={acc._id} label={acc.name}>
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {acc.icon && (
                        <span style={{ color: acc.color }}>
                          {getIconComponent(acc.icon)({
                            size: 18,
                            color: acc.color,
                          })}
                        </span>
                      )}
                      {/* Account Name & Balance */}
                      <span className="flex-1">
                        {acc.name}{" "}
                        <span className="text-gray-500">
                          (₹{acc.balance.toFixed(2)})
                        </span>
                      </span>
                    </span>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="amount"
              label="Amount (₹)"
              rules={[{ required: true }]}
            >
              <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item name="description" label="Description">
              <Input />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item name="date" label="Date" rules={[{ required: true }]}>
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
