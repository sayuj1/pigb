import { useEffect, useState, useCallback } from "react";

import {
  Table,
  Button,
  Input,
  Modal,
  message,
  Space,
  Tag,
  Tooltip,
  Descriptions,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { PiCurrencyInrBold } from "react-icons/pi";
import LoanFormModal from "./LoanFormModal";
import LoanTransactionsModal from "./LoanTransactionsModal";
import EmiInfoModal from "./EmiInfoModal";
import axios from "axios";
import { debounce } from "lodash";
import { CATEGORY_ICONS, LOAN_TYPE_ICONS } from "@/utils/getIcons";

export default function LoanManagement() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [transactionsModal, setTransactionsModal] = useState(null);
  const [emiModalLoan, setEmiModalLoan] = useState(null);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchLoans = async (params = {}) => {
    try {
      setLoading(true);
      const res = await axios.get("/api/loans/loan", {
        params: {
          search,
          page: params.page || pagination.current,
          limit: params.pageSize || pagination.pageSize,
        },
      });

      setLoans(res.data.loans);
      setPagination((prev) => ({
        ...prev,
        current: res.data.pagination.currentPage,
        pageSize: params.pageSize || prev.pageSize,
        total: res.data.pagination.totalLoans,
      }));

      if (transactionsModal) {
        const updatedLoan = res.data.loans.find(
          (loan) => loan._id === transactionsModal._id
        );
        if (updatedLoan) {
          setTransactionsModal(updatedLoan);
        }
      }
    } catch (err) {
      message.error("Failed to load loans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans({ page: 1 });
  }, [search]);

  const handleTableChange = (pagination) => {
    fetchLoans({
      page: pagination.current,
      pageSize: pagination.pageSize,
    });
  };

  const handleDelete = async (id, loan) => {
    Modal.confirm({
      title: "Are you sure you want to delete this loan?",
      content: (
        <Descriptions
          bordered
          size="small"
          column={1}
          labelStyle={{ fontWeight: "bold", width: 150 }}
          contentStyle={{ textAlign: "right" }}
        >
          <Descriptions.Item label="Loan Type">
            {loan.loanType === "taken" ? "Taken" : "Given"}
          </Descriptions.Item>
          <Descriptions.Item label="Name">
            {loan.loanType === "taken" ? loan.lenderName : loan.borrowerName}
          </Descriptions.Item>
          <Descriptions.Item label="Category">
            {loan.loanCategory}
          </Descriptions.Item>
          <Descriptions.Item label="Amount">
            ₹{loan.amount.toLocaleString()}
          </Descriptions.Item>
          {loan.interestRate ? (
            <Descriptions.Item label="Interest Rate">
              {loan.interestRate}%
            </Descriptions.Item>
          ) : null}
          {loan.tenureMonths ? (
            <Descriptions.Item label="Tenure">
              {loan.tenureMonths} months
            </Descriptions.Item>
          ) : null}
          <Descriptions.Item label="Status">
            {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
          </Descriptions.Item>
        </Descriptions>
      ),
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await axios.delete(`/api/loans/loan?id=${id}`);
          message.success("Loan deleted");
          fetchLoans();
        } catch (err) {
          message.error("Failed to delete");
        }
      },
    });
  };

  // Create a debounced version of the fetch function
  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearch(value);
    }, 500), // Adjust the debounce delay here (500ms is common)
    []
  );

  const columns = [
    {
      title: "Loan Name",
      render: (_, record) =>
        record.loanType === "taken"
          ? record.borrowerName || "—"
          : record.lenderName || "—",
      ellipsis: true,
    },
    {
      title: "Type",
      dataIndex: "loanType",
      render: (type) => (
        <Tag color={type === "taken" ? "volcano" : "green"}>
          <Space size={6}>
            {LOAN_TYPE_ICONS[type]}
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Space>
        </Tag>
      ),
    },
    {
      title: "Category",
      dataIndex: "loanCategory",
      render: (cat) => (
        <Tag color="geekblue">
          <Space size={6}>
            {CATEGORY_ICONS[cat] || <MdCategory />}
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </Space>
        </Tag>
      ),
    },
    {
      title: "Loan Amount",
      dataIndex: "amount",
      render: (amt) => (
        <span className="text-blue-600 font-semibold">
          ₹{amt.toLocaleString()}
        </span>
      ),
    },
    {
      title: "Interest",
      dataIndex: "interestRate",
      render: (rate) =>
        rate ? `${rate}%` : <span className="text-gray-400">—</span>,
    },
    {
      title: "Tenure (months)",
      dataIndex: "tenureMonths",
      render: (tenure) =>
        tenure ? tenure : <span className="text-gray-400">—</span>,
    },
    {
      title: "EMI",
      dataIndex: "emiAmount",
      render: (emi, record) =>
        emi ? (
          <Button
            type="link"
            onClick={() => setEmiModalLoan(record)}
            icon={<InfoCircleOutlined />}
          >
            ₹{emi.toLocaleString()}
          </Button>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      title: "Remaining",
      dataIndex: "remainingBalance",
      render: (balance) => (
        <span className="font-medium text-indigo-600">
          ₹{balance.toLocaleString()}
        </span>
      ),
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      render: (startDate) => {
        if (!startDate) return <span className="text-gray-400">—</span>;
        const date = new Date(startDate);
        return (
          <Tooltip title={date.toDateString()}>
            {date.toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </Tooltip>
        );
      },
    },
    {
      title: "End Date",
      dataIndex: "endDate",
      render: (endDate) => {
        if (!endDate) return <span className="text-gray-400">—</span>;
        const date = new Date(endDate);
        return (
          <Tooltip title={date.toDateString()}>
            {date.toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </Tooltip>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => {
        const statusColorMap = {
          ongoing: "processing",
          completed: "success",
          overdue: "error",
        };

        return (
          <Tag
            color={statusColorMap[status] || "default"}
            style={{ fontWeight: 500 }}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            type="default"
            icon={<PiCurrencyInrBold />}
            onClick={() => setTransactionsModal(record)}
          >
            Payments
          </Button>
          <Button
            size="small"
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingLoan(record);
              setShowFormModal(true);
            }}
          >
            Edit
          </Button>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id, record)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex mb-4 gap-2">
        <Input
          placeholder="Search by borrower or lender"
          prefix={<SearchOutlined />}
          onChange={(e) => debouncedSearch(e.target.value)} // Use the debounced search function
          style={{ width: "40%" }}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingLoan(null);
            setShowFormModal(true);
          }}
        >
          Add Loan
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={loans}
        rowKey="_id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
        }}
        onChange={handleTableChange}
        scroll={{ x: "max-content" }}
        rowClassName={(record) =>
          record.status === "overdue" ? "bg-red-50" : ""
        }
      />

      {showFormModal && (
        <LoanFormModal
          open={showFormModal}
          onCancel={() => setShowFormModal(false)}
          onSuccess={() => {
            fetchLoans();
            setShowFormModal(false);
          }}
          initialData={editingLoan}
        />
      )}

      {transactionsModal && (
        <LoanTransactionsModal
          loan={transactionsModal}
          onClose={() => setTransactionsModal(null)}
          onUpdated={fetchLoans}
        />
      )}

      {emiModalLoan && (
        <EmiInfoModal
          loan={emiModalLoan}
          onClose={() => setEmiModalLoan(null)}
        />
      )}
    </div>
  );
}
