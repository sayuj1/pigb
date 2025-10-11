import { Modal, Tabs, message } from "antd";
import { useState } from "react";
import SingleTransactionForm from "./SingleTransactionForm";
import BulkTransactionForm from "./BulkTransactionForm";
import BetaTag from "../resuable/BetaTag";
import { useAccount } from "@/context/AccountContext";

const { TabPane } = Tabs;

export default function AddTransactionModal({
  visible,
  onClose,
  onAddTransaction,
  initialValues = {},
}) {
  const [activeTab, setActiveTab] = useState("single");
  const { accounts, fetchAccounts } = useAccount();

  const handleClose = () => {
    setActiveTab("single"); // reset tab on close
    onClose();
  };

  return (
    <Modal
      title="Add Transaction"
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={800}
      style={{ top: 40 }}
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Single Transaction" key="single">
          <SingleTransactionForm
            onClose={handleClose}
            onAddTransaction={onAddTransaction}
            initialValues={initialValues}
            accounts={accounts}
            fetchAccounts={fetchAccounts}
          />
        </TabPane>
        <TabPane tab={<>Bulk Transactions <BetaTag /></>} key="bulk">
          <BulkTransactionForm
            onClose={handleClose}
            onAddTransaction={onAddTransaction}
            accounts={accounts}
            fetchAccounts={fetchAccounts}
          />
        </TabPane>
      </Tabs>
    </Modal>
  );
}
