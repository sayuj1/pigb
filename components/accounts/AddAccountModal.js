import { useState } from "react";
import {
  Modal,
  Button,
  Input,
  Select,
  Form,
  InputNumber,
  Row,
  Col,
  message,
  DatePicker,
} from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";
import ColorPresetSelector from "../CustomColorPicker";
import CustomIconPicker from "../CustomIconPicker";
import { PiBankDuotone, PiCreditCardDuotone, PiWalletDuotone, PiCurrencyDollarDuotone, PiHouseDuotone, PiTrendUpDuotone } from "react-icons/pi";

const { Option } = Select;

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

export default function AddAccountModal({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [formKey, setFormKey] = useState(Date.now()); // Force re-render on reset
  const [accountType, setAccountType] = useState(undefined);
  const [iconColor, setIconColor] = useState("#00838F");
  const [icon, setIcon] = useState("PiMoneyWavyDuotone");

  const resetForm = () => {
    form.resetFields();
    setIconColor("#00838F");
    setIcon("PiMoneyWavyDuotone");
    setAccountType(undefined);
    setFormKey(Date.now()); // Force re-render
  };

  const handleFinish = async (values) => {
    setLoading(true);
    try {
      const response = await fetch("/api/accounts/account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          iconColor,
          icon,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData?.message || "Failed to add account";
        throw new Error(errorMessage);
      }

      const newAccount = await response.json();
      message.success("Account added successfully!");

      onAdd?.(newAccount.account); // Update UI in Accounts component
      setOpen(false);
      resetForm();
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        type="primary"
        icon={<PlusCircleOutlined />}
        onClick={() => setOpen(true)}
        size="large"
        className="rounded-full shadow-md hover:shadow-lg transition-all"
      >
        <span className="hidden sm:inline">Add Account</span>
      </Button>
      <Modal
        title={
          <div className="flex items-center gap-2 text-blue-600">
            <PlusCircleOutlined className="text-xl" />
            <span className="font-semibold text-lg">Add New Account</span>
          </div>
        }
        open={open}
        onCancel={() => {
          setOpen(false);
          resetForm();
        }}
        footer={null}
        width={700}
        centered
      >
        <Form
          key={formKey} // Forces the form to reset properly
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          onValuesChange={(changedValues) => {
            if (changedValues.type) {
              setAccountType(changedValues.type);
            }
          }}
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
                  placeholder="Select account type"
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
                  name="balance"
                  label="Initial Balance"
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    placeholder="0.00"
                    size="large"
                    prefix="₹"
                    className="rounded-lg"
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
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
                      <InputNumber
                        style={{ width: "100%" }}
                        min={0}
                        placeholder="5000"
                        size="large"
                        prefix="₹"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="creditUsed"
                      label="Credit Used"
                      rules={[{ required: true }]}
                    >
                      <InputNumber
                        style={{ width: "100%" }}
                        min={0}
                        placeholder="0.00"
                        size="large"
                        prefix="₹"
                      />
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

              <Form.Item label="Select Icon" className="mb-4">
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <CustomIconPicker
                    selectedIcon={icon}
                    onChange={(selectedIcon) => setIcon(selectedIcon)}
                    key={formKey} // Force re-render on reset
                  />
                </div>
              </Form.Item>

              <Form.Item label="Icon Color" className="mb-4">
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <ColorPresetSelector
                    selectedColor={iconColor}
                    onChange={(selectedColor) => setIconColor(selectedColor)}
                    key={formKey} // Force re-render on reset
                  />
                </div>
              </Form.Item>

              {accountType === "credit card" && (
                <Form.Item
                  name="dueDate"
                  label="Due Date"
                  rules={[
                    { required: true, message: "Please select a due date" },
                  ]}
                >
                  <DatePicker style={{ width: "100%" }} format="DD MMM, YYYY" size="large" />
                </Form.Item>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              key="reset"
              onClick={resetForm}
              danger
              disabled={loading}
              size="large"
              className="rounded-lg px-6"
            >
              Reset
            </Button>
            <Button
              key="cancel"
              onClick={() => setOpen(false)}
              disabled={loading}
              size="large"
              className="rounded-lg px-6"
            >
              Cancel
            </Button>
            <Button
              key="submit"
              type="primary"
              onClick={() => form.submit()}
              loading={loading}
              size="large"
              className="rounded-lg px-8 shadow-sm"
              icon={<PlusCircleOutlined />}
            >
              Create Account
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}
