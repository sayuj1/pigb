import {
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  Button,
  Tag,
  message
} from "antd";
import { useEffect } from "react";
import dayjs from "dayjs";
import { getIconComponent } from "@/utils/getIcons";

export default function AddSavingsTransactionModal({
  visible,
  onClose,
  onSuccess,
  savingsId,
  savingsAccount,
  editingTransaction,
  accounts,
  isAccountsLoading,
}) {
  const [form] = Form.useForm();
  const isEditing = !!editingTransaction;
  const transactionType = Form.useWatch("type", form);

  const handleFinish = async (values) => {
    try {
      let payload = {
        ...values,
        savingsId,
        date: values.date.toISOString(),
        accountId: values.accountId || null, // handle optional
      };
      if (isEditing) {
        payload = {
          ...payload,
          _id: editingTransaction._id,
        };
      }

      const url = isEditing
        ? `/api/savings/saving-transaction`
        : "/api/savings/saving-transaction";

      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        return message.error(errorData.message || "Failed to add transaction to savings account");
      }

      form.resetFields();
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (visible) {
      if (editingTransaction) {
        // console.log("edit ", editingTransaction);
        form.setFieldsValue({
          date: dayjs(editingTransaction.date),
          type: editingTransaction.type,
          amount: editingTransaction.amount,
          description: editingTransaction.description,
          accountId: editingTransaction.accountId?._id || null,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          date: dayjs(),
          type: "deposit",
        });
      }
    }
  }, [visible, editingTransaction]);

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      title={isEditing ? "Edit Transaction" : "Add Savings Transaction"}
      footer={null}
      centered
    >
      {savingsAccount && (
        <div className="mb-4 border rounded p-4">
          <div className="text-lg font-semibold uppercase">
            {savingsAccount.accountName}
          </div>
          <div className="text-sm text-gray-500">
            {savingsAccount.savingsType}
          </div>
          <div className="flex gap-6 mt-2 text-sm">
            <div>
              <span className="text-gray-500">Initial Balance: </span>
              <span className="font-medium text-blue-600">
                ₹{savingsAccount.amount?.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Current Balance: </span>
              <span className="font-medium text-green-600">
                ₹{savingsAccount.runningBalance?.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ type: "deposit" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2">

          <Form.Item
            name="type"
            // label="Transaction Type"
            label={
              <div>
                <div className="font-medium text-gray-800">Transaction Type</div>
                <div className="text-sm text-gray-500">
                  {transactionType === "loss" && (
                    <div className="text-sm text-rose-500 italic">
                      Select this when your investment has lost value or incurred charges.
                    </div>
                  )}
                </div>
              </div>
            }
            rules={[{ required: true }]}
            className="md:col-span-2"
          >
            <Select disabled={isEditing}>
              <Select.Option value="deposit">
                <Tag color="green">Deposit</Tag>
              </Select.Option>

              <Select.Option value="withdrawal">
                <Tag color="red">Withdrawal</Tag>
              </Select.Option>
              <Select.Option value="interest">
                <Tag color="blue">Interest</Tag>
              </Select.Option>
              <Select.Option value="loss">
                <Tag color="volcano">Loss</Tag>
              </Select.Option>
            </Select>


          </Form.Item>

          {(transactionType === "deposit" || transactionType === "withdrawal") && (
            <Form.Item
              name="accountId"
              label={
                <div>
                  <div className="font-medium text-gray-800">Linked Account</div>
                  <div className="text-sm text-gray-500">
                    {transactionType === "deposit"
                      ? "Money will be debited from this account."
                      : "Money will be credited to this account."}
                  </div>
                </div>
              }

              rules={[
                ({ getFieldValue }) => ({
                  required:
                    getFieldValue("type") === "deposit" ||
                    getFieldValue("type") === "withdrawal",
                  message: "Please select an account for deposit/withdrawal",
                }),
              ]}
              className="md:col-span-2"
            >
              <Select
                placeholder="Select account"
                loading={isAccountsLoading}
                // optionLabelProp="label"
                disabled={isAccountsLoading || isEditing}
              >
                {accounts.map((acc) => (
                  <Select.Option key={acc._id} value={acc._id} label={acc.name} >
                    <div className="flex items-center gap-2">
                      <span>
                        {getIconComponent(acc.icon)({
                          size: 18,
                          color: acc.color,
                        })}
                      </span>
                      <span className="flex-1">
                        {acc.name}
                        <span className="text-gray-500 ml-1">
                          (₹{acc.balance.toFixed(2)})
                        </span>
                      </span>
                    </div>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}


          <Form.Item
            name="date"
            label="Transaction Date"
            rules={[{ required: true }]}
          >
            <DatePicker className="w-full" format="DD-MM-YYYY" />
          </Form.Item>



          <Form.Item
            name="amount"
            label="Amount (INR)"
            rules={[{ required: true, type: "number", min: 0.01 }]}
            className="md:col-span-1"
          >
            <InputNumber style={{ width: "100%" }} prefix="₹" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Remarks"
            className="md:col-span-1"
          >
            <Input />
          </Form.Item>
        </div>

        <Form.Item>
          <div className="flex justify-end gap-2 mt-2">
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              {isEditing ? "Update Transaction" : "Add Transaction"}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
}
