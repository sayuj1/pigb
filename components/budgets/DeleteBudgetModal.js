import { Modal } from "antd";
import { ExclamationCircleOutlined, DeleteOutlined, CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const DeleteBudgetModal = ({ visible, onCancel, onConfirm, budget, confirmLoading }) => {
  if (!budget) return null;

  return (
    <Modal
      open={visible}
      title={
        <div className="flex items-center gap-3 text-red-600">
          <ExclamationCircleOutlined className="text-xl" />
          <span>Delete Budget</span>
        </div>
      }
      onOk={() => onConfirm(budget._id)}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      okText="Delete Budget"
      okButtonProps={{ danger: true, size: "large", icon: <DeleteOutlined /> }}
      cancelButtonProps={{ size: "large" }}
      centered
      width={450}
    >
      <div className="py-4">
        <div className="bg-red-50 p-4 rounded-lg mb-4 border border-red-100 text-red-700 text-sm">
          Are you sure you want to delete <strong>{budget.budgetName}</strong>? This action cannot be undone.
        </div>

        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Budget Details</span>
            <span className="text-xs py-1 px-2 bg-white rounded border border-gray-200 text-gray-600 font-medium">
              {budget.category}
            </span>
          </div>

          <div className="mb-3">
            <div className="text-lg font-bold text-gray-800">{budget.budgetName}</div>
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <CalendarOutlined />
              {dayjs(budget.startDate).format("MMM D")} - {dayjs(budget.endDate).format("MMM D, YYYY")}
            </div>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-gray-200">
            <div>
              <div className="text-xs text-gray-400 mb-0.5">Budget Limit</div>
              <div className="font-semibold text-gray-700">₹{budget.limitAmount.toLocaleString()}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400 mb-0.5">Spent So Far</div>
              <div className="font-semibold text-gray-700">₹{budget.spentAmount?.toLocaleString() || 0}</div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteBudgetModal;
