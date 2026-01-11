import { useEffect, useState } from "react";
import {
  Input,
  Button,
  DatePicker,
  Card,
  Modal,
  Tag,
  Typography,
  Tooltip,
  Dropdown,
  Spin,
  Alert,
  Progress,
  Empty,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  CalendarOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  FilterOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import CreateEditBudgetModal from "./CreateEditBudgetModal";
import DeleteBudgetModal from "./DeleteBudgetModal";
import { formatCurrency } from "@/utils/formatCurrency";
import { PiChartPieSliceDuotone, PiWalletDuotone, PiTrendUpDuotone } from "react-icons/pi";

const { Title, Text } = Typography;

const Budget = () => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
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
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [debouncedSearch, dateRange]);

  const handleDeleteBudget = async (budgetId) => {
    try {
      setDeleteLoading(true);
      await fetch(`/api/budgets/budget?id=${budgetId}`, {
        method: "DELETE",
      });
      await fetchBudgets();
      setDeleteModalVisible(false);
      setBudgetToDelete(null);
    } catch (error) {
      console.error(error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const totalBudget = budgets.reduce((sum, b) => sum + (b.limitAmount || 0), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + (b.spentAmount || 0), 0);

  return (
    <div className="p-2 space-y-6">
      {/* Summary Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card bordered={false} className="shadow-sm rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-full shadow-sm text-blue-600">
              <PiChartPieSliceDuotone className="text-3xl" />
            </div>
            <div className="flex-1 min-w-0">
              <Text className="text-gray-500 font-medium block">Total Budget</Text>
              <Tooltip title={formatCurrency(totalBudget)}>
                <Title level={2} style={{ margin: 0, color: '#1e3a8a' }} className="truncate">
                  {formatCurrency(totalBudget)}
                </Title>
              </Tooltip>
            </div>
          </div>
        </Card>
        <Card bordered={false} className="shadow-sm rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 border-l-4 border-violet-500">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-full shadow-sm text-violet-600">
              <PiWalletDuotone className="text-3xl" />
            </div>
            <div className="flex-1 min-w-0">
              <Text className="text-gray-500 font-medium block">Total Spent</Text>
              <Tooltip title={formatCurrency(totalSpent)}>
                <Title level={2} style={{ margin: 0, color: '#4c1d95' }} className="truncate">
                  {formatCurrency(totalSpent)}
                </Title>
              </Tooltip>
            </div>
          </div>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap justify-between items-center gap-4 sticky top-0 z-10 bg-gray-50/80 backdrop-blur-md py-2 -mx-2 px-2 rounded-lg">
        <div className="flex items-center gap-3 flex-grow max-w-2xl">
          <Input
            placeholder="Search budgets..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            size="large"
            className="rounded-full shadow-sm border-gray-200 hover:border-blue-400 focus:border-blue-500"
            style={{ maxWidth: '300px' }}
          />
          <DatePicker.RangePicker
            value={dateRange}
            onChange={(range) => {
              if (range) setDateRange(range);
              else {
                const startOfMonth = dayjs().startOf("month");
                const endOfMonth = dayjs().endOf("month");
                setDateRange([startOfMonth, endOfMonth]);
              }
            }}
            format="DD-MM-YYYY"
            size="large"
            className="rounded-full shadow-sm border-gray-200 hover:border-blue-400 focus:border-blue-500"
            suffixIcon={<CalendarOutlined className="text-gray-400" />}
          />
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setBudgetModalVisible(true)}
          size="large"
          className="rounded-full bg-blue-600 hover:bg-blue-700 border-none shadow-md"
        >
          Add Budget
        </Button>
      </div>

      {/* Loading & Error States */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <Spin size="large" />
        </div>
      ) : budgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
          <PiChartPieSliceDuotone className="text-6xl text-gray-300 mb-4" />
          <Text strong className="text-lg text-gray-500">No budgets found</Text>
          <Text type="secondary">Create a new budget to get started</Text>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {budgets.map((budget) => {
            const isOverspent = budget.spentAmount > budget.limitAmount;
            const percent = Math.min((budget.spentAmount / budget.limitAmount) * 100, 100);
            const statusColor = isOverspent ? "#ef4444" : "#10b981"; // red-500 : emerald-500

            return (
              <div
                key={budget._id}
                className="group relative bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Action Buttons (Absolute Positioned) */}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                  <Tooltip title="View Expenses">
                    <Button
                      type="text"
                      shape="circle"
                      icon={<EyeOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTransactions(budget.transactions || []);
                        setViewExpensesVisible(true);
                      }}
                      className="text-gray-500 hover:bg-gray-100"
                    />
                  </Tooltip>
                  <Tooltip title="Edit">
                    <Button
                      type="text"
                      shape="circle"
                      icon={<EditOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingBudget(budget);
                        setBudgetModalVisible(true);
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
                        setBudgetToDelete(budget);
                        setDeleteModalVisible(true);
                      }}
                      className="hover:bg-red-50"
                    />
                  </Tooltip>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-800 m-0 leading-tight truncate pr-16">{budget.budgetName}</h3>
                </div>

                <div className="mb-4">
                  <span className="text-xs uppercase tracking-wider font-semibold opacity-60 bg-gray-100 px-2 py-1 rounded-md text-gray-600">
                    {budget.category}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Spent: {formatCurrency(budget.spentAmount)}</span>
                      <span>Limit: {formatCurrency(budget.limitAmount)}</span>
                    </div>
                    <Progress
                      percent={percent}
                      strokeColor={statusColor}
                      showInfo={false}
                      size="small"
                      className="m-0"
                    />
                    <div className="flex justify-between items-center mt-2">
                      <Text type={isOverspent ? "danger" : "success"} className="text-xs font-semibold flex items-center gap-1">
                        {isOverspent ? <ExclamationCircleOutlined /> : <PiTrendUpDuotone />}
                        {isOverspent ? "Overspent" : "On Track"}
                      </Text>
                      <Text className="text-xs text-gray-400">
                        {dayjs(budget.startDate).format("MMM D")} - {dayjs(budget.endDate).format("MMM D")}
                      </Text>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CreateEditBudgetModal
        visible={budgetModalVisible}
        onClose={() => {
          setBudgetModalVisible(false);
          setEditingBudget(null);
        }}
        editingBudget={editingBudget}
        fetchBudgets={fetchBudgets}
      />

      <DeleteBudgetModal
        visible={deleteModalVisible}
        budget={budgetToDelete}
        confirmLoading={deleteLoading}
        onCancel={() => {
          setDeleteModalVisible(false);
          setBudgetToDelete(null);
        }}
        onConfirm={handleDeleteBudget}
      />

      <Modal
        title={
          <div className="flex items-center gap-3 border-b border-gray-100 pb-3 -mx-6 px-6 pt-2">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <EyeOutlined className="text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 m-0 leading-tight">Expenses</h3>
              <Text className="text-xs text-gray-400 font-normal">View all transactions for this budget</Text>
            </div>
          </div>
        }
        open={viewExpensesVisible}
        onCancel={() => setViewExpensesVisible(false)}
        footer={null}
        width={600}
        centered
        className="rounded-2xl overflow-hidden"
      >
        <div className="max-h-[60vh] overflow-y-auto pr-2 mt-4 custom-scrollbar">
          {selectedTransactions.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <PiWalletDuotone className="text-3xl text-gray-300" />
              </div>
              <Text strong className="text-gray-500 text-base">No expenses found</Text>
              <Text className="text-gray-400 text-sm mt-1">Transactions assigned to this budget will appear here.</Text>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedTransactions.map((tx, idx) => (
                <div
                  key={idx}
                  className="group flex items-start justify-between p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-100 hover:shadow-sm transition-all duration-200 min-w-0"
                >
                  {/* LEFT */}
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 shrink-0 mt-0.5">
                      <PiTrendUpDuotone className="text-xl transform rotate-45" />
                    </div>

                    <div className="min-w-0">
                      {/* WRAPPED DESCRIPTION */}
                      <div className="font-semibold text-gray-800 text-sm leading-snug break-words line-clamp-2">
                        {tx.description || "Uncategorized Expense"}
                      </div>

                      <div className="text-xs text-gray-400 flex items-center gap-2 mt-1">
                        <CalendarOutlined className="text-[10px]" />
                        {dayjs(tx.date).format("MMM D, YYYY")}
                      </div>
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="text-right pl-4 shrink-0 max-w-[120px]">
                    <div className="font-bold text-gray-800 text-base whitespace-nowrap truncate">
                      {formatCurrency(tx.amount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>


          )}
        </div>
      </Modal>
    </div>
  );
};

export default Budget;
