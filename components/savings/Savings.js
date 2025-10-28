import { useEffect, useState } from "react";
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
  DatePicker,
  Row,
  Col,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
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
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

export default function SavingsAccounts() {
  const [savings, setSavings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    status: "active",
    savingsType: "",
    sortField: "createdAt",
    sortOrder: "desc",
    startDate: "",
    endDate: "",
    dateField: "createdAt", // 👈 NEW: filter field (createdAt or closedAt)
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [deletingAccount, setDeletingAccount] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [addingTransaction, setAddingTransaction] = useState(null);
  const [closingAccount, setClosingAccount] = useState(null);

  const router = useRouter();
  const { accounts, loading: isAccountsLoading, fetchAccounts } = useAccount();

  // 🔹 Fetch savings dynamically with filters
  const fetchSavings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(
        Object.entries(filters).filter(([_, v]) => v !== "")
      );

      const res = await fetch(`/api/savings/saving?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to load");

      setSavings(Array.isArray(data.savingsAccounts) ? data.savingsAccounts : []);
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
    fetchSavings();
  }, [filters]);

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

  const handleDateRangeChange = (dates) => {
    if (!dates) {
      setFilters((prev) => ({ ...prev, startDate: "", endDate: "" }));
      return;
    }
    dayjs().startOf("month").toISOString()
    setFilters((prev) => ({
      ...prev,
      startDate: dates[0].startOf("day").toISOString(),
      endDate: dates[1].endOf("day").toISOString(),
    }));
  };

  return (
    <div className="space-y-4">

      {/* 🔍 Filter Bar */}

      {/* <Card className="shadow-sm border border-gray-200 bg-white rounded-xl p-5"> */}
      <div className="flex flex-col gap-5">
        {/* 🎯 FILTER SECTION */}
        <div className="border border-gray-100 rounded-lg p-4 bg-gray-50/40">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Filters
            </h3>
          </div>

          <Row gutter={[12, 12]} align="middle">
            {/* 🔍 Search */}
            <Col xs={24} sm={12} md={8}>
              <Input
                placeholder="Search by account name or type"
                prefix={<SearchOutlined />}
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                allowClear
              />
            </Col>

            {/* Status */}
            <Col xs={12} sm={6} md={4}>
              <Select
                placeholder="Status"
                allowClear
                value={filters.status || undefined}
                onChange={(val) =>
                  setFilters((prev) => ({ ...prev, status: val || "" }))
                }
                style={{ width: "100%" }}
                options={[
                  { label: "Active", value: "active" },
                  { label: "Closed", value: "closed" },
                ]}
              />
            </Col>

            {/* Date Field */}
            <Col xs={12} sm={6} md={4}>
              <Select
                placeholder="Date Field"
                value={filters.dateField}
                onChange={(val) =>
                  setFilters((prev) => ({ ...prev, dateField: val }))
                }
                style={{ width: "100%" }}
                options={[
                  { label: "Created Date", value: "createdAt" },
                  { label: "Closed Date", value: "closedAt" },
                ]}
              />
            </Col>

            {/* Date Range */}
            <Col xs={24} sm={12} md={8}>
              <RangePicker
                style={{ width: "100%" }}
                onChange={handleDateRangeChange}
                value={
                  filters.startDate && filters.endDate
                    ? [dayjs(filters.startDate), dayjs(filters.endDate)]
                    : null
                }
              />
            </Col>
          </Row>
        </div>

        {/* ⚙️ SORTING + ACTIONS SECTION */}
        <div className="border border-gray-100 rounded-lg p-4 bg-gray-50/40">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Sorting & Actions
            </h3>
          </div>

          <Row gutter={[12, 12]} align="middle" justify="space-between">
            <Col xs={24} md={16}>
              <Row gutter={[12, 12]}>
                {/* Sort Field */}
                <Col xs={12} sm={6}>
                  <Select
                    placeholder="Sort By"
                    value={filters.sortField}
                    onChange={(val) =>
                      setFilters((prev) => ({ ...prev, sortField: val }))
                    }
                    options={[
                      { label: "Created Date", value: "createdAt" },
                      { label: "Account Name", value: "accountName" },
                      { label: "Balance", value: "runningBalance" },
                      { label: "Closed Date", value: "closedAt" },
                    ]}
                    style={{ width: "100%" }}
                  />
                </Col>

                {/* Sort Order */}
                <Col xs={12} sm={6}>
                  <Select
                    placeholder="Order"
                    value={filters.sortOrder}
                    onChange={(val) =>
                      setFilters((prev) => ({ ...prev, sortOrder: val }))
                    }
                    options={[
                      { label: "Descending", value: "desc" },
                      { label: "Ascending", value: "asc" },
                    ]}
                    style={{ width: "100%" }}
                  />
                </Col>
              </Row>
            </Col>

            {/* Action Button */}
            <Col xs={24} md={8} className="text-right">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsModalOpen(true)}
                className="rounded-lg font-medium"
                style={{ minWidth: 160 }}
              >
                Create Savings
              </Button>
            </Col>
          </Row>
        </div>
      </div>
      {/* </Card> */}



      {/* 💾 Savings Cards */}
      {
        loading ? (
          <div className="flex justify-center py-10">
            <Spin size="large" />
          </div>
        ) : savings.length === 0 ? (
          <Empty description="No savings accounts found" className="mt-5" />
        ) : (
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
                    <span className="text-gray-500">Account Created On</span>
                    <span className="font-medium text-blue-600">
                      {/* {formatCurrency(item.amount)} */}
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
        )
      }

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
