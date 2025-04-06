import { useEffect, useState } from "react";
import { Card, Input, Dropdown, Button, Empty, Spin, message } from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import AddSavingsAccountModal from "./AddSavingsAccountModal";
import { getCategoryColor } from "@/utils/getCategoryColor";
import EditSavingsAccountModal from "./EditSavingsAccountModal";
import DeleteSavingsAccountModal from "./DeleteSavingsAccountModal";
import AddSavingsTransactionModal from "./transactions/AddSavingsTransactionModal";
import { useRouter } from "next/router";

const SORT_OPTIONS = [
  { label: "Default (Newest)", value: "newest" },
  { label: "A-Z", value: "a-z" },
  { label: "Z-A", value: "z-a" },
  { label: "Lowest Balance", value: "lowest" },
  { label: "Highest Balance", value: "highest" },
];

export default function SavingsAccounts() {
  const [savings, setSavings] = useState([]);
  const [filteredSavings, setFilteredSavings] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [deletingAccount, setDeletingAccount] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [addingTransaction, setAddingTransaction] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchSavings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchText, sortOption, savings]);

  const handleMenuClick = ({ key }) => setSortOption(key);

  const fetchSavings = async () => {
    try {
      const res = await fetch("/api/savings/saving");
      const data = await res.json();
      console.log("data ", data);
      setSavings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch savings accounts:", error);
      setSavings([]);
    } finally {
      setLoading(false);
    }
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

  const applyFilters = () => {
    let result = [...savings];

    if (searchText) {
      const lowerSearch = searchText.toLowerCase();
      result = result.filter(
        (item) =>
          item.savingsType.toLowerCase().includes(lowerSearch) ||
          item.accountName.toLowerCase().includes(lowerSearch)
      );
    }

    result.sort((a, b) => {
      switch (sortOption) {
        case "a-z":
          return a.savingsType.localeCompare(b.savingsType);
        case "z-a":
          return b.savingsType.localeCompare(a.savingsType);
        case "lowest":
          return a.runningBalance - b.runningBalance;
        case "highest":
          return b.runningBalance - a.runningBalance;
        case "newest":
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    setFilteredSavings(result);
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
  };

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-grow">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search savings type..."
            onChange={(e) => setSearchText(e.target.value)}
            className="min-w-[200px] max-w-[250px]"
          />
          <Dropdown
            menu={{
              items: SORT_OPTIONS.map((opt) => ({
                key: opt.value,
                label: opt.label,
              })),
              onClick: handleMenuClick,
            }}
          >
            <Button icon={<FilterOutlined />}>
              Sort:{" "}
              {SORT_OPTIONS.find((opt) => opt.value === sortOption)?.label}
            </Button>
          </Dropdown>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
          className="w-full md:w-auto"
        >
          Create Savings Account
        </Button>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Spin size="large" />
        </div>
      ) : filteredSavings.length === 0 ? (
        <Empty description="No savings accounts found" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSavings.map((item) => (
            <Card
              key={item._id}
              variant="borderless"
              className={`shadow-md rounded-lg bg-white dark:bg-gray-900 border-l-4 ${getCategoryColor(
                item.savingsType
              )} `}
              title={
                <div className="flex flex-col">
                  <span className="text-lg font-semibold uppercase">
                    {item.accountName}
                  </span>
                  <span className="text-sm text-gray-500">
                    {item.savingsType}
                  </span>
                </div>
              }
              extra={
                <div className="flex gap-2">
                  <Button
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(item)}
                    type="text"
                  />
                  <Button
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    type="text"
                    onClick={() => setDeletingAccount(item)}
                  />
                </div>
              }
              actions={[
                <Button
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => setAddingTransaction(item)}
                  type="text"
                >
                  Add Transactions
                </Button>,
                <Button
                  size="small"
                  type="text"
                  onClick={() =>
                    router.push(`/savings/${item._id}/transactions`)
                  }
                >
                  View Transactions
                </Button>,
              ]}
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Initial Balance</span>
                  <span className="font-medium text-blue-600">
                    ₹{item.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Current Balance</span>
                  <span className="font-medium text-green-600">
                    ₹{item.runningBalance.toLocaleString()}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
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
      />
    </div>
  );
}
