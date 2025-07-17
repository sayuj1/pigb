import { useEffect, useState } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  InputNumber,
  message,
  DatePicker,
  Select
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import AddTransactionModal from "./AddTransactionModal";
import { PiPlus, PiMinus } from "react-icons/pi";
import { getIconComponent } from "@/utils/getIcons";
import EditTransactionModal from "./EditTransactionModal";
import DeleteTransactionModal from "./DeleteTransacationModal";
import dayjs from "dayjs";
import rangePresets from "@/utils/rangePresets";
import useDebounce from "@/hooks/useDebounce";

const { RangePicker } = DatePicker;

const { Search } = Input;

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [filters, setFilters] = useState({
    search: "",
    minAmount: "",
    maxAmount: "",
    sortBy: "date",
    sortOrder: "desc",
    startDate: dayjs().startOf("month").toISOString(),
    endDate: dayjs().endOf("month").toISOString(),
    type: "",
    accountId: [], // array of selected account IDs
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [deleteTransaction, setDeleteTransaction] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 500);
  const debouncedMinAmount = useDebounce(filters.minAmount, 500);
  const debouncedMaxAmount = useDebounce(filters.maxAmount, 500);
  const [accountOptions, setAccountOptions] = useState([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await fetch("/api/accounts/account"); // adjust endpoint if needed
        const data = await res.json();
        setAccountOptions(data.accounts || []);
      } catch (err) {
        message.error("Failed to load accounts");
      }
    };
    fetchAccounts();
  }, []);

  // Fetch Transactions
  const fetchTransactions = async (params = {}) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: params.current || pagination.current,
        limit: params.pageSize || pagination.pageSize,
        search: debouncedSearch,
        minAmount: debouncedMinAmount || "",
        maxAmount: debouncedMaxAmount || "",
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        startDate: filters.startDate,
        endDate: filters.endDate,
        type: filters.type || "",
        ...(filters.accountId.length && {
          accountId: filters.accountId.join(","),
        }),
      }).toString();

      const res = await fetch(`/api/transactions/transaction?${query}`);
      const data = await res.json();

      setTransactions(data.transactions);
      setPagination((prev) => ({ ...prev, total: data.pagination.totalItems }));
    } catch (error) {
      message.error("Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  // Handle Table Change (Sorting & Pagination)
  const handleTableChange = (pagination, filters, sorter) => {
    console.log(filters);
    setPagination({
      current: pagination.current,
      pageSize: pagination.pageSize,
    });
    setFilters((prev) => ({
      ...prev,
      sortBy: sorter.field || "date",
      sortOrder: sorter.order === "ascend" ? "asc" : "desc",
      type: filters.type?.[0] || "", // 👈 enforce single value
    }));
  };

  // Handle Search & Filters
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  // Handle Delete Transaction
  const handleDelete = async () => {
    setConfirmLoading(true);
    try {
      const res = await fetch(
        `/api/transactions/transaction?id=${deleteTransaction._id}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) throw new Error("Failed to delete transaction");

      message.success("Transaction deleted successfully!");
      setDeleteTransaction(null);
      fetchTransactions();
    } catch (error) {
      message.error(error.message);
    } finally {
      setConfirmLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [
    pagination.current,
    pagination.pageSize,
    filters.sortBy,
    filters.sortOrder,
    filters.startDate,
    filters.endDate,
    debouncedSearch,
    debouncedMinAmount,
    debouncedMaxAmount,
    filters.type,
    filters.accountId
  ]);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, search: debouncedSearch }));
    setPagination((prev) => ({ ...prev, current: 1 })); // reset to page 1
  }, [debouncedSearch]);

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      {/* Filters & Search */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <Input
          placeholder="Search by description or category"
          allowClear
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          style={{ width: 300 }}
        />

        <RangePicker
          format="DD-MM-YYYY"
          presets={rangePresets}
          value={[dayjs(filters.startDate), dayjs(filters.endDate)]}
          onChange={(dates) => {
            if (!dates) {
              // Reset to current month
              const startOfMonth = dayjs().startOf("month").toISOString();
              const endOfMonth = dayjs().endOf("month").toISOString();
              setFilters((prev) => ({
                ...prev,
                startDate: startOfMonth,
                endDate: endOfMonth,
              }));
              setPagination((prev) => ({ ...prev, current: 1 }));
              return;
            }

            // Custom date range
            setFilters((prev) => ({
              ...prev,
              startDate: dates[0].startOf("day").toISOString(),
              endDate: dates[1].endOf("day").toISOString(),
            }));
            setPagination((prev) => ({ ...prev, current: 1 }));
          }}
        />

        <Select
          mode="multiple"
          placeholder="Filter by Account"
          allowClear
          style={{ minWidth: 250, maxWidth: 400 }}
          value={filters.accountId}
          onChange={(value) => {
            setFilters((prev) => ({ ...prev, accountId: value }));
            setPagination((prev) => ({ ...prev, current: 1 }));
          }}
          options={accountOptions.map((acc) => ({
            label: <Space>
              {getIconComponent(acc.icon)({
                size: 20,
                color: acc.color,
              })}
              <span className="font-semibold">{acc?.name || "N/A"}</span>
            </Space>,
            value: acc._id,
          }))}
        />

        {/* <InputNumber
          placeholder="Min Amount"
          onChange={(value) => handleFilterChange("minAmount", value)}
          style={{ width: 120 }}
        />
        <InputNumber
          placeholder="Max Amount"
          onChange={(value) => handleFilterChange("maxAmount", value)}
          style={{ width: 120 }}
        /> */}
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
        >
          Add Income/Expense
        </Button>
      </div>

      {/* Transactions Table */}
      <Table
        columns={[
          {
            title: "Type",
            dataIndex: "type",
            filters: [
              { text: "Income", value: "income" },
              { text: "Expense", value: "expense" },
            ],
            filteredValue: filters.type ? [filters.type] : null,
            filterMultiple: false, // 👈 ONLY ONE SELECTION ALLOWED
            onFilter: (value) => value === filters.type,
            render: (type) => (
              <span
                className={
                  type === "income" ? "text-green-500" : "text-red-500"
                }
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </span>
            ),
          },
          { title: "Category", dataIndex: "category" },
          { title: "Description", dataIndex: "description" },
          {
            title: "Amount (₹)",
            dataIndex: "amount",
            sorter: true,
            render: (amount, record) => {
              const isIncome = record.type === "income";
              return (
                <span
                  className={isIncome ? "text-green-500" : "text-red-500"}
                  style={{ display: "flex", alignItems: "center", gap: 4 }}
                >
                  {isIncome ? <PiPlus /> : <PiMinus />}
                  {isIncome ? `₹${amount.toFixed(2)}` : `₹${amount.toFixed(2)}`}
                </span>
              );
            },
          },
          {
            title: "Account",
            dataIndex: "accountId",
            render: (account) => (
              <Space>
                {getIconComponent(account.icon)({
                  size: 20,
                  color: account.color,
                })}
                <span className="font-semibold">{account?.name || "N/A"}</span>
              </Space>
            ),
          },
          {
            title: "Date",
            dataIndex: "date",
            sorter: true,
            render: (date) =>
              new Date(date).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }),
          },
          {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
              <Space>
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setSelectedTransaction(record);
                    setEditModalVisible(true);
                  }}
                />
                <Button
                  type="link"
                  icon={<DeleteOutlined />}
                  danger
                  onClick={() => setDeleteTransaction(record)} //setDeleteTransaction(record)
                />
              </Space>
            ),
          },
        ]}
        dataSource={transactions}
        rowKey="_id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
        }}
        onChange={handleTableChange}
      />

      {/* Add Income/Expense Modal */}
      <AddTransactionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAddTransaction={fetchTransactions}
      />
      <EditTransactionModal
        visible={editModalVisible}
        transaction={selectedTransaction}
        onClose={() => setEditModalVisible(false)}
        onUpdate={fetchTransactions}
      />
      {/* Delete Confirmation Modal */}
      <DeleteTransactionModal
        transaction={deleteTransaction}
        open={!!deleteTransaction}
        confirmLoading={confirmLoading}
        onCancel={() => setDeleteTransaction(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
