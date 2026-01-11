import {
  Form,
  Select,
  Input,
  InputNumber,
  DatePicker,
  Button,
  Row,
  Col,
  message,
  Badge,
} from "antd";
import { useEffect, useState } from "react";
import { MinusCircleOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { getIconComponent } from "@/utils/getIcons";
import dayjs from "dayjs";
import { PiArrowCircleUpFill, PiArrowCircleDownFill } from "react-icons/pi";

const { Option } = Select;

const TransactionTypeSelector = ({ value, onChange }) => (
  <div className="grid grid-cols-2 gap-2">
    <div
      onClick={() => onChange("income")}
      className={`cursor-pointer rounded-lg p-2 border transition-all duration-200 flex items-center justify-center gap-2 ${value === "income"
          ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
          : "border-gray-200 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50/50"
        }`}
    >
      <PiArrowCircleUpFill
        className={`text-xl ${value === "income" ? "text-emerald-600" : "text-emerald-500"
          }`}
      />
      <span className="font-semibold text-sm">Income</span>
    </div>
    <div
      onClick={() => onChange("expense")}
      className={`cursor-pointer rounded-lg p-2 border transition-all duration-200 flex items-center justify-center gap-2 ${value === "expense"
          ? "border-rose-500 bg-rose-50 text-rose-700 shadow-sm"
          : "border-gray-200 bg-white text-gray-600 hover:border-rose-300 hover:bg-rose-50/50"
        }`}
    >
      <PiArrowCircleDownFill
        className={`text-xl ${value === "expense" ? "text-rose-600" : "text-rose-500"
          }`}
      />
      <span className="font-semibold text-sm">Expense</span>
    </div>
  </div>
);

export default function BulkTransactionForm({
  onClose,
  onAddTransaction,
  accounts,
  fetchAccounts,
}) {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes] = await Promise.all([
          fetch("/api/categories/category"),
        ]);
        await fetchAccounts();

        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData.categories);
      } catch {
        message.error("Failed to load categories and accounts");
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (values) => {
    const transactions = values.transactions.map((item) => {
      const categoryObj = categories.find((cat) => cat.name === item.category);
      return {
        type: item.type,
        accountId: item.accountId,
        category: `${categoryObj?.icon || ""} ${item.category}`,
        billDate: dayjs(item.billDate).startOf("day").utc().format(),
        amount: item.amount,
        description: item.description,
      };
    });

    setLoading(true);
    try {
      const res = await fetch("/api/transactions/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions }),
      });

      if (!res.ok) throw new Error("Failed to add bulk transactions");

      message.success("Bulk transactions added!");
      form.resetFields();
      await fetchAccounts();
      onAddTransaction();
      onClose();
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      <Form.List name="transactions" initialValue={[{}]}>
        {(fields, { add, remove }) => (
          <>
            <div
              className="space-y-4 p-3 rounded-lg border border-gray-200 bg-gray-50"
              style={{
                maxHeight: "55vh",
                overflowY: "auto",
                marginBottom: 16,
              }}
            >
              {fields.map(({ key, name, ...restField }, index) => (
                <div
                  key={key}
                  className="bg-white border-2 border-gray-200 rounded-xl p-4 relative shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Transaction Number Badge & Delete Button */}
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                    <Badge
                      count={`Transaction #${index + 1}`}
                      style={{
                        backgroundColor: "#1890ff",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    />
                    <Button
                      danger
                      type="text"
                      icon={<DeleteOutlined />}
                      onClick={() => remove(name)}
                      disabled={fields.length === 1}
                      size="small"
                    >
                      Remove
                    </Button>
                  </div>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        {...restField}
                        name={[name, "type"]}
                        label={<span className="text-sm font-medium text-gray-700">Transaction Type</span>}
                        rules={[{ required: true, message: 'Required' }]}
                      >
                        <TransactionTypeSelector />
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item
                        {...restField}
                        name={[name, "accountId"]}
                        label={<span className="text-sm font-medium text-gray-700">Account</span>}
                        rules={[{ required: true, message: 'Required' }]}
                      >
                        <Select placeholder="Select account" size="large">
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
                                  <span className="text-gray-500 text-xs">
                                    (₹{acc.balance.toFixed(2)})
                                  </span>
                                </span>
                              </div>
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        {...restField}
                        name={[name, "category"]}
                        label={<span className="text-sm font-medium text-gray-700">Category</span>}
                        rules={[{ required: true, message: 'Required' }]}
                      >
                        <Select
                          showSearch
                          placeholder="Select category"
                          optionFilterProp="label"
                          filterOption={(input, option) =>
                            option.label.toLowerCase().includes(input.toLowerCase())
                          }
                          size="large"
                        >
                          {categories.map((cat) => (
                            <Option key={cat._id} value={cat.name} label={cat.name}>
                              <span
                                style={{ display: "flex", alignItems: "center", gap: 8 }}
                              >
                                <span className="text-lg">{cat.icon}</span> {cat.name}
                              </span>
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item
                        {...restField}
                        name={[name, "billDate"]}
                        label={<span className="text-sm font-medium text-gray-700">Date</span>}
                        initialValue={dayjs()}
                      >
                        <DatePicker
                          style={{ width: "100%" }}
                          format="DD MMM, YYYY"
                          size="large"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        {...restField}
                        name={[name, "amount"]}
                        label={<span className="text-sm font-medium text-gray-700">Amount</span>}
                        rules={[{ required: true, message: "Required" }]}
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          placeholder="Enter amount"
                          size="large"
                          prefix="₹"
                          min={0}
                          precision={2}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        {...restField}
                        name={[name, "description"]}
                        label={<span className="text-sm font-medium text-gray-700">Description</span>}
                      >
                        <Input
                          placeholder="Description (optional)"
                          size="large"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              ))}
            </div>

            <Form.Item>
              <Button
                type="dashed"
                onClick={() => {
                  const values = form.getFieldValue("transactions") || [];
                  const last = values[values.length - 1] || {};
                  add({
                    ...last,
                    amount: undefined,
                    description: undefined,
                    billDate: last.billDate || dayjs()
                  });
                }}
                block
                icon={<PlusOutlined />}
                size="large"
                className="border-2 border-dashed hover:border-blue-400 hover:text-blue-500"
              >
                Add Another Transaction
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button onClick={() => form.resetFields()} size="large" className="px-6">
          Reset All
        </Button>
        <Button onClick={onClose} size="large" className="px-6">
          Cancel
        </Button>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          size="large"
          className="px-8 shadow-sm"
        >
          Add All Transactions
        </Button>
      </div>
    </Form>
  );
}
