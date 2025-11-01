import { useEffect, useMemo, useState } from "react";
import {
  Card,
  Input,
  Dropdown,
  Button,
  Empty,
  Spin,
  message,
  Tag,
  Tooltip,
  Select,
  Pagination
} from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  StopOutlined,
  MoreOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/router";
import AddSavingsAccountModal from "./AddSavingsAccountModal";
import EditSavingsAccountModal from "./EditSavingsAccountModal";
import DeleteSavingsAccountModal from "./DeleteSavingsAccountModal";
import AddSavingsTransactionModal from "./transactions/AddSavingsTransactionModal";
import CloseSavingsAccountModal from "./CloseSavingsAccountModal";
import { getCategoryColor } from "@/utils/getCategoryColor";
import { formatCurrency } from "@/utils/formatCurrency";
import { useAccount } from "@/context/AccountContext";

// Field type mapping for smart order labels
const sortFieldTypeMap = {
  createdAt: "date",
  closedAt: "date",
  accountName: "string",
  runningBalance: "numeric",
};

export default function SavingsAccounts() {
  const [savings, setSavings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0); // 🆕 total count for pagination
  const [page, setPage] = useState(1); // 🆕 current page
  const [pageSize, setPageSize] = useState(6); // 🆕 items per page
  const [filters, setFilters] = useState({
    search: "",
    status: "active",
    savingsType: "",
    sortField: "createdAt",
    sortOrder: "desc",
    startDate: "",
    endDate: "",
    dateField: "createdAt",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [deletingAccount, setDeletingAccount] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [addingTransaction, setAddingTransaction] = useState(null);
  const [closingAccount, setClosingAccount] = useState(null);

  const router = useRouter();
  const { accounts, loading: isAccountsLoading, fetchAccounts } = useAccount();

  // Smart order label options
  const orderOptions = useMemo(() => {
    const type = sortFieldTypeMap[filters.sortField];
    switch (type) {
      case "date":
        return [
          { label: "Newest", value: "desc" },
          { label: "Oldest", value: "asc" },
        ];
      case "string":
        return [
          { label: "Descending (Z → A)", value: "desc" },
          { label: "Ascending (A → Z)", value: "asc" },
        ];
      case "numeric":
        return [
          { label: "Highest", value: "desc" },
          { label: "Lowest", value: "asc" },
        ];
      default:
        return [
          { label: "Descending", value: "desc" },
          { label: "Ascending", value: "asc" },
        ];
    }
  }, [filters.sortField]);

  // 🔹 Fetch savings dynamically with filters
  const fetchSavings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(
        Object.entries({ ...filters, page, limit: pageSize }).filter(([_, v]) => v !== "")
      );

      const res = await fetch(`/api/savings/saving?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to load");

      setSavings(Array.isArray(data.savingsAccounts) ? data.savingsAccounts : []);
      setTotal(data.total || 0); // 🆕 store total for pagination
    } catch (error) {
      console.error("Failed to fetch savings accounts:", error);
      message.error("Error fetching savings data");
      setSavings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    setPage(1); // reset to first page whenever filters change
  }, [filters]);

  useEffect(() => {
    fetchSavings();
  }, [filters, page, pageSize]);

  // Handle pagination change
  const handlePageChange = (newPage, newPageSize) => {
    setPage(newPage);
    setPageSize(newPageSize);
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await fetch(`/api/savings/saving?id=${deletingAccount._id}`, {
        method: "DELETE",
      });
      message.success("Savings account deleted");
      setDeletingAccount(null);
      fetchSavings();
    } catch (err) {
      console.error("Delete failed:", err);
      message.error("Failed to delete savings account");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 🔍 Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 bg-white p-3 rounded-lg shadow-sm">
        <Input
          style={{ width: 300 }}
          placeholder="Search by account name or type"
          prefix={<SearchOutlined />}
          value={filters.search}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, search: e.target.value }))
          }
          allowClear
        />

        <div className="flex gap-1.5 items-center">
          Account Status:
          <Select
            placeholder="Status"
            allowClear
            value={filters.status || undefined}
            onChange={(val) =>
              setFilters((prev) => ({ ...prev, status: val || "" }))
            }
            options={[
              { label: "Active", value: "active" },
              { label: "Closed", value: "closed" },
            ]}
            style={{ width: 140 }}
          />
        </div>

        <div className="flex gap-1.5 items-center">
          Sort By:
          <Select
            placeholder="Field"
            value={filters.sortField}
            onChange={(val) =>
              setFilters((prev) => ({
                ...prev,
                sortField: val,
                sortOrder: "", // reset when changing field
              }))
            }
            style={{ width: 160 }}
            options={[
              { label: "Created Date", value: "createdAt" },
              { label: "Closed Date", value: "closedAt" },
              { label: "Account Name", value: "accountName" },
              { label: "Balance", value: "runningBalance" },
            ]}
          />

          <Select
            placeholder="Order"
            value={filters.sortOrder || undefined}
            onChange={(val) =>
              setFilters((prev) => ({ ...prev, sortOrder: val }))
            }
            style={{ width: 180 }}
            options={orderOptions}
            disabled={!filters.sortField}
          />
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
          className="rounded-lg font-medium"
          style={{ minWidth: 160 }}
        >
          Create Savings
        </Button>
      </div>

      {/* 💾 Savings Cards */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Spin size="large" />
        </div>
      ) : savings.length === 0 ? (
        <Empty description="No savings accounts found" className="mt-5" />
      ) : (<>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-5">
          {savings.map((item) => (
            <Card
              key={item._id}
              className={`shadow-md rounded-lg bg-white dark:bg-gray-900 border-l-4 ${getCategoryColor(
                item.savingsType
              )}`}
              title={
                <div className="flex flex-col">
                  <Tooltip title={item.accountName} placement="topLeft">
                    <span className="text-lg font-semibold uppercase truncate max-w-[90%]">
                      {item.accountName}
                    </span>
                  </Tooltip>
                  <Tooltip title={item.savingsType} placement="topLeft">
                    <span className="text-sm text-gray-500 truncate max-w-[90%]">
                      {item.savingsType}
                    </span>
                  </Tooltip>
                </div>
              }
              extra={
                item.status === "closed" ? (
                  <Tag color="red" className="font-medium">
                    Closed
                  </Tag>
                ) : (
                  <Dropdown
                    trigger={["click"]}
                    menu={{
                      items: [
                        {
                          key: "edit",
                          label: "Edit",
                          icon: <EditOutlined />,
                          onClick: () => setEditingAccount(item),
                        },
                        {
                          key: "close",
                          label: "Close",
                          icon: <StopOutlined />,
                          onClick: () => setClosingAccount(item),
                        },
                        {
                          key: "delete",
                          label: "Delete",
                          icon: <DeleteOutlined />,
                          danger: true,
                          onClick: () => setDeletingAccount(item),
                        },
                      ],
                    }}
                    placement="bottomRight"
                  >
                    <Button type="text" icon={<MoreOutlined />} />
                  </Dropdown>
                )
              }
              actions={
                item.status === "closed"
                  ? [
                    <Button
                      key="delete"
                      size="small"
                      danger
                      type="link"
                      icon={<DeleteOutlined />}
                      onClick={() => setDeletingAccount(item)}
                    >
                      Delete Account
                    </Button>,
                    <Button
                      key="view"
                      size="small"
                      type="link"
                      icon={<EyeOutlined />}
                      onClick={() =>
                        router.push(`/savings/${item._id}/transactions`)
                      }
                    >
                      View Transactions
                    </Button>,
                  ]
                  : [
                    <Button
                      key="add"
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={() => setAddingTransaction(item)}
                      type="link"
                    >
                      Add Transactions
                    </Button>,
                    <Button
                      key="view"
                      size="small"
                      type="link"
                      icon={<EyeOutlined />}
                      onClick={() =>
                        router.push(`/savings/${item._id}/transactions`)
                      }
                    >
                      View Transactions
                    </Button>,
                  ]
              }
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Account Opened On</span>
                  <span className="font-medium text-blue-600">
                    {new Date(item.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {item.status !== "closed" && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Current Balance</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(item.runningBalance)}
                    </span>
                  </div>
                )}

                {item.status === "closed" && item.closedAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Account Closed On</span>
                    <span className="font-medium text-rose-500">
                      {new Date(item.closedAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
        {/* 🆕 Pagination Controls */}
        <div className="flex justify-start mt-6">
          <Pagination
            current={page}
            total={total}
            pageSize={pageSize}
            showSizeChanger
            pageSizeOptions={["6", "9", "12", "24"]}
            onChange={handlePageChange}
            showTotal={(t, range) =>
              `${range[0]}–${range[1]} of ${t} savings accounts`
            }
          />
        </div>
      </>
      )}

      {/* Modals */}
      <AddSavingsAccountModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchSavings}
      />
      <EditSavingsAccountModal
        visible={!!editingAccount}
        onClose={() => setEditingAccount(null)}
        onSuccess={fetchSavings}
        initialData={editingAccount}
      />
      <DeleteSavingsAccountModal
        visible={!!deletingAccount}
        onClose={() => setDeletingAccount(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        accountName={deletingAccount?.accountName}
        savingsType={deletingAccount?.savingsType}
        amount={deletingAccount?.amount}
        runningBalance={deletingAccount?.runningBalance}
      />
      <AddSavingsTransactionModal
        visible={!!addingTransaction}
        onClose={() => setAddingTransaction(null)}
        onSuccess={fetchSavings}
        savingsId={addingTransaction?._id}
        savingsAccount={addingTransaction}
        accounts={accounts}
        isAccountsLoading={isAccountsLoading}
      />
      <CloseSavingsAccountModal
        visible={!!closingAccount}
        onClose={() => setClosingAccount(null)}
        onSuccess={fetchSavings}
        savingsAccount={closingAccount}
        accounts={accounts}
        isAccountsLoading={isAccountsLoading}
      />
    </div>
  );
}
