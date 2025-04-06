import { Modal, Button, Divider } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

export default function DeleteSavingsAccountModal({
  visible,
  onClose,
  onConfirm,
  loading,
  accountName,
  savingsType,
  amount,
  runningBalance,
  savingsIcon,
}) {
  return (
    <Modal open={visible} onCancel={onClose} footer={null} centered>
      <div className="space-y-2 py-2">
        <h2 className="text-xl font-semibold text-red-600 flex items-center justify-center gap-2">
          <ExclamationCircleOutlined className="text-2xl" /> Delete Savings
          Account
        </h2>

        <p className="text-gray-600 dark:text-gray-400 text-sm">
          <span className="font-medium text-base text-black dark:text-white">
            {accountName}
          </span>
        </p>

        {/* Info box */}
        <div className="border border-gray-500 rounded-md p-4 text-left text-sm space-y-3 max-w-md mx-auto">
          <div className="flex justify-between items-center">
            <span className="text-black-500 dark:text-black-300 font-medium">
              Account Type:
            </span>
            <span className="flex items-center gap-2 font-semibold">
              {savingsIcon && <span className="text-xl">{savingsIcon}</span>}
              {savingsType}
            </span>
          </div>
          <hr />
          <div className="flex justify-between">
            <span className="text-black-500 dark:text-black-300 font-medium">
              Initial Balance:
            </span>
            <span className="text-blue-600 dark:text-blue-400 font-semibold">
              ₹{amount?.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-black-500 dark:text-black-300 font-medium">
              Current Balance:
            </span>
            <span className="text-green-600 dark:text-green-400 font-semibold">
              ₹{runningBalance?.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Warning */}
        <p className="p-4 text-red-600 font-medium text-sm flex items-start justify-start gap-1">
          <ExclamationCircleOutlined className="pt-0.5" /> All transactions
          related to this account will also be permanently deleted.
          <br />
        </p>

        <div className="flex justify-center gap-4 pt-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button danger type="primary" loading={loading} onClick={onConfirm}>
            Delete Account
          </Button>
        </div>
      </div>
    </Modal>
  );
}
