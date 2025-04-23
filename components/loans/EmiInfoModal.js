import { Modal, Descriptions, Tag } from "antd";

export default function EmiInfoModal({ loan, onClose }) {
  if (!loan) return null;

  const {
    amount = 0,
    interestRate = 0,
    tenureMonths = 0,
    emiAmount = 0,
  } = loan;

  const totalPayable = tenureMonths && emiAmount ? emiAmount * tenureMonths : 0;
  const totalInterest = totalPayable - amount;

  const formatCurrency = (value) =>
    `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 0 })}`;

  return (
    <Modal
      open={!!loan}
      onCancel={onClose}
      footer={null}
      title="📊 EMI Details"
      centered
    >
      <Descriptions
        bordered
        column={1}
        labelStyle={{ fontWeight: "600", width: 150 }}
        contentStyle={{ textAlign: "right" }}
        size="middle"
      >
        <Descriptions.Item label="Loan Amount">
          <Tag color="blue">{formatCurrency(amount)}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Interest Rate">
          {interestRate ? (
            <Tag color="purple">{interestRate}%</Tag>
          ) : (
            <Tag color="green">0% (No Cost EMI)</Tag>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Tenure">
          {tenureMonths ? (
            <Tag color="geekblue">{tenureMonths} months</Tag>
          ) : (
            <Tag color="default">—</Tag>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Monthly EMI">
          {emiAmount ? (
            <Tag color="volcano">{formatCurrency(emiAmount)}</Tag>
          ) : (
            <Tag color="default">—</Tag>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Total Payable">
          {totalPayable ? (
            <Tag color="magenta">{formatCurrency(totalPayable)}</Tag>
          ) : (
            <Tag color="default">—</Tag>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Total Interest">
          {tenureMonths && interestRate ? (
            <Tag color="red">{formatCurrency(totalInterest)}</Tag>
          ) : (
            <Tag color="green">₹0</Tag>
          )}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
}
