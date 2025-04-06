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
} from "antd";
import ColorPresetSelector from "../CustomColorPicker";
import CustomIconPicker from "../CustomIconPicker";

const { Option } = Select;

const ACCOUNT_TYPES = [
  "cash",
  "bank",
  "savings",
  "current",
  "wallet",
  "credit card",
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
      form.setFieldsValue(account);
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
      title="Edit Account"
      open={!!account}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose} disabled={loading}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={() => form.submit()}
          loading={loading}
        >
          Save Changes
        </Button>,
      ]}
      width={700}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Account Name"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="type"
              label="Account Type"
              rules={[{ required: true }]}
            >
              <Select onChange={(value) => setAccountType(value)}>
                {ACCOUNT_TYPES.map((type) => (
                  <Option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {accountType === "credit card" && (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="creditLimit"
                label="Credit Limit (INR)"
                rules={[{ required: true }]}
              >
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="creditUsed"
                label="Credit Used (INR)"
                rules={[{ required: true }]}
              >
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>
          </Row>
        )}

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Select Icon">
              <CustomIconPicker selectedIcon={icon} onChange={setIcon} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Icon Color">
              <ColorPresetSelector
                selectedColor={iconColor}
                onChange={setIconColor}
              />
            </Form.Item>
          </Col>
        </Row>

        {accountType !== "credit card" && (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="initialBalance"
                label="Initial Balance (INR)"
                rules={[{ required: true }]}
              >
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>
          </Row>
        )}
      </Form>
    </Modal>
  );
}
