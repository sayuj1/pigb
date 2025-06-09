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
  Space,
} from "antd";
import { useEffect, useState } from "react";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { getIconComponent } from "@/utils/getIcons";
import dayjs from "dayjs";
import { PiArrowCircleUpFill, PiArrowCircleDownFill } from "react-icons/pi";

const { Option } = Select;

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
    const categoryObj = categories.find((cat) => cat.name === values.category);

    const sharedData = {
      type: values.type,
      accountId: values.accountId,
      category: `${categoryObj.icon} ${values.category}`,
      billDate: dayjs(values.billDate).startOf("day").utc().format(),
    };

    const transactions = values.transactions.map((item) => ({
      ...sharedData,
      amount: item.amount,
      description: item.description,
    }));

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
    // <div style={{ maxHeight: "60vh", overflowY: "auto", paddingRight: 8 }}>
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
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
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
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
        </Col>

        <Col span={12}>
          <Form.Item name="billDate" label="Bill Date" initialValue={dayjs()}>
            <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
          </Form.Item>
        </Col>
      </Row>

      <Form.List name="transactions" initialValue={[{}]}>
        {(fields, { add, remove }) => (
          <>
            <div
              style={{
                maxHeight: "30vh",
                overflowY: "auto",
                paddingRight: 8,
                marginBottom: 12,
                border: "1px solid #f0f0f0",
                borderRadius: 8,
                padding: 12,
              }}
            >
              {fields.map(({ key, name, ...restField }, index) => (
                <Row gutter={16} key={key} align="middle">
                  <Col span={10}>
                    <Form.Item
                      {...restField}
                      name={[name, "amount"]}
                      label={index === 0 ? "Amount" : ""}
                      rules={[{ required: true, message: "Enter amount" }]}
                    >
                      <InputNumber
                        style={{ width: "100%" }}
                        placeholder="Enter Amount"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={10}>
                    <Form.Item
                      {...restField}
                      name={[name, "description"]}
                      label={index === 0 ? "Description" : ""}
                    >
                      <Input placeholder="Description" />
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item
                      label={index === 0 ? " " : ""} // blank label for alignment
                      colon={false}
                    >
                      <Button
                        danger
                        icon={<MinusCircleOutlined />}
                        onClick={() => remove(name)}
                        disabled={fields.length === 1}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              ))}
            </div>

            <Form.Item>
              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
              >
                Add Transaction
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>

      <Form.Item>
        <div className="flex justify-end gap-2">
          <Button onClick={() => form.resetFields()} danger>
            Reset
          </Button>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Add All
          </Button>
        </div>
      </Form.Item>
    </Form>
    // </div>
  );
}
