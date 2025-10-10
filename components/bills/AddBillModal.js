"use client";

import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  Switch,
} from "antd";
import { getIconComponent } from "@/utils/getIcons";
import { isNumber } from "lodash";

const { Option } = Select;

const AddBillModal = ({ open, onCancel, onSubmit, form, accounts }) => {
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState(null);

  // Initialize state from form values on edit
  useEffect(() => {
    if (open) {
      const frequencyValue = form.getFieldValue("frequency");
      const isRec = !!frequencyValue;
      if (!isNaN(frequencyValue) && !isNaN(parseFloat(frequencyValue))) {
        setFrequency("custom");
        form.setFieldsValue({
          customFrequency: frequencyValue,
        });
        form.setFieldsValue({
          frequency: "custom",
        });
      } else {
        setFrequency(frequencyValue);
      }

      setIsRecurring(isRec);
    } else {
      setIsRecurring(false);
      setFrequency(null);
    }
  }, [open, form]);

  const isEdit = !!form.getFieldValue("_id");

  return (
    <Modal
      title={isEdit ? "Edit Bill" : "Add Bill"}
      open={open}
      onOk={onSubmit}
      onCancel={onCancel}
      okText={isEdit ? "Update" : "Add"}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="name" label="Bill Name" rules={[{ required: true }]}>
          <Input disabled={isEdit && form.getFieldValue("status") === "paid"} />
        </Form.Item>

        <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
          <InputNumber
            prefix="₹"
            style={{ width: "100%" }}
            disabled={isEdit && form.getFieldValue("status") === "paid"}
          />
        </Form.Item>

        <Form.Item name="dueDate" label="Due Date" rules={[{ required: true }]}>
          {/* {console.log(
            isEdit,
            form.getFieldValue("status") == "paid",
            isRecurring
          )} */}
          <DatePicker
            style={{ width: "100%" }}
            disabled={
              (isEdit && isRecurring) || form.getFieldValue("status") == "paid"
            }
          />
        </Form.Item>

        <Form.Item
          name="accountId"
          label="Account"
          rules={[{ required: true }]}
        >
          <Select
            labelInValue
            placeholder="Select account"
            optionLabelProp="label"
            disabled={isEdit && form.getFieldValue("status") === "paid"}
          >
            {accounts.map((acc) => (
              <Option
                key={acc._id}
                value={acc._id}
                label={
                  <div className="flex items-center gap-2">
                    <span>
                      {getIconComponent(acc.icon)({
                        size: 20,
                        color: acc.color,
                      })}
                    </span>
                    <span>{acc.name}</span>
                  </div>
                }
              >
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

        {/* Disable editing of recurring toggle in edit mode */}
        <Form.Item name="isRecurring" label="Recurring" valuePropName="checked">
          <Switch onChange={setIsRecurring} disabled={isEdit} />
        </Form.Item>

        {/* Frequency + custom frequency only shown when isRecurring is true and not in edit mode */}
        {isRecurring && (
          <>
            <Form.Item
              name="frequency"
              label="Frequency"
              rules={[{ required: true, message: "Frequency is required" }]}
            >
              <Select
                placeholder="Select frequency"
                allowClear
                onChange={(val) => setFrequency(val)}
              >
                <Option value="monthly">Monthly</Option>
                <Option value="quarterly">Quarterly</Option>
                <Option value="yearly">Yearly</Option>
                <Option value="custom">Custom</Option>
              </Select>
            </Form.Item>

            {frequency === "custom" && (
              <Form.Item
                name="customFrequency"
                label="Custom Frequency (in months)"
                rules={[
                  {
                    required: true,
                    message: "Enter custom frequency in months",
                  },
                ]}
              >
                <InputNumber
                  min={1}
                  style={{ width: "100%" }}
                  placeholder="Enter number of months"
                />
              </Form.Item>
            )}
          </>
        )}

        {/* Disable status editing in edit mode */}
        <Form.Item
          name="status"
          label="Status"
          initialValue="unpaid"
          rules={[{ required: true }]}
        >
          <Select disabled={isEdit}>
            <Option value="unpaid">Unpaid</Option>
            <Option value="paid">Paid</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddBillModal;
