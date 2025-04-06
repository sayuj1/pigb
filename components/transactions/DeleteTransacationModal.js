// components/DeleteTransactionModal.js
import { Modal, Tag, Row, Col } from "antd";
import { getIconComponent } from "@/utils/getIcons";

export default function DeleteTransactionModal({
  transaction,
  open,
  confirmLoading,
  onCancel,
  onConfirm,
}) {
  return (
    <Modal
      title="Are you sure you want to delete this transaction?"
      open={open}
      onCancel={onCancel}
      onOk={onConfirm}
      confirmLoading={confirmLoading}
      okText="Yes, Delete"
      okType="danger"
      cancelText="No"
    >
      {transaction && (
        <div className="flex items-center gap-4">
          <div>
            <Row gutter={[12, 8]}>
              {transaction.description && (
                <>
                  <Col span={8}>
                    <strong>Description:</strong>
                  </Col>
                  <Col span={16}>{transaction.description}</Col>
                </>
              )}

              <Col span={8}>
                <strong>Type:</strong>
              </Col>
              <Col span={16}>
                <Tag color={transaction.type === "income" ? "green" : "red"}>
                  {transaction.type.charAt(0).toUpperCase() +
                    transaction.type.slice(1)}
                </Tag>
              </Col>

              <Col span={8}>
                <strong>Amount:</strong>
              </Col>
              <Col span={16}>₹{transaction.amount.toLocaleString()}</Col>

              <Col span={8}>
                <strong>Bill Date:</strong>
              </Col>
              <Col span={16}>
                {new Date(transaction.date).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </Col>

              <Col span={8}>
                <strong>Account:</strong>
              </Col>
              <Col span={16}>
                <div className="flex items-center gap-1">
                  {getIconComponent(transaction.accountId.icon) && (
                    <span>
                      {getIconComponent(transaction.accountId.icon)({
                        size: 32,
                        color: transaction.accountId.color,
                      })}
                    </span>
                  )}
                  {transaction.accountId.name}
                </div>
              </Col>
            </Row>
          </div>
        </div>
      )}
      <p className="mt-4 text-red-500">This action cannot be undone.</p>
    </Modal>
  );
}
