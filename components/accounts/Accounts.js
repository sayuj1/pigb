import { useState, useEffect } from "react";
import {
  Input,
  Button,
  Dropdown,
  Spin,
  Alert,
  Card,
  Typography,
  Modal,
  message,
  Statistic,
  Empty,
  Tooltip
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined
} from "@ant-design/icons";
import { getIconComponent } from "@/utils/getIcons";
import AddAccountModal from "./AddAccountModal";
import EditAccountModal from "./EditAccountModal";
import { useAccount } from "@/context/AccountContext";
import { PiBankDuotone, PiWalletDuotone, PiCreditCardDuotone } from "react-icons/pi";

const { Title, Text } = Typography;

const SORT_OPTIONS = [
  { label: "Default (Newest)", value: "default" },
  { label: "A-Z", value: "az" },
  { label: "Z-A", value: "za" },
  { label: "Lowest Balance", value: "lowest" },
  { label: "Highest Balance", value: "highest" },
];

export default function Accounts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("default");
  const [editAccount, setEditAccount] = useState(null);
  const [deleteAccount, setDeleteAccount] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const { accounts, setAccounts, loading, error, fetchAccounts } = useAccount();

  useEffect(() => {
    fetchAccounts();
  }, [])

  // Handle search and sorting
  const filteredAndSortedAccounts = () => {
    let filtered = accounts.filter((account) =>
      account.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    switch (sortOption) {
      case "az":
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
      case "za":
        return filtered.sort((a, b) => b.name.localeCompare(a.name));
      case "lowest":
        return filtered.sort((a, b) => a.balance - b.balance);
      case "highest":
        return filtered.sort((a, b) => b.balance - a.balance);
      default:
        return filtered.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleMenuClick = ({ key }) => {
    setSortOption(key);
  };

  const handleAddAccount = (newAccount) => {
    setAccounts((prev) => [...prev, newAccount]);
  };

  const handleUpdateAccount = (updatedAccount) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc._id === updatedAccount._id ? updatedAccount : acc))
    );
  };

  const handleDelete = async () => {
    if (!deleteAccount) return;
    setConfirmLoading(true);

    try {
      const response = await fetch(
        `/api/accounts/account?id=${deleteAccount._id}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Failed to delete account");

      setAccounts((prev) =>
        prev.filter((account) => account._id !== deleteAccount._id)
      );
      message.success("Account deleted successfully!");
      setDeleteAccount(null); // Close modal
    } catch (error) {
      message.error(error.message);
    } finally {
      setConfirmLoading(false);
    }
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  const sortedAccounts = filteredAndSortedAccounts();

  return (
    <div className="p-2 space-y-6">
      {/* Summary Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card bordered={false} className="shadow-sm rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-full shadow-sm text-blue-600">
              <PiBankDuotone className="text-3xl" />
            </div>
            <div>
              <Text className="text-gray-500 font-medium">Total Balance</Text>
              <Title level={2} style={{ margin: 0, color: '#1e3a8a' }}>
                ₹{totalBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </Title>
            </div>
          </div>
        </Card>
        <Card bordered={false} className="shadow-sm rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 border-l-4 border-violet-500">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-full shadow-sm text-violet-600">
              <PiCreditCardDuotone className="text-3xl" />
            </div>
            <div>
              <Text className="text-gray-500 font-medium">Active Accounts</Text>
              <Title level={2} style={{ margin: 0, color: '#4c1d95' }}>
                {accounts.length}
              </Title>
            </div>
          </div>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap justify-between items-center gap-4 sticky top-0 z-10 bg-gray-50/80 backdrop-blur-md py-2 -mx-2 px-2 rounded-lg">
        <div className="flex items-center gap-3 flex-grow max-w-2xl">
          <Input
            placeholder="Search accounts..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchTerm}
            onChange={handleSearchChange}
            allowClear
            size="large"
            className="rounded-full shadow-sm border-gray-200 hover:border-blue-400 focus:border-blue-500"
            style={{ maxWidth: '300px' }}
          />
          <Dropdown
            menu={{
              items: SORT_OPTIONS.map((opt) => ({
                key: opt.value,
                label: opt.label,
              })),
              onClick: handleMenuClick,
            }}
            placement="bottomLeft"
          >
            <Button size="large" className="rounded-full border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-400">
              <FilterOutlined />
              <span className="hidden sm:inline">Sort: {SORT_OPTIONS.find((opt) => opt.value === sortOption)?.label}</span>
            </Button>
          </Dropdown>
        </div>
        <AddAccountModal onAdd={handleAddAccount} />
      </div>

      {/* Loading & Error States */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <Spin size="large" />
        </div>
      ) : error ? (
        <Alert message="Error" description={error} type="error" showIcon className="rounded-lg" />
      ) : sortedAccounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
          <PiWalletDuotone className="text-6xl text-gray-300 mb-4" />
          <Text strong className="text-lg text-gray-500">No accounts found</Text>
          <Text type="secondary">Create a new account to get started</Text>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedAccounts.map((account) => {
            const IconComponent = getIconComponent(account.icon);
            // Dynamic subtle background based on account color opacity
            const cardBgStyle = {
              background: `linear-gradient(135deg, white 60%, ${account.color}15 100%)`
            };

            return (
              <div
                key={account._id}
                className="group relative bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
                style={cardBgStyle}
              >
                {/* Action Buttons (Absolute Positioned) */}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Tooltip title="Edit">
                    <Button
                      type="text"
                      shape="circle"
                      icon={<EditOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditAccount(account);
                      }}
                      className="text-blue-500 hover:bg-blue-50"
                    />
                  </Tooltip>
                  <Tooltip title="Delete">
                    <Button
                      type="text"
                      shape="circle"
                      icon={<DeleteOutlined />}
                      danger
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteAccount(account);
                      }}
                      className="hover:bg-red-50"
                    />
                  </Tooltip>
                </div>

                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div
                      className="flex items-center justify-center rounded-xl shadow-inner"
                      style={{
                        width: 56,
                        height: 56,
                        backgroundColor: `${account.color}20`,
                        color: account.color
                      }}
                    >
                      <IconComponent size={32} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 m-0 leading-tight">{account.name}</h3>
                      <span className="text-xs uppercase tracking-wider font-semibold opacity-60 flex items-center gap-1 mt-1">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: account.color }}></span>
                        {account.type}
                      </span>
                      <Text className="text-xs text-gray-400 mt-1 block">
                        Opened: {new Date(account.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
                      </Text>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-50 mt-2">
                  <Text className="text-gray-400 text-xs font-medium uppercase tracking-widest">Current Balance</Text>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl text-gray-500 font-medium">₹</span>
                    <span className="text-3xl font-bold text-gray-800 tracking-tight">
                      {account.balance.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editAccount && (
        <EditAccountModal
          account={editAccount}
          onUpdate={handleUpdateAccount}
          onClose={() => setEditAccount(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3 text-red-600">
            <ExclamationCircleOutlined className="text-xl" />
            <span>Delete Account</span>
          </div>
        }
        open={!!deleteAccount}
        onCancel={() => setDeleteAccount(null)}
        onOk={handleDelete}
        confirmLoading={confirmLoading}
        okText="Delete Account"
        okButtonProps={{ danger: true, size: "large", icon: <DeleteOutlined /> }}
        cancelButtonProps={{ size: "large" }}
        centered
        width={400}
      >
        {deleteAccount && (
          <div className="py-4">
            <div className="bg-red-50 p-4 rounded-lg mb-4 border border-red-100 text-red-700 text-sm">
              Currently deleting <strong>{deleteAccount.name}</strong>. This will permanently remove the account and its transaction history.
            </div>

            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div
                className="flex items-center justify-center rounded-lg"
                style={{
                  width: 40,
                  height: 40,
                  backgroundColor: `${deleteAccount.color}20`,
                  color: deleteAccount.color
                }}
              >
                {getIconComponent(deleteAccount.icon) && (
                  <span>
                    {getIconComponent(deleteAccount.icon)({
                      size: 24,
                      color: deleteAccount.color,
                    })}
                  </span>
                )}
              </div>
              <div>
                <div className="font-bold text-gray-800">{deleteAccount.name}</div>
                <div className="text-gray-500 text-xs font-mono">₹{deleteAccount.balance.toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
