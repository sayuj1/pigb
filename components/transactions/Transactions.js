import { useState, useMemo } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Popover,
  message,
  DatePicker,
  Select,
  Tag,
  Typography,
  Card,
  Row,
  Col,
  Empty,
  Tooltip as AntTooltip,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import AddTransactionModal from "./AddTransactionModal";
import { PiPlus, PiMinus, PiWalletDuotone, PiArrowCircleUpDuotone, PiArrowCircleDownDuotone, PiTrendUpDuotone, PiTrendDownDuotone, PiBankDuotone, PiChartPieSliceDuotone } from "react-icons/pi";
import { getIconComponent } from "@/utils/getIcons";
import EditTransactionModal from "./EditTransactionModal";
import DeleteTransactionModal from "./DeleteTransacationModal";
import dayjs from "dayjs";
import rangePresets from "@/utils/rangePresets";
import { formatCurrency } from "@/utils/formatCurrency";
import { useTransactions } from "@/context/TransactionContext";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

const { RangePicker } = DatePicker;
const { Text, Title } = Typography;

export default function Transactions() {
  const {
    transactions,
    loading,
    pagination,
    setPagination,
    filters,
    setFilters,
    searchInput,
    setSearchInput,
    accountOptions,
    insights,
    fetchTransactions,
    fetchInsights,
  } = useTransactions();

  const { isDarkMode } = useTheme();

  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [deleteTransaction, setDeleteTransaction] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Handle Delete Transaction
  const handleDelete = async () => {
    setConfirmLoading(true);
    try {
      const res = await fetch(
        `/api/transactions/transaction?id=${deleteTransaction._id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete transaction");

      message.success("Transaction deleted successfully!");
      setDeleteTransaction(null);
      fetchTransactions();
      fetchInsights();
    } catch (error) {
      message.error(error.message);
    } finally {
      setConfirmLoading(false);
    }
  };

  // Handle Table Change (Sorting & Pagination)
  const handleTableChange = (pagination, filtersTable, sorter) => {
    setPagination({
      current: pagination.current,
      pageSize: pagination.pageSize,
    });
    setFilters((prev) => ({
      ...prev,
      sortBy: sorter.field || "date",
      sortOrder: sorter.order === "ascend" ? "asc" : "desc",
      type: filtersTable.type?.[0] || "",
    }));
  };

  return (
    <div className="gap-2 flex flex-col">
      {/* Summary Cards Row */}
      <Row gutter={[16, 16]}>
        {/* Combined Income & Expense Card */}
        <Col xs={24} md={8} style={{ display: 'flex' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            style={{ width: '100%', display: 'flex', flexDirection: 'column' }}
          >
            <Card className="shadow-sm flex-1" bodyStyle={{ padding: '16px', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="flex items-center gap-2 mb-2">
                <PiWalletDuotone className="text-xl text-teal-500" />
                <Text strong className="text-sm">Summary</Text>
                <Text type="secondary" className="text-sm">
                  ({dayjs(filters.startDate).format("DD MMM, YYYY")} - {dayjs(filters.endDate).format("DD MMM, YYYY")})
                </Text>
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex items-center justify-between p-2 bg-emerald-50 rounded-lg">
                  <div className="flex items-center gap-1.5">
                    <PiTrendUpDuotone className="text-base text-emerald-500" />
                    <span className="font-medium text-gray-700 text-xs">Income</span>
                  </div>
                  <span className="text-emerald-600 font-bold text-sm">{formatCurrency(insights?.totalIncome || 0)}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-rose-50 rounded-lg">
                  <div className="flex items-center gap-1.5">
                    <PiTrendDownDuotone className="text-base text-rose-500" />
                    <span className="font-medium text-gray-700 text-xs">Expenses</span>
                  </div>
                  <span className="text-rose-600 font-bold text-sm">{formatCurrency(insights?.totalExpense || 0)}</span>
                </div>
              </div>
            </Card>
          </motion.div>
        </Col>

        {/* Accounts Expenses */}
        <Col xs={24} md={8} style={{ display: 'flex' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{ width: '100%', display: 'flex', flexDirection: 'column' }}
          >
            <Card className="shadow-sm flex-1" bodyStyle={{ padding: '16px', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="flex items-center gap-2 mb-2">
                <PiBankDuotone className="text-xl text-indigo-500" />
                <Text strong className="text-sm">Accounts Expenses</Text>
              </div>
              <div className="flex-1">
                {insights.expenseByAccounts && insights.expenseByAccounts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-4 text-gray-400">
                    <PiBankDuotone className="text-3xl mb-1 opacity-30" />
                    <Text type="secondary" className="text-xs">No expenses yet</Text>
                  </div>
                ) : (
                  <div className="space-y-0">
                    {insights.expenseByAccounts && insights.expenseByAccounts.slice(0, 3).map((acc) => (
                      <div key={acc.accountId} className="flex items-center justify-between p-1.5 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="flex items-center gap-1.5">
                          {getIconComponent(acc.icon)({ size: 16, color: acc.color })}
                          <span className="font-medium text-gray-700 text-xs truncate">{acc.accountName}</span>
                        </div>
                        <span className="text-rose-600 font-bold text-xs">{formatCurrency(acc.total)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </Col>

        {/* Top 3 Categories */}
        <Col xs={24} md={8} style={{ display: 'flex' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ width: '100%', display: 'flex', flexDirection: 'column' }}
          >
            <Card className="shadow-sm flex-1" bodyStyle={{ padding: '16px', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="flex items-center gap-2 mb-2">
                <PiChartPieSliceDuotone className="text-xl text-amber-500" />
                <Text strong className="text-sm">Top 3 Categories (Most Spent)</Text>
              </div>
              <div className="flex-1">
                {insights.topCategories && insights.topCategories.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-4 text-gray-400">
                    <PiChartPieSliceDuotone className="text-3xl mb-1 opacity-30" />
                    <Text type="secondary" className="text-xs">No expenses yet</Text>
                  </div>
                ) : (
                  <div className="space-y-0">
                    {insights.topCategories && insights.topCategories.map((cat) => (
                      <div key={cat.category} className="flex items-center justify-between p-1.5 hover:bg-gray-50 rounded-lg transition-colors">
                        <span className="font-medium text-gray-700 text-xs truncate">{cat.category}</span>
                        <span className="text-rose-600 font-bold text-xs">{formatCurrency(cat.total)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* Filters Section */}
      <Card className="shadow-sm border-gray-100" bodyStyle={{ padding: '16px' }}>
        <div className="flex flex-col gap-3">
          {/* First Row: Search and Add Transaction Button */}
          <div className="flex flex-wrap items-center gap-3">
            <Input
              prefix={<SearchOutlined className="text-gray-400" />}
              placeholder="Search transactions..."
              allowClear
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1 min-w-[200px]"
            />

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalVisible(true)}
              className="shadow-sm"
            >
              Add Transaction
            </Button>
          </div>

          {/* Second Row: Date Range, Account Filter, and Type Filter */}
          <div className="flex flex-wrap items-center gap-3">
            <RangePicker
              format="DD-MM-YYYY"
              presets={rangePresets}
              value={[dayjs(filters.startDate), dayjs(filters.endDate)]}
              onChange={(dates) => {
                if (!dates) {
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
                setFilters((prev) => ({
                  ...prev,
                  startDate: dates[0].startOf("day").toISOString(),
                  endDate: dates[1].endOf("day").toISOString(),
                }));
                setPagination((prev) => ({ ...prev, current: 1 }));
              }}
              className="w-full md:w-auto"
            />

            <Select
              mode="multiple"
              placeholder="Filter by accounts"
              allowClear
              className="flex-1 min-w-[200px]"
              value={filters.accountId}
              onChange={(value) => {
                setFilters((prev) => ({ ...prev, accountId: value }));
                setPagination((prev) => ({ ...prev, current: 1 }));
              }}
              options={accountOptions.map((acc) => ({
                label: (
                  <Space>
                    {getIconComponent(acc.icon)({ size: 16, color: acc.color })}
                    <span>{acc?.name || "N/A"}</span>
                  </Space>
                ),
                value: acc._id,
              }))}
            />

            {/* Type Filter Tag Style */}
            <div className="flex gap-2 p-1 bg-gray-50 rounded-lg border border-gray-100">
              {['all', 'income', 'expense'].map((t) => (
                <Button
                  key={t}
                  size="small"
                  type={filters.type === (t === 'all' ? "" : t) ? "primary" : "text"}
                  onClick={() => {
                    setFilters(prev => ({ ...prev, type: t === 'all' ? "" : t }));
                    setPagination(prev => ({ ...prev, current: 1 }));
                  }}
                  className="capitalize text-xs font-semibold"
                >
                  {t}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Main Table Content */}
      <Card className="shadow-sm overflow-hidden" bodyStyle={{ padding: 0, }}>
        <Table
          columns={[
            {
              title: "Category",
              dataIndex: "category",
              key: "category",
              render: (cat) => {
                const [icon, ...name] = cat.split(" ");
                return (
                  <Space>
                    <span className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-lg border border-gray-100">
                      {icon}
                    </span>
                    <span className="font-medium text-gray-700">{name.join(" ")}</span>
                  </Space>
                );
              },
            },
            {
              title: "Description",
              dataIndex: "description",
              key: "description",
              render: (text) => (
                <div className="text-gray-500 italic">
                  {text || "No description"}
                </div>
              ),
            },
            {
              title: "Account",
              dataIndex: "accountId",
              key: "accountId",
              render: (acc) => (
                <div className="inline-flex items-center gap-2 px-2 py-1 bg-gray-50 rounded-lg border border-gray-100">
                  {getIconComponent(acc.icon)({ size: 16, color: acc.color })}
                  <span className="text-xs font-bold text-gray-600">{acc?.name}</span>
                </div>
              ),
            },
            {
              title: "Amount",
              dataIndex: "amount",
              key: "amount",
              sorter: true,
              align: 'right',
              render: (amount, record) => {
                const isIncome = record.type === "income";
                return (
                  <div className={`font-bold tabular-nums ${isIncome ? "text-emerald-600" : "text-rose-600"}`}>
                    <span className="text-[10px] mr-1 opacity-70 uppercase tracking-tighter">
                      {isIncome ? "+" : "-"}
                    </span>
                    {formatCurrency(amount)}
                  </div>
                );
              },
            },
            {
              title: "Date",
              dataIndex: "date",
              key: "date",
              sorter: true,
              render: (date) => (
                <div className="text-gray-500 font-medium whitespace-nowrap">
                  {dayjs(date).format("DD MMM, YYYY")}
                </div>
              ),
            },
            {
              title: "Actions",
              key: "actions",
              align: 'right',
              render: (_, record) => {
                const isReadOnlySource = ["savings", "bills"].includes(record.source);
                const popoverContent = (
                  <Space direction="vertical" size={0}>
                    <Text strong size="small">Automated Transaction</Text>
                    <Text type="secondary" size="small">
                      This was created via {record.source === "savings" ? "Savings" : "Planned Bills"}.
                      Manage it from its respective section.
                    </Text>
                  </Space>
                );

                return (
                  <Space>
                    {isReadOnlySource ? (
                      <Popover content={popoverContent} placement="left">
                        <InfoCircleOutlined className="text-blue-400 cursor-help" />
                      </Popover>
                    ) : (
                      <>
                        <AntTooltip title="Edit">
                          <Button
                            type="text"
                            icon={<EditOutlined className="text-blue-500" />}
                            onClick={() => {
                              setSelectedTransaction(record);
                              setEditModalVisible(true);
                            }}
                          />
                        </AntTooltip>
                        <AntTooltip title="Delete">
                          <Button
                            type="text"
                            icon={<DeleteOutlined className="text-red-500" />}
                            onClick={() => setDeleteTransaction(record)}
                          />
                        </AntTooltip>
                      </>
                    )}
                  </Space>
                );
              },
            },
          ]}
          dataSource={transactions}
          rowKey="_id"
          loading={loading}
          pagination={{ ...pagination, showSizeChanger: true }}
          onChange={handleTableChange}
          locale={{
            emptyText: (
              <div className="flex flex-col items-center justify-center py-12">
                <PiWalletDuotone className="text-7xl mb-3 opacity-20 text-gray-400" />
                <Text type="secondary" className="text-sm">
                  No transactions available for this period
                </Text>
              </div>
            ),
          }}
          className="custom-transactions-table"
        />
      </Card>

      {/* Modals */}
      <AddTransactionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAddTransaction={() => {
          fetchTransactions();
          fetchInsights();
        }}
      />
      <EditTransactionModal
        visible={editModalVisible}
        transaction={selectedTransaction}
        onClose={() => setEditModalVisible(false)}
        onUpdate={() => {
          fetchTransactions();
          fetchInsights();
        }}
      />
      <DeleteTransactionModal
        transaction={deleteTransaction}
        open={!!deleteTransaction}
        confirmLoading={confirmLoading}
        onCancel={() => setDeleteTransaction(null)}
        onConfirm={handleDelete}
      />

      <style jsx global>{`
        .custom-transactions-table .ant-table-thead > tr > th {
          background: ${isDarkMode ? '#001529' : '#f9fafb'};
          color: ${isDarkMode ? '#b5b5b5' : '#6b7280'};
          font-weight: 600;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.05em;
          padding: 16px;
          border-bottom: 1px solid ${isDarkMode ? '#333' : '#f3f4f6'};
        }
        .custom-transactions-table .ant-table-tbody > tr > td {
          padding: 16px;
        }
        .custom-transactions-table .ant-table-tbody > tr:hover > td {
          background: ${isDarkMode ? '#001a33' : '#fdfdfd'} !important;
        }
      `}</style>
    </div>
  );
}
