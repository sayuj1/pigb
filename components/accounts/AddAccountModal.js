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
import { PlusOutlined } from "@ant-design/icons";
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
        throw new Error("Failed to add account");
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
        icon={<PlusOutlined />}
        onClick={() => setOpen(true)}
      >
        Add Account
      </Button>
      <Modal
        title="Add Account"
        open={open}
        onCancel={() => {
          setOpen(false);
          resetForm();
        }}
        footer={[
          <Button key="reset" onClick={resetForm} danger disabled={loading}>
            Reset
          </Button>,
          <Button
            key="cancel"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => form.submit()}
            loading={loading}
          >
            Create
          </Button>,
        ]}
        width={700}
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
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Account Name"
                rules={[{ required: true }]}
              >
                <Input placeholder="Enter account name" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="type"
                label="Account Type"
                rules={[{ required: true }]}
              >
                <Select
                  placeholder="Select account type"
                  onChange={(value) => setAccountType(value)}
                >
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
              <Col span={8}>
                <Form.Item
                  name="creditLimit"
                  label="Credit Limit"
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    placeholder="5000"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="creditUsed"
                  label="Credit Used"
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    placeholder="0.00"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="dueDate"
                  label="Due Date"
                  rules={[
                    { required: true, message: "Please select a due date" },
                  ]}
                >
                  <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
                </Form.Item>
              </Col>
            </Row>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Select Icon">
                <CustomIconPicker
                  selectedIcon={icon}
                  onChange={(selectedIcon) => setIcon(selectedIcon)}
                  key={formKey} // Force re-render on reset
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Icon Color">
                <ColorPresetSelector
                  selectedColor={iconColor}
                  onChange={(selectedColor) => setIconColor(selectedColor)}
                  key={formKey} // Force re-render on reset
                />
              </Form.Item>
            </Col>
          </Row>

          {accountType !== "credit card" && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="balance"
                  label="Initial Balance (INR)"
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    placeholder="0.00"
                  />
                </Form.Item>
              </Col>
            </Row>
          )}
        </Form>
      </Modal>
    </>
  );
}
