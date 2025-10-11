import { Card, Row, Col } from "antd";
import {
  WalletOutlined,
  BankOutlined,
  ShoppingOutlined,
  FundOutlined,
} from "@ant-design/icons";
import { formatCurrency } from "@/utils/formatCurrency";
import { useDashboard } from "@/context/DashboardContext";

// Card styling
const cardStyles = {
  height: 120,
  borderRadius: 12,
  color: "white",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
};

// Create card data using stats and current month
const cardData = (stats, month) => [
  {
    label: "Total Balance",
    value: `${formatCurrency(stats.totalBalance)}`,
    icon: <WalletOutlined style={{ fontSize: 32 }} />,
    bg: "linear-gradient(135deg, #34d399, #10b981)",
  },
  {
    label: `Expenses for ${month}`,
    value: `${formatCurrency(stats.totalExpenses)}`,
    icon: <ShoppingOutlined style={{ fontSize: 32 }} />,
    bg: "linear-gradient(135deg, #fca5a5, #f43f5e)",
  },
  {
    label: "Total Savings",
    value: `${formatCurrency(stats.totalSavings)}`,
    icon: <BankOutlined style={{ fontSize: 32 }} />,
    bg: "linear-gradient(135deg, #93c5fd, #3b82f6)",
  },
  {
    label: "Active Budgets",
    value: stats.activeBudgets,
    icon: <FundOutlined style={{ fontSize: 32 }} />,
    bg: "linear-gradient(135deg, #c4b5fd, #8b5cf6)",
  },
];

export default function SummaryCards() {
  const { stats, currentMonth } = useDashboard();

  return (
    <Row gutter={[16, 16]}>
      {cardData(stats, currentMonth).map((card) => (
        <Col xs={24} sm={12} lg={6} key={card.label}>
          <Card style={{ ...cardStyles, background: card.bg }} bodyStyle={{ padding: 20 }}>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-white text-sm">{card.label}</div>
                <div className="text-2xl font-semibold mt-1">{card.value}</div>
              </div>
              <div className="text-white">{card.icon}</div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
