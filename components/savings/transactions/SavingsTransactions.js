import { useRouter } from "next/router";
import { useEffect, useState, useCallback } from "react";
import {
  Table,
  Tag,
  Spin,
  Empty,
  Card,
  Button,
  DatePicker,
  Input,
  Space
} from "antd";
import dayjs from "dayjs";
import { ArrowLeftOutlined, PlusOutlined } from "@ant-design/icons";
import AddSavingsTransactionModal from "@/components/savings/transactions/AddSavingsTransactionModal";
import rangePresets from "@/utils/rangePresets";
import { debounce } from "lodash";
import { PiPlus, PiMinus } from "react-icons/pi";
import {
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import {
  PiArrowDownBold,
  PiArrowUpBold,
  PiCalendarBlank,
  PiMoney,
  PiNote,
} from "react-icons/pi";

import { Modal, Tooltip } from "antd";
import { getIconComponent } from "@/utils/getIcons";
import { formatCurrency } from "@/utils/formatCurrency";

const { confirm } = Modal;

const { RangePicker } = DatePicker;

export default function SavingsTransactions() {
  const router = useRouter();
  const { id } = router.query;

  const [transactions, setTransactions] = useState([]);
  const [savingAccount, setSavingAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [sorter, setSorter] = useState({ field: "date", order: "descend" });
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [isAccountsLoading, setIsAccountsLoading] = useState(true);

  // Fetch accounts from API
  const fetchAccounts = async () => {
    try {
      setIsAccountsLoading(true);
      const response = await fetch("/api/accounts/account");
      if (!response.ok) throw new Error("Failed to fetch accounts");

      const data = await response.json();
      setAccounts(data.accounts);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAccountsLoading(false);
    }
  };

  const [filters, setFilters] = useState({
    startDate: dayjs().startOf("month"),
    endDate: dayjs().endOf("month"),
    search: "",
  });

  const handleSearch = debounce((value) => {
    setFilters((prev) => ({
      ...prev,
      search: value,
    }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, 500);

  const renderTransactionDetails = (transaction) => {
    const isPositive =
      transaction.type === "deposit" || transaction.type === "interest";

    const typeColor =
      {
        deposit: "green",
        interest: "blue",
        withdrawal: "red",
      }[transaction.type] || "default";

    const TypeIcon = isPositive ? PiArrowDownBold : PiArrowUpBold;
    const amountColor = isPositive ? "text-green-700" : "text-red-600";

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        {/* Type */}
        <div className="flex items-center gap-2">
          <TypeIcon className="text-lg" />
          <span>
            <strong>Type:</strong>{" "}
            <Tag color={typeColor} className="capitalize">
              {transaction.type}
            </Tag>
          </span>
        </div>

        {/* Amount */}
        <div className="flex items-center gap-2">
          <PiMoney className={`text-lg ${amountColor}`} />
          <span>
            <strong>Amount:</strong>{" "}
            <span className={`font-medium ${amountColor}`}>
              ₹{transaction.amount.toLocaleString()}
            </span>
          </span>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2">
          <PiCalendarBlank className="text-lg text-blue-600" />
          <span>
            <strong>Transaction Date:</strong>{" "}
            {dayjs(transaction.date).format("DD-MMM-YYYY")}
          </span>
        </div>

        {/* Description */}
        {transaction.description && (
          <div className="flex items-center gap-2">
            <PiNote className="text-lg text-gray-500" />
            <span>
              <strong>Remarks:</strong>{" "}
              <span className="text-gray-600">{transaction.description}</span>
            </span>
          </div>
        )}

        {/* Warning */}
        <div className="sm:col-span-2 text-red-600 font-semibold mt-2">
          ⚠️ This action cannot be undone.
        </div>
      </div>
    );
  };

  const handleDelete = async (transaction) => {
    confirm({
      title: "Are you sure you want to delete this transaction?",
      icon: <ExclamationCircleOutlined />,
      content: renderTransactionDetails(transaction),
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          const res = await fetch(
            `/api/savings/saving-transaction?id=${transaction._id}`,
            {
              method: "DELETE",
            }
          );
          const data = await res.json();
          if (res.ok) {
            fetchData(); // Refresh transactions
          } else {
            console.error("Delete failed", data.message);
          }
        } catch (error) {
          console.error("Error deleting transaction", error);
        }
      },
    });
  };

  const fetchData = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("savingsId", id);
      params.append("page", pagination.current);
      params.append("limit", pagination.pageSize);
      params.append("sortBy", sorter.field || "date");
      params.append("sortOrder", sorter.order === "ascend" ? "asc" : "desc");

      if (filters.search) {
        params.append("search", filters.search);
      }

      if (filters.startDate && filters.endDate) {
        params.append("start", filters.startDate.startOf("day").toISOString());
        params.append("end", filters.endDate.endOf("day").toISOString());
      }

      const res = await fetch(`/api/savings/saving-transaction?${params}`);
      const data = await res.json();

      setTransactions(data.transactions || []);
      setSavingAccount(data.savings || null);
      setPagination((prev) => ({
        ...prev,
        total: data.pagination?.totalTransactions || 0,
      }));
    } catch (err) {
      console.error("Failed to fetch transactions", err);
    } finally {
      setLoading(false);
    }
  }, [
    id,
    pagination.current,
    pagination.pageSize,
    sorter.field,
    sorter.order,
    filters.startDate,
    filters.endDate,
    filters.search,
  ]);

  useEffect(() => {
    if (id) {
      fetchData();
      fetchAccounts();
    }
  }, [id, fetchData]);

  const handleTableChange = (pagination, _filters, sorter) => {
    setPagination({
      current: pagination.current,
      pageSize: pagination.pageSize,
    });
    setSorter({
      field: sorter.field || "date",
      order: sorter.order || "descend",
    });
  };

  const columns = [
    {
      title: "Transaction Date",
      dataIndex: "date",
      sorter: true,
      render: (date) => dayjs(date).format("DD-MMM-YYYY"),
    },
    {
      title: "Type",
      dataIndex: "type",
      render: (type) => {
        const colorMap = {
          deposit: "green",
          withdrawal: "red",
          interest: "blue",
          loss: "volcano"
        };
        return <Tag color={colorMap[type] || "default"}>{type}</Tag>;
      },
    },
    {
      title: "Amount",
      dataIndex: "amount",
      sorter: true,
      render: (amt, record) => {
        const isPositive =
          record.type === "deposit" || record.type === "interest";
        const color = isPositive ? "text-green-600" : "text-red-600";
        const Icon = isPositive ? PiPlus : PiMinus;

        return (
          <span className={`flex items-center gap-1 ${color}`}>
            <Icon />{formatCurrency(amt)}
          </span>
        );
      },
    },
    {
      title: "Account",
      dataIndex: "accountId",
      render: (account, record) => (
        record.type === "interest" ? (
          <span className="text-gray-500 italic">{savingAccount?.accountName} (From Bank)</span>
        ) : (<Space>
          {getIconComponent(account?.icon)({
            size: 20,
            color: account?.color,
          })}
          <span className="font-semibold">{account?.name || "N/A"}</span>
        </Space>)

      ),
    },
    {
      title: "Remarks",
      dataIndex: "description",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div className="flex gap-3">
          <Tooltip title="Edit">
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                // open modal with edit mode
                setEditingTransaction(record); // You'll need to manage this state
                setIsModalOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              icon={<DeleteOutlined />}
              danger
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-6">
      {/* Header Buttons */}
      <div className="flex justify-between items-center mb-4">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push("/savings")}
        >
          Back to Savings
        </Button>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
          disabled={!savingAccount}
        >
          Add Transaction
        </Button>
      </div>

      {/* Account Details */}
      <Card
        title={
          (
            <>
              <span className="font-bold">Account:</span>{" "}
              <span className="uppercase">{savingAccount?.accountName}</span>
            </>
          ) || "Savings Account"
        }
        style={{ marginBottom: "5px", border: "1px solid #d3d3d3" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <strong>Type:</strong> {savingAccount?.savingsType}
          </div>
          <div className="flex justify-between md:col-span-2">
            <div>
              <strong>Initial Balance:</strong>{" "}
              <span className="text-blue-600">
                {formatCurrency(savingAccount?.amount)}
              </span>
            </div>
            <div>
              <strong>Current Balance:</strong>{" "}
              <span className="text-green-600">
                {formatCurrency(savingAccount?.runningBalance)}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Transactions Table */}
      <Card
        style={{ marginBottom: "5px", border: "1px solid #d3d3d3" }}
        title="Transactions"
        extra={
          <div className="flex gap-4 items-center">
            <RangePicker
              format="DD-MM-YYYY"
              presets={rangePresets}
              value={[filters.startDate, filters.endDate]}
              onChange={(dates) => {
                if (!dates) {
                  const start = dayjs().startOf("month");
                  const end = dayjs().endOf("month");
                  setFilters((prev) => ({
                    ...prev,
                    startDate: start,
                    endDate: end,
                  }));
                  setPagination((prev) => ({ ...prev, current: 1 }));
                  return;
                }

                setFilters((prev) => ({
                  ...prev,
                  startDate: dates[0],
                  endDate: dates[1],
                }));
                setPagination((prev) => ({ ...prev, current: 1 }));
              }}
            />

            <Input.Search
              placeholder="Search remarks..."
              allowClear
              defaultValue={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: 250 }}
            />
          </div>
        }
      >
        {transactions.length === 0 ? (
          <Empty description="No transactions yet" />
        ) : (
          <Table
            bordered
            columns={columns}
            dataSource={transactions}
            rowKey="_id"
            onChange={handleTableChange}
            loading={loading}
            pagination={{
              ...pagination,
              showSizeChanger: true, // 👈 Enable page size change
              pageSizeOptions: ["10", "20", "50", "100"],
            }}
          />
        )}
      </Card>

      {/* Add Transaction Modal */}
      <AddSavingsTransactionModal
        visible={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null); // Clear editing state on close
        }}
        onSuccess={() => {
          fetchData();
          setEditingTransaction(null);
        }}
        savingsId={savingAccount?._id}
        savingsAccount={savingAccount}
        editingTransaction={editingTransaction} // Pass it to the modal
        accounts={accounts}
        isAccountsLoading={isAccountsLoading}
      />
    </div>
  );
}
