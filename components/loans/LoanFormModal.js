import React, { useEffect } from "react";
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
  Space,
  Tag,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { LOAN_CATEGORIES } from "@/contants/loanCategories";
import { LOAN_TYPES } from "@/contants/loanTypes";

dayjs.extend(utc);
dayjs.extend(timezone);

export default function LoanFormModal({
  open,
  onCancel,
  onSuccess,
  initialData,
}) {
  const [form] = Form.useForm();
  const isEdit = !!initialData;
  const startDate = Form.useWatch("startDate", form);
  const tenureMonths = Form.useWatch("tenureMonths", form);

  // Auto-set endDate when both startDate and tenureMonths are defined
  useEffect(() => {
    if (startDate && tenureMonths > 0) {
      const calculatedEndDate = dayjs(startDate).add(tenureMonths, "month");
      form.setFieldsValue({ endDate: calculatedEndDate });
    }
  }, [startDate, tenureMonths, form]);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    try {
      const payload = {
        ...values,
        startDate: values.startDate
          ? dayjs(values.startDate).toISOString()
          : null,
        endDate: values.endDate ? dayjs(values.endDate).toISOString() : null,
      };

      if (isEdit) {
        await axios.put(`/api/loans/loan?id=${initialData._id}`, payload);
        message.success("Loan updated");
      } else {
        await axios.post("/api/loans/loan", payload);
        message.success("Loan created");
      }

      onSuccess();
    } catch (err) {
      message.error("Something went wrong");
    }
  };

  return (
    <Modal
      open={open}
      title={isEdit ? "Edit Loan" : "Add Loan"}
      onCancel={onCancel}
      onOk={handleSubmit}
      okText={isEdit ? "Update" : "Create"}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          ...initialData,
          startDate: initialData?.startDate
            ? dayjs.utc(initialData.startDate).local()
            : null,
          endDate: initialData?.endDate
            ? dayjs.utc(initialData.endDate).local()
            : null,
        }}
      >
        <Row gutter={24}>
          {/* Left column */}
          <Col span={12}>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="loanType"
                  label="Loan Type"
                  rules={[{ required: true }]}
                >
                  <Select
                    placeholder="Select loan type"
                    style={{ width: "100%" }}
                  >
                    {LOAN_TYPES.map((type) => (
                      <Select.Option key={type.value} value={type.value}>
                        <Space>
                          <Tag
                            color={type.color}
                            style={{
                              color: "#000",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            {type.icon && (
                              <span style={{ marginRight: 8 }}>
                                {type.icon}
                              </span>
                            )}
                            {type.label}
                          </Tag>
                        </Space>
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  name="amount"
                  label="Amount"
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    className="w-full"
                    min={1}
                    placeholder="Loan amount"
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="interestRate" label="Interest Rate (%)">
                  <InputNumber
                    className="w-full"
                    min={0}
                    step={0.1}
                    placeholder="Optional"
                    style={{ width: "100%" }}
                    defaultValue={0}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>

          {/* Right column */}
          <Col span={12}>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  shouldUpdate={(prev, curr) => prev.loanType !== curr.loanType}
                  style={{ marginBottom: 0 }}
                >
                  {() => {
                    const type = form.getFieldValue("loanType");
                    return type === "taken" ? (
                      <Form.Item
                        name="borrowerName"
                        label="Borrower Name"
                        rules={[{ required: true }]}
                      >
                        <Input placeholder="Enter borrower name" />
                      </Form.Item>
                    ) : (
                      <Form.Item
                        name="lenderName"
                        label="Lender Name"
                        rules={[{ required: true }]}
                      >
                        <Input placeholder="Enter lender name" />
                      </Form.Item>
                    );
                  }}
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  name="loanCategory"
                  label="Category"
                  rules={[{ required: true }]}
                >
                  <Select
                    placeholder="Select category"
                    style={{ width: "100%" }}
                  >
                    {LOAN_CATEGORIES.map((cat) => (
                      <Select.Option key={cat.value} value={cat.value}>
                        <Space>
                          {cat.icon}
                          {cat.label}
                        </Space>
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item name="tenureMonths" label="Tenure (months)">
                  <InputNumber
                    className="w-full"
                    min={0}
                    placeholder="Optional"
                    style={{ width: "100%" }}
                    defaultValue={0}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>

          {/* Start and End Dates */}
          <Col span={12}>
            <Form.Item
              name="startDate"
              label="Start Date"
              rules={[
                { required: true, message: "Please select a start date" },
              ]}
            >
              <DatePicker
                className="w-full"
                placeholder="Optional"
                format="DD-MM-YYYY"
                allowClear
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="endDate" label="End Date">
              <DatePicker
                className="w-full"
                placeholder="Optional"
                format="DD-MM-YYYY"
                allowClear
                disabled={!!tenureMonths && tenureMonths > 0}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
