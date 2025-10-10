"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  Input,
  Button,
  Form,
  Select,
  Tag,
  Space,
  Modal,
  Dropdown,
  Menu,
  Tabs,
  message,
} from "antd";
import {
  ExclamationCircleOutlined,
  PlusOutlined,
  MoreOutlined,
  EditOutlined,
  StopOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import { getIconComponent } from "@/utils/getIcons";
import AddBillModal from "./AddBillModal";
import ViewExpensesModal from "./ViewExpensesModal";

const { Search } = Input;
const { Option } = Select;

const Bill = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [accounts, setAccounts] = useState([]);
  const [editingBill, setEditingBill] = useState(null);
  const [activeTab, setActiveTab] = useState("unpaid");
  const [showExpensesModal, setShowExpensesModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalBills, setTotalBills] = useState(0);

  const fetchAccounts = async () => {
    try {
      const res = await axios.get("/api/accounts/account");
      setAccounts(res.data.accounts || []);
    } catch (err) {
      console.error("Failed to fetch accounts:", err);
    }
  };

  const fetchBills = async (
    search = "",
    status = activeTab,
    page = currentPage,
    limit = pageSize
  ) => {
    setLoading(true);
    try {
      const params = { search, page, limit };
      if (status !== "all") {
        params.status = status;
      }
      if (status === "inactive") {
        params.sortBy = "dueDate";
        params.sortOrder = "desc";
      }
      const res = await axios.get(`/api/bills/bill`, { params });
      setBills(res.data.bills);
      setTotalBills(res.data.pagination.totalBills); // total count from backend
    } catch (err) {
      console.error("Failed to fetch bills:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchBills(searchText, activeTab, currentPage, pageSize);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchText, activeTab, currentPage, pageSize]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setCurrentPage(1);
  };

  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  // Update on input change immediately
  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  // Debounce search effect
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchBills(searchText, activeTab);
    }, 500); // 500ms debounce delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchText, activeTab]);

  const handleAddBill = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        _id: form.getFieldValue("_id"),
        accountId: values.accountId.value,
        dueDate: values.dueDate.toISOString(),
        frequency:
          values.frequency === "custom"
            ? `${values.customFrequency}`
            : values.frequency,
      };
      delete payload.customFrequency;
      // console.log("payload ");
      if (editingBill) {
        await axios.put(`/api/bills/bill`, payload);
      } else {
        await axios.post("/api/bills/bill", payload);
      }

      setIsModalOpen(false);
      setEditingBill(null);
      form.resetFields();
      fetchBills(searchText);
      fetchAccounts();
    } catch (err) {
      console.error("Add/Edit bill failed:", err);
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (val) => `₹${val}`,
    },
    {
      title: "Account",
      dataIndex: ["accountId"],
      key: "account",
      render: (account) => (
        <Space>
          {getIconComponent(account?.icon)({
            size: 20,
            color: account?.color,
          })}
          <span className="font-semibold">{account?.name || "N/A"}</span>
        </Space>
      ),
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (date) => dayjs(date).format("DD MMM YYYY"),
    },
    {
      title: "Recurring",
      dataIndex: "isRecurring",
      key: "isRecurring",
      render: (val) => (val ? "Yes" : "No"),
    },
    {
      title: "Frequency",
      dataIndex: "frequency",
      key: "frequency",
      render: (val) => {
        if (!val) return "-";

        // Check if value is a number or numeric string
        const numericVal = Number(val);
        if (!isNaN(numericVal)) {
          return `${numericVal} month${numericVal > 1 ? "s" : ""}`;
        }

        return val;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        if (status === "paid") {
          return <Tag color="success">Paid</Tag>;
        } else if (status === "cancelled") {
          return <Tag color="magenta">Cancelled</Tag>; // You can change color as needed
        } else {
          return <Tag color="volcano">Unpaid</Tag>;
        }
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => {
        const menu = (
          <Menu>
            {record.status !== "paid" && record.status !== "cancelled" && (
              <Menu.Item
                key="edit"
                icon={<EditOutlined />}
                onClick={() => {
                  setEditingBill(record);
                  form.setFieldsValue({
                    ...record,
                    dueDate: dayjs(record.dueDate),
                    accountId: {
                      value: record.accountId?._id,
                      label: (
                        <div className="flex items-center gap-2">
                          {getIconComponent(record.accountId.icon)({
                            size: 20,
                            color: record.accountId.color,
                          })}
                          <span>{record.accountId.name}</span>
                        </div>
                      ),
                    },
                  });
                  setIsModalOpen(true);
                }}
              >
                Edit
              </Menu.Item>
            )}

            {record.status !== "paid" && record.status !== "cancelled" && (
              <Menu.Item
                key="cancel"
                icon={<StopOutlined />}
                onClick={() => {
                  Modal.confirm({
                    title: `Cancel Bill: ${record.name}`,
                    content: (
                      <div>
                        <p>
                          Are you sure you want to <strong>cancel</strong> this
                          bill?
                        </p>
                        <p className="text-orange-600 mt-2">
                          <ExclamationCircleOutlined className="pt-0.5 mr-0.5" />
                          This action is irreversible and will prevent this bill
                          from triggering future expenses.
                        </p>
                      </div>
                    ),
                    okText: "Yes, Cancel",
                    okType: "danger",
                    cancelText: "No",
                    onOk: async () => {
                      try {
                        await axios.put("/api/bills/bill", {
                          _id: record._id,
                          accountId: record.accountId._id,
                          status: "cancelled",
                        });
                        message.success("Bill cancelled successfully!");
                        fetchBills(searchText, activeTab);
                      } catch (err) {
                        console.error("Failed to cancel bill:", err);
                      }
                    },
                  });
                }}
              >
                Cancel Bill
              </Menu.Item>
            )}

            <Menu.Item
              key="delete"
              icon={<DeleteOutlined />}
              danger
              onClick={() => {
                Modal.confirm({
                  title: `Delete Bill: ${record.name}`,
                  content: (
                    <div>
                      <p>
                        <strong>Amount:</strong> ₹{record.amount}
                      </p>
                      <p>
                        <strong>Due Date:</strong>{" "}
                        {dayjs(record.dueDate).format("DD MMM YYYY")}
                      </p>
                      <p>
                        <strong>Account:</strong>{" "}
                        <span className="inline-flex items-baseline gap-1 ">
                          {getIconComponent(record.accountId?.icon)?.({
                            size: 18,
                            color: record.accountId?.color,
                          })}
                          {record.accountId?.name || "N/A"}
                        </span>
                      </p>
                      <p className="text-red-600 mt-2">
                        <ExclamationCircleOutlined className="pt-0.5 mr-0.5" />
                        This will also permanently delete all associated expense
                        transactions.
                      </p>
                    </div>
                  ),
                  okText: "Yes, Delete",
                  okType: "danger",
                  cancelText: "Cancel",
                  onOk: async () => {
                    try {
                      await axios.delete(`/api/bills/bill?_id=${record._id}`);
                      message.success("Bill Deleted Sucessfully!");
                      fetchBills(searchText, activeTab);
                    } catch (err) {
                      console.error("Delete failed:", err);
                    }
                  },
                });
              }}
            >
              Delete
            </Menu.Item>
          </Menu>
        );

        return (
          <Space size="middle">
            {record.status !== "paid" && record.status !== "cancelled" && (
              <Button
                color="cyan"
                variant="solid"
                onClick={async () => {
                  try {
                    // console.log("record", record);
                    await axios.put("/api/bills/bill", {
                      _id: record._id,
                      accountId: record.accountId._id,
                      status: "paid",
                    });
                    fetchBills(searchText, activeTab);
                  } catch (err) {
                    console.error("Failed to mark bill as paid:", err);
                  }
                }}
              >
                Pay
              </Button>
            )}
            <Button
              color="primary"
              variant="filled"
              onClick={() => {
                // console.log("Viewing expenses for", record._id);
                setSelectedBill(record);
                setShowExpensesModal(true);
              }}
            >
              View Expenses
            </Button>

            <Dropdown overlay={menu} trigger={["click"]}>
              <Button icon={<MoreOutlined />} />
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <Search
          placeholder="Search bills by name"
          onChange={handleSearchChange}
          value={searchText}
          allowClear
          enterButton
          style={{ maxWidth: 300 }}
        />

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
        >
          Add Bill
        </Button>
      </div>
      <Tabs
        type="card"
        activeKey={activeTab}
        onChange={handleTabChange}
        className="mb-4"
      >
        <Tabs.TabPane tab="Active Bills" key="unpaid" />
        <Tabs.TabPane tab="Inactive Bills" key="inactive" />
        <Tabs.TabPane tab="All Bills" key="all" />
      </Tabs>
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={bills}
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: totalBills,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
        }}
        onChange={handleTableChange}
      />

      <AddBillModal
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingBill(null);
          form.resetFields();
        }}
        onSubmit={handleAddBill}
        form={form}
        accounts={accounts}
      />
      <ViewExpensesModal
        visible={showExpensesModal}
        onClose={() => setShowExpensesModal(false)}
        bill={selectedBill}
      />
    </div>
  );
};

export default Bill;
