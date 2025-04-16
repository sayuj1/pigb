// components/budgets/DeleteBudgetModal.jsx
import { Modal } from "antd";
import dayjs from "dayjs";

const DeleteBudgetModal = ({ visible, onCancel, onConfirm, budget }) => {
  if (!budget) return null;

  return (
    <Modal
      open={visible}
      title={`Delete Budget: ${budget.budgetName}`}
      onOk={() => onConfirm(budget._id)}
      onCancel={onCancel}
      okText="Delete"
      okType="danger"
      cancelText="Cancel"
    >
      <p>
        <strong>Category:</strong> {budget.category}
      </p>
      <p>
        <strong>Date Range:</strong>{" "}
        {`${dayjs(budget.startDate).format("DD MMM YYYY")} - ${dayjs(
          budget.endDate
        ).format("DD MMM YYYY")}`}
      </p>
      <p>
        <strong>Limit:</strong> ₹{budget.limitAmount}
      </p>
      <p>
        <strong>Spent:</strong> ₹{budget.spentAmount || 0}
      </p>
      <p style={{ color: "red", marginTop: 12 }}>
        This action cannot be undone.
      </p>
    </Modal>
  );
};

export default DeleteBudgetModal;
