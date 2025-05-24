import React, { useEffect, useState } from "react";
import { Modal, Table, Spin } from "antd";
import axios from "axios";
import dayjs from "dayjs";

const columns = [
  {
    title: "Date",
    dataIndex: "date",
    key: "date",
    render: (value) => dayjs(value).format("DD MMM YYYY"),
  },
  {
    title: "Category",
    dataIndex: "category",
    key: "category",
  },
  {
    title: "Amount (₹)",
    dataIndex: "amount",
    key: "amount",
    render: (amount) => `₹${amount}`,
  },
  {
    title: "Description",
    dataIndex: "description",
    key: "description",
  },
];

const ViewExpensesModal = ({ visible, onClose, bill }) => {
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (visible && bill) {
      fetchTransactions();
    }
  }, [visible, bill]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/bills/${bill?._id}`);
      setTransactions(res.data.transactions || []);
    } catch (err) {
      console.error("Failed to fetch transactions", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={`Bill Expenses for ${bill?.name}`}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      {loading ? (
        <Spin />
      ) : transactions.length === 0 ? (
        <p>No transactions found for this bill.</p>
      ) : (
        <Table
          columns={columns}
          dataSource={transactions}
          rowKey="_id"
          pagination={false}
        />
      )}
    </Modal>
  );
};

export default ViewExpensesModal;
