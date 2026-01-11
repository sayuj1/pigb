import { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Row,
  Col,
  message,
  DatePicker,
} from "antd";
import { EditOutlined } from "@ant-design/icons";
import ColorPresetSelector from "../CustomColorPicker";
import CustomIconPicker from "../CustomIconPicker";
import dayjs from "dayjs";
import { PiBankDuotone, PiCreditCardDuotone, PiWalletDuotone, PiCurrencyDollarDuotone, PiHouseDuotone, PiTrendUpDuotone } from "react-icons/pi";

const { Option } = Select;

// Modern icon mapping for account types
const ACCOUNT_TYPE_ICONS = {
  cash: <PiWalletDuotone className="text-xl" />,
  bank: <PiBankDuotone className="text-xl" />,
  savings: <PiBankDuotone className="text-xl" />,
  current: <PiBankDuotone className="text-xl" />,
  wallet: <PiWalletDuotone className="text-xl" />,
  credit_card: <PiCreditCardDuotone className="text-xl" />,
  investment: <PiTrendUpDuotone className="text-xl" />,
  loan: <PiBankDuotone className="text-xl" />,
  general: <PiCurrencyDollarDuotone className="text-xl" />,
  mortgage: <PiHouseDuotone className="text-xl" />,
  insurance: <PiHouseDuotone className="text-xl" />,
  bonus: <PiCurrencyDollarDuotone className="text-xl" />,
  other: <PiCurrencyDollarDuotone className="text-xl" />,
};

const ACCOUNT_TYPES = [
  "cash",
  "bank",
  "savings",
  "current",
  "wallet",
  // "credit card",
  "investment",
  "loan",
  "general",
  "mortgage",
  "insurance",
  "bonus",
  "other",
];

export default function EditAccountModal({ account, onUpdate, onClose }) {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [iconColor, setIconColor] = useState(account?.color || "#00838F");
  const [icon, setIcon] = useState(account?.icon || "PiMoneyWavyDuotone");
  const [accountType, setAccountType] = useState(account?.type || "");

  useEffect(() => {
    if (account) {
      form.setFieldsValue({
        ...account,
        dueDate: account.dueDate ? dayjs(account.dueDate) : null,
      });
      setIconColor(account.color);
      setIcon(account.icon);
      setAccountType(account.type);
    }
  }, [account, form]);

  const handleFinish = async (values) => {
    setLoading(true);
    try {
      const updatedData = { ...values, iconColor, icon };
      const response = await fetch(`/api/accounts/account?id=${account._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error("Failed to update account");
      }

      const updatedAccount = await response.json();
      message.success("Account updated successfully!");
      onUpdate(updatedAccount.account);
      onClose();
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-blue-600">
          <EditOutlined className="text-xl" />
          <span className="font-semibold text-lg">Edit Account</span>
        </div>
      }
      open={!!account}
      onCancel={onClose}
      footer={null}
      width={700}
      centered
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        className="pt-2"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Left Column: Basic Details */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 h-full">
            <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
              Account Details
            </h4>

            <Form.Item
              name="name"
              label="Account Name"
              rules={[{ required: true }]}
            >
              <Input size="large" placeholder="e.g. Main Savings" className="rounded-lg" />
            </Form.Item>

            <Form.Item
              name="type"
              label="Account Type"
              rules={[{ required: true }]}
            >
              <Select
                onChange={(value) => setAccountType(value)}
                size="large"
                className="rounded-lg"
                listHeight={200}
              >
                {ACCOUNT_TYPES.map((type) => (
                  <Option key={type} value={type}>
                    <div className="flex items-center gap-2">
                      {ACCOUNT_TYPE_ICONS[type] || <PiWalletDuotone />}
                      <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {accountType !== "credit card" && (
              <Form.Item
                name="initialBalance"
                label="Initial Balance"
                rules={[{ required: true }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  size="large"
                  prefix="₹"
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  className="rounded-lg"
                />
              </Form.Item>
            )}

            {accountType === "credit card" && (
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="creditLimit"
                    label="Credit Limit"
                    rules={[{ required: true }]}
                  >
                    <InputNumber style={{ width: "100%" }} min={0} size="large" prefix="₹" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="creditUsed"
                    label="Credit Used"
                    rules={[{ required: true }]}
                  >
                    <InputNumber style={{ width: "100%" }} min={0} size="large" prefix="₹" />
                  </Form.Item>
                </Col>
              </Row>
            )}
          </div>

          {/* Right Column: Appearance */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 h-full">
            <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-purple-500 rounded-full"></span>
              Appearance
            </h4>

            <Form.Item label="Account Icon" className="mb-4">
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <CustomIconPicker selectedIcon={icon} onChange={setIcon} />
              </div>
            </Form.Item>

            <Form.Item label="Icon Color" className="mb-4">
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <ColorPresetSelector
                  selectedColor={iconColor}
                  onChange={setIconColor}
                />
              </div>
            </Form.Item>

            {accountType === "credit card" && (
              <Form.Item
                name="dueDate"
                label="Due Date"
                rules={[{ required: true, message: "Please select a due date" }]}
              >
                <DatePicker style={{ width: "100%" }} format="DD MMM, YYYY" size="large" />
              </Form.Item>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button size="large" onClick={onClose} disabled={loading} className="rounded-lg px-6">
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={() => form.submit()}
            loading={loading}
            size="large"
            className="rounded-lg px-8 shadow-sm"
            icon={<EditOutlined />}
          >
            Update Account
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
