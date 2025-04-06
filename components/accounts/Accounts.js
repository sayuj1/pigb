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
  Divider,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleFilled,
} from "@ant-design/icons";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import AddAccountModal from "./AddAccountModal";
import { getIconComponent } from "@/utils/getIcons";
import EditAccountModal from "./EditAccountModal";

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
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editAccount, setEditAccount] = useState(null);
  const [deleteAccount, setDeleteAccount] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Fetch accounts from API
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch("/api/accounts/account");
        if (!response.ok) throw new Error("Failed to fetch accounts");

        const data = await response.json();
        setAccounts(data.accounts);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

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

  return (
    <div className="p-4 space-y-4">
      {/* Search & Sorting */}
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-grow">
          <Input
            placeholder="Search accounts"
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={handleSearchChange}
            allowClear
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
        <AddAccountModal onAdd={handleAddAccount} />
      </div>

      {/* Loading & Error States */}
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <Spin size="large" />
        </div>
      ) : error ? (
        <Alert message="Error" description={error} type="error" showIcon />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedAccounts().length === 0 ? (
            <p className="text-center text-gray-500">No accounts found.</p>
          ) : (
            filteredAndSortedAccounts().map((account) => {
              const IconComponent = getIconComponent(account.icon);

              return (
                <Card
                  key={account._id}
                  className="relative flex items-center gap-4 p-4 "
                  style={{ borderLeft: `6px solid ${account.color}` }}
                >
                  <div className="absolute flex gap-2 justify-end w-full pr-8">
                    <Button
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => setEditAccount(account)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      icon={<DeleteOutlined />}
                      danger
                      onClick={() => {
                        setDeleteAccount(account);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                  <div className="flex justify-between items-center">
                    {/* Account Icon */}
                    <div
                      className="flex items-center justify-center rounded-lg"
                      style={{
                        width: 50,
                        height: 50,
                        backgroundColor: `${account.color}20`,
                        borderRadius: "8px",
                      }}
                    >
                      <IconComponent size={32} color={account.color} />
                    </div>
                  </div>

                  {/* Account Details */}
                  <div className="flex-1 mt-1">
                    <Title level={5} className="mb-0">
                      {account.name}
                    </Title>
                    <Text type="secondary" className="mt-0">
                      {account.type}
                    </Text>
                  </div>

                  {/* Account Balance */}
                  <Title level={5} style={{ margin: 0 }}>
                    ₹
                    {account.balance.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Title>
                </Card>
              );
            })
          )}
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
          <div className="flex gap-1">
            <ExclamationCircleOutlined style={{ color: "red" }} />
            <span className="text-red-500">
              Are you sure you want to delete this account?
            </span>
          </div>
        }
        open={!!deleteAccount}
        onCancel={() => setDeleteAccount(null)}
        onOk={handleDelete}
        confirmLoading={confirmLoading}
        okText="Yes, Delete"
        okType="danger"
        cancelText="No"
      >
        {deleteAccount && (
          <div className="flex items-center gap-4">
            {/* Account Icon */}
            <div
              className="flex items-center justify-center rounded-lg"
              style={{
                width: 50,
                height: 50,
                backgroundColor: `${deleteAccount.color}20`,
                borderRadius: "8px",
              }}
            >
              {/* <ExclamationCircleFilled style={{ fontSize: 32, color: deleteAccount.color }} /> */}
              {/* <IconCom size={32} color={deleteAccount.color} /> */}
              {/* <DeleteIconComponent size={32} icon={deleteAccount.color} /> */}
              {/** Render the icon component correctly **/}
              {getIconComponent(deleteAccount.icon) && (
                <span>
                  {getIconComponent(deleteAccount.icon)({
                    size: 32,
                    color: deleteAccount.color,
                  })}
                </span>
              )}

              {/* <IconComponent size={32} color={deleteAccount.color} /> */}
            </div>

            {/* Account Details */}
            <div>
              <p>
                <strong>Name:</strong> {deleteAccount.name}
              </p>
              <p>
                <strong>Type:</strong>{" "}
                {deleteAccount.type.charAt(0).toUpperCase() +
                  deleteAccount.type.slice(1)}
              </p>
              <p>
                <strong>Balance:</strong> ₹
                {deleteAccount.balance.toLocaleString()}
              </p>
            </div>
          </div>
        )}
        <p className="mt-4 text-red-500">⚠️ This action cannot be undone.</p>
      </Modal>
    </div>
  );
}
