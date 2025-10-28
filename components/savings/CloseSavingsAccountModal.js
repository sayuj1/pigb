import { useState, useEffect } from "react";
import { Modal, InputNumber, Select, DatePicker, Form, message } from "antd";
import dayjs from "dayjs";
import { getIconComponent } from "@/utils/getIcons";

export default function CloseSavingsAccountModal({
    visible,
    onClose,
    onSuccess,
    savingsAccount,
    accounts,
    isAccountsLoading,
}) {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            setLoading(true);
            const payload = {
                redeemedAmount: values.redeemedAmount,
                accountId: values.accountId,
                accountCloseDate: values.accountCloseDate?.toISOString(),
            };

            const res = await fetch(`/api/savings/saving?action=close&id=${savingsAccount._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const errorData = await res.json();
                return message.error(errorData.message || "Failed to close account");
            }

            message.success("Savings account closed successfully");
            form.resetFields();
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error("Close Savings Account Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (visible) {

            form.resetFields();
            form.setFieldsValue({
                redeemedAmount: savingsAccount?.runningBalance || 0,
                accountCloseDate: dayjs(),
            });

        }
    }, [visible]);

    return (
        <Modal
            title={`Close ${savingsAccount?.accountName}`}
            open={visible}
            onCancel={onClose}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Close Account"
            okButtonProps={{ danger: true }}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    redeemedAmount: savingsAccount?.runningBalance || 0,
                    accountCloseDate: dayjs(),
                }}
            >
                {/* Row: Current Balance & Redeemed Amount */}
                <div className="grid grid-cols-2 gap-4">
                    <Form.Item label="Current Balance" >
                        <InputNumber
                            style={{ width: "100%" }}
                            prefix="₹"
                            value={savingsAccount?.runningBalance || 0}
                            disabled
                        />
                    </Form.Item>

                    <Form.Item
                        name="redeemedAmount"
                        label="Redeemed Amount"
                        rules={[{ required: true, message: "Please enter redeemed amount" }]}
                    // className="mb-0"
                    >
                        <InputNumber
                            min={0}
                            style={{ width: "100%" }}
                            prefix="₹"
                            placeholder="Enter amount to redeem"
                        />
                    </Form.Item>
                </div>

                {/* Reactive Profit/Loss Indicator */}
                <Form.Item
                    noStyle
                    shouldUpdate={(prev, curr) => prev.redeemedAmount !== curr.redeemedAmount}

                >
                    {({ getFieldValue }) => {
                        const redeemed = getFieldValue("redeemedAmount") || 0;
                        const current = savingsAccount?.runningBalance || 0;
                        const diff = redeemed - current;

                        if (diff > 0) {
                            return (
                                <div className="text-green-600 text-sm mb-4">
                                    Note: Profit of ₹{diff.toFixed(2)} — this will be added as a profit transaction.
                                </div>
                            );
                        } else if (diff < 0) {
                            return (
                                <div className="text-red-600 text-sm mb-4">
                                    Note: Loss of ₹{Math.abs(diff).toFixed(2)} — this will be recorded as a loss transaction.
                                </div>
                            );
                        }
                        return null;
                    }}
                </Form.Item>

                {/* Transfer To Account */}
                <Form.Item
                    name="accountId"
                    label={
                        <div>
                            <div className="font-medium text-gray-800">Transfer To Account</div>
                            <div className="text-sm text-gray-500">
                                Select the account where the redeemed amount will be transferred
                            </div>
                        </div>
                    }
                    rules={[{ required: true, message: "Please select a destination account" }]}
                    className="mt-4"
                >
                    <Select
                        placeholder="Select account"
                        loading={isAccountsLoading}
                        disabled={isAccountsLoading}
                    >
                        {accounts.map((acc) => (
                            <Select.Option key={acc._id} value={acc._id} label={acc.name}>
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

                {/* Closure Date */}
                <Form.Item
                    name="accountCloseDate"
                    label="Closure Date"
                    rules={[{ required: true, message: "Please select account closure date" }]}
                >
                    <DatePicker className="w-full" format="DD-MM-YYYY" />
                </Form.Item>
            </Form>


        </Modal>
    );
}
