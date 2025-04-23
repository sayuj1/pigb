import {
  Modal,
  Table,
  Button,
  InputNumber,
  Form,
  message,
  Popconfirm,
  DatePicker,
} from "antd";
import { useState } from "react";
import axios from "axios";
import dayjs from "dayjs";

export default function LoanTransactionsModal({ loan, onClose, onUpdated }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editingRow, setEditingRow] = useState(null); // row ID in edit mode
  const [editValues, setEditValues] = useState({}); // temp values for editing

  const handleAddPayment = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      await axios.post(`/api/loans/payments?loanId=${loan._id}`, {
        amount: values.amount,
        date: values.date.toISOString(),
      });
      message.success("Payment added");
      form.resetFields();
      form.setFieldValue("date", dayjs());
      onUpdated();
    } catch (err) {
      message.error("Failed to add payment");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePayment = async (paymentId) => {
    try {
      setDeleteLoading(true);
      await axios.delete(
        `/api/loans/payments?loanId=${loan._id}&paymentId=${paymentId}`
      );
      message.success("Payment deleted");
      onUpdated();
    } catch (err) {
      message.error("Failed to delete payment");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSaveEdit = async (paymentId) => {
    const { amount, date } = editValues;
    try {
      setEditLoading(true);
      await axios.put(
        `/api/loans/payments?loanId=${loan._id}&paymentId=${paymentId}`,
        {
          amount,
          date: date.toISOString(),
        }
      );
      message.success("Payment updated");
      setEditingRow(null);
      setEditValues({});
      onUpdated();
    } catch (err) {
      message.error("Failed to update payment");
    } finally {
      setEditLoading(false);
    }
  };

  const columns = [
    {
      title: "Amount",
      dataIndex: "amount",
      render: (amount, record) => {
        const isEditing = editingRow === record._id;
        return isEditing ? (
          <InputNumber
            min={1}
            value={editValues.amount}
            onChange={(value) =>
              setEditValues((prev) => ({ ...prev, amount: value }))
            }
          />
        ) : (
          amount
        );
      },
    },
    {
      title: "Date",
      dataIndex: "date",
      render: (date, record) => {
        const isEditing = editingRow === record._id;
        return isEditing ? (
          <DatePicker
            value={dayjs(editValues.date)}
            format="DD-MM-YYYY"
            onChange={(value) =>
              setEditValues((prev) => ({
                ...prev,
                date: value,
              }))
            }
          />
        ) : (
          dayjs(date).format("DD-MM-YYYY")
        );
      },
    },
    {
      title: "Action",
      render: (_, record) => {
        const isEditing = editingRow === record._id;
        return (
          <div style={{ display: "flex", gap: 8 }}>
            {isEditing ? (
              <>
                <Button
                  type="primary"
                  size="small"
                  onClick={() => handleSaveEdit(record._id)}
                  loading={editLoading}
                >
                  Save
                </Button>
                <Button
                  size="small"
                  onClick={() => {
                    setEditingRow(null);
                    setEditValues({});
                  }}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                size="small"
                onClick={() => {
                  setEditingRow(record._id);
                  setEditValues({
                    amount: record.amount,
                    date: dayjs(record.date),
                  });
                }}
              >
                Edit
              </Button>
            )}
            <Popconfirm
              title="Are you sure you want to delete this payment?"
              onConfirm={() => handleDeletePayment(record._id)}
              okText="Yes"
              cancelText="No"
            >
              <Button danger size="small">
                Delete
              </Button>
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  return (
    <Modal
      open={!!loan}
      title={`Loan Payments - ${loan.borrowerName || loan.lenderName}`}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <Form
        form={form}
        layout="inline"
        onFinish={handleAddPayment}
        initialValues={{ date: dayjs() }}
      >
        <Form.Item name="amount" rules={[{ required: true }]}>
          <InputNumber
            min={1}
            placeholder="Payment amount"
            style={{ width: 150 }}
          />
        </Form.Item>
        <Form.Item name="date">
          <DatePicker
            format="DD-MM-YYYY"
            style={{ width: 160 }}
            onChange={(value) => {
              if (!value) {
                form.setFieldValue("date", dayjs());
              }
            }}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Add Payment
          </Button>
        </Form.Item>
      </Form>

      <Table
        loading={editLoading || deleteLoading}
        className="mt-4"
        dataSource={loan.payments}
        columns={columns}
        rowKey="_id"
        pagination={false}
      />
    </Modal>
  );
}
