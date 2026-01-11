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
import { EditOutlined } from "@ant-design/icons";

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

  const typeSelector = Form.useWatch('type', form);

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <EditOutlined className="text-blue-500" />
          <span>Edit Transaction</span>
        </div>
      }
      open={visible}
      width={900}
      onCancel={onClose}
      footer={null}
      centered
      className="edit-transaction-modal"
    >
      <Form layout="vertical" form={form} onFinish={handleSubmit}>
        {/* Transaction Type Selector - Modern Card Style */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Transaction Type *</label>
          <Form.Item
            name="type"
            rules={[{ required: true, message: 'Please select transaction type' }]}
            style={{ marginBottom: 0 }}
          >
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => form.setFieldsValue({ type: 'income' })}
                className={`cursor-pointer rounded-xl p-3 border-2 transition-all duration-200 ${typeSelector === 'income'
                    ? 'border-emerald-500 bg-emerald-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/50'
                  }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <PiArrowCircleUpFill className={`text-4xl ${typeSelector === 'income' ? 'text-emerald-600' : 'text-emerald-500'}`} />
                  <span className={`font-semibold ${typeSelector === 'income' ? 'text-emerald-700' : 'text-gray-700'}`}>
                    Income
                  </span>
                </div>
              </div>
              <div
                onClick={() => form.setFieldsValue({ type: 'expense' })}
                className={`cursor-pointer rounded-xl p-3 border-2 transition-all duration-200 ${typeSelector === 'expense'
                    ? 'border-rose-500 bg-rose-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-rose-300 hover:bg-rose-50/50'
                  }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <PiArrowCircleDownFill className={`text-4xl ${typeSelector === 'expense' ? 'text-rose-600' : 'text-rose-500'}`} />
                  <span className={`font-semibold ${typeSelector === 'expense' ? 'text-rose-700' : 'text-gray-700'}`}>
                    Expense
                  </span>
                </div>
              </div>
            </div>
          </Form.Item>
        </div>

        <Row gutter={24}>
          <Col span={12}>
            <div className="bg-gray-50 rounded-lg p-4 h-full border border-gray-100">
              <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-blue-500 rounded"></span>
                Transaction Details
              </h4>

              <Form.Item
                name="category"
                label={<span className="text-sm font-medium text-gray-700">Category</span>}
                rules={[{ required: true, message: 'Please select category' }]}
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
                      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span className="text-lg">{cat.icon}</span> {cat.name}
                      </span>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="description"
                label={<span className="text-sm font-medium text-gray-700">Description</span>}
              >
                <Input.TextArea
                  placeholder="Enter description (optional)"
                  rows={3}
                  className="resize-none"
                />
              </Form.Item>
            </div>
          </Col>

          <Col span={12}>
            <div className="bg-gray-50 rounded-lg p-4 h-full border border-gray-100">
              <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-indigo-500 rounded"></span>
                Payment Information
              </h4>

              <Form.Item
                name="accountId"
                label={<span className="text-sm font-medium text-gray-700">Account</span>}
                rules={[{ required: true, message: 'Please select account' }]}
              >
                <Select
                  placeholder="Select account"
                  showSearch
                  optionFilterProp="label"
                  filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                  disabled
                  size="large"
                >
                  {accounts.map((acc) => (
                    <Option key={acc._id} value={acc._id} label={acc.name}>
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

              <Form.Item
                name="amount"
                label={<span className="text-sm font-medium text-gray-700">Amount</span>}
                rules={[{ required: true, message: 'Please enter amount' }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  precision={2}
                  size="large"
                  prefix="₹"
                />
              </Form.Item>

              <Form.Item
                name="date"
                label={<span className="text-sm font-medium text-gray-700">Date</span>}
                rules={[{ required: true, message: 'Please select date' }]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD MMM, YYYY"
                  size="large"
                />
              </Form.Item>
            </div>
          </Col>
        </Row>

        <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-gray-200">
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
            Update Transaction
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
