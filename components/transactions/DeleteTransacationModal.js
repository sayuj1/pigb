// components/DeleteTransactionModal.js
import { Modal, Tag, Button } from "antd";
import { ExclamationCircleOutlined, WarningOutlined } from "@ant-design/icons";
import { getIconComponent } from "@/utils/getIcons";
import { PiArrowCircleUpFill, PiArrowCircleDownFill } from "react-icons/pi";
import dayjs from "dayjs";

export default function DeleteTransactionModal({
  transaction,
  open,
  confirmLoading,
  onCancel,
  onConfirm,
}) {
  if (!transaction) return null;

  const isIncome = transaction.type === "income";
  const [icon, ...categoryName] = (transaction.category || "").split(" ");

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <ExclamationCircleOutlined className="text-red-500 text-xl" />
          <span>Delete Transaction</span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      centered
      width={550}
      footer={[
        <Button key="cancel" onClick={onCancel} size="large">
          Cancel
        </Button>,
        <Button
          key="delete"
          type="primary"
          danger
          onClick={onConfirm}
          loading={confirmLoading}
          size="large"
          icon={<WarningOutlined />}
        >
          Delete Transaction
        </Button>,
      ]}
    >
      <div className="space-y-4">
        {/* Warning Message */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-700 text-sm font-medium mb-1 flex items-center gap-2">
            <WarningOutlined />
            Are you sure you want to delete this transaction?
          </p>
          <p className="text-red-600 text-xs">
            This action cannot be undone.
          </p>
        </div>

        {/* Transaction Details Card */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Transaction Details</h4>

          <div className="space-y-3">
            {/* Transaction Type & Amount */}
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
              <div className="flex items-center gap-2">
                {isIncome ? (
                  <PiArrowCircleUpFill className="text-2xl text-emerald-500" />
                ) : (
                  <PiArrowCircleDownFill className="text-2xl text-rose-500" />
                )}
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    {isIncome ? "Income" : "Expense"}
                  </p>
                  <p className={`text-lg font-bold ${isIncome ? "text-emerald-600" : "text-rose-600"}`}>
                    ₹{transaction.amount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="flex items-start gap-3 p-2">
              <span className="text-gray-500 text-sm min-w-[80px]">Category:</span>
              <div className="flex items-center gap-2">
                <span className="text-xl">{icon}</span>
                <span className="text-gray-700 font-medium">{categoryName.join(" ")}</span>
              </div>
            </div>

            {/* Description */}
            {transaction.description && (
              <div className="flex items-start gap-3 p-2">
                <span className="text-gray-500 text-sm min-w-[80px]">Description:</span>
                <span className="text-gray-700">{transaction.description}</span>
              </div>
            )}

            {/* Account */}
            <div className="flex items-start gap-3 p-2">
              <span className="text-gray-500 text-sm min-w-[80px]">Account:</span>
              <div className="flex items-center gap-2">
                {getIconComponent(transaction.accountId.icon) && (
                  <span>
                    {getIconComponent(transaction.accountId.icon)({
                      size: 20,
                      color: transaction.accountId.color,
                    })}
                  </span>
                )}
                <span className="text-gray-700 font-medium">{transaction.accountId.name}</span>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-start gap-3 p-2">
              <span className="text-gray-500 text-sm min-w-[80px]">Date:</span>
              <span className="text-gray-700">{dayjs(transaction.date).format("DD MMM, YYYY")}</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
