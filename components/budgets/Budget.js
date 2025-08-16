import { useEffect, useState } from "react";
import {
  Input,
  Button,
  DatePicker,
  Space,
  Row,
  Col,
  Card,
  Table,
  message,
  Modal,
  Tag,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  CalendarOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import CreateEditBudgetModal from "./CreateEditBudgetModal";
import DeleteBudgetModal from "./DeleteBudgetModal"; // adjust the path as necessary
import { formatCurrency } from "@/utils/formatCurrency";

const Budget = () => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search); // State for debounced search value
  const [dateRange, setDateRange] = useState([
    dayjs().startOf("month"),
    dayjs().endOf("month"),
  ]);
  const [budgetModalVisible, setBudgetModalVisible] = useState(false);
  const [budgets, setBudgets] = useState([]);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [viewExpensesVisible, setViewExpensesVisible] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState(null);
  const [loading, setLoading] = useState(false);

  // Debouncing search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500); // Delay for 500ms

    // Cleanup timer on component unmount or when `search` changes
    return () => clearTimeout(timer);
  }, [search]);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/budgets/budget?search=${debouncedSearch}&startDate=${dateRange[0].toISOString()}&endDate=${dateRange[1].toISOString()}`
      );
      const data = await res.json();
      setBudgets(data.budgets || []);
    } catch (err) {
      message.error("Failed to fetch budgets");
    } finally {
      setLoading(false); // Set loading to false after fetch is complete
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [debouncedSearch, dateRange]); // Fetch budgets when debouncedSearch or dateRange changes

  const handleDeleteBudget = async (budgetId) => {
    try {
      await fetch(`/api/budgets/budget?id=${budgetId}`, {
        method: "DELETE",
      });
      message.success("Budget deleted");
      fetchBudgets(); // refresh list
      setDeleteModalVisible(false);
      setBudgetToDelete(null);
    } catch (error) {
      message.error("Failed to delete budget");
    }
  };

  return (
    <Card title="Budgets">
      <Row gutter={[16, 16]} justify="space-between" align="middle">
        <Col xs={24} sm={12} md={8}>
          <Input
            placeholder="Search by budget name or category"
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
          />
        </Col>
        <Col xs={24} sm={12} md={10}>
          <DatePicker.RangePicker
            value={dateRange}
            onChange={(range) => {
              if (!range) {
                const startOfMonth = dayjs().startOf("month");
                const endOfMonth = dayjs().endOf("month");
                setDateRange([startOfMonth, endOfMonth]);
              } else {
                setDateRange(range);
              }
            }}
            format="DD-MM-YYYY"
            style={{ width: "100%" }}
            suffixIcon={<CalendarOutlined />}
          />
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setBudgetModalVisible(true)}
          >
            Add Budget
          </Button>
        </Col>
      </Row>

      <div className="mt-6">
        <Table
          loading={loading}
          rowKey="_id"
          dataSource={budgets}
          columns={[
            { title: "Name", dataIndex: "budgetName", key: "budgetName" },
            { title: "Category", dataIndex: "category", key: "category" },
            {
              title: "Limit",
              dataIndex: "limitAmount",
              key: "limitAmount",
              render: (val) => formatCurrency(val),
            },
            {
              title: "Date Range",
              key: "dateRange",
              render: (_, record) =>
                `${dayjs(record.startDate).format("MMM D")} - ${dayjs(
                  record.endDate
                ).format("MMM D, YYYY")}`,
            },
            {
              title: "Spent",
              dataIndex: "spentAmount",
              key: "spentAmount",
              render: (val) => formatCurrency(val),
            },
            {
              title: "Status",
              key: "status",
              render: (_, record) => {
                const isOverspent = record.spentAmount > record.limitAmount;
                return isOverspent ? (
                  <Tag icon={<ExclamationCircleOutlined />} color="error">
                    Overspent
                  </Tag>
                ) : (
                  <Tag icon={<CheckCircleOutlined />} color="success">
                    Under Limit
                  </Tag>
                );
              },
            },
            {
              title: "View Expenses",
              key: "viewExpenses",
              render: (_, record) => (
                <Button
                  icon={<EyeOutlined />}
                  onClick={() => {
                    setSelectedTransactions(record.transactions || []);
                    setViewExpensesVisible(true);
                  }}
                >
                  View
                </Button>
              ),
            },
            {
              title: "Action",
              key: "action",
              render: (_, record) => (
                <Space>
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => {
                      setEditingBudget(record);
                      setBudgetModalVisible(true);
                    }}
                  />
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => {
                      setBudgetToDelete(record);
                      setDeleteModalVisible(true);
                    }}
                  />
                </Space>
              ),
            },
          ]}
          pagination={{ pageSize: 10 }}
        />
      </div>

      <CreateEditBudgetModal
        visible={budgetModalVisible}
        onClose={() => {
          setBudgetModalVisible(false);
          setEditingBudget(null); // clear on close
        }}
        editingBudget={editingBudget}
        fetchBudgets={fetchBudgets}
      />
      <DeleteBudgetModal
        visible={deleteModalVisible}
        budget={budgetToDelete}
        onCancel={() => {
          setDeleteModalVisible(false);
          setBudgetToDelete(null);
        }}
        onConfirm={handleDeleteBudget}
      />

      <Modal
        title="Expenses"
        open={viewExpensesVisible}
        onCancel={() => setViewExpensesVisible(false)}
        footer={null}
      >
        <Table
          rowKey="_id"
          dataSource={selectedTransactions}
          columns={[
            {
              title: "Date",
              dataIndex: "date",
              render: (val) => dayjs(val).format("DD-MM-YYYY"),
            },
            {
              title: "Amount",
              dataIndex: "amount",
              render: (val) => `₹${val}`,
            },
            {
              title: "Description",
              dataIndex: "description",
              render: (val) => val || "-",
              onCell: () => ({
                style: {
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                },
              }),
            },
          ]}
          pagination={false}
        />
      </Modal>
    </Card>
  );
};

export default Budget;
