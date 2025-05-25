import { useEffect, useState } from "react";
import { Card, Row, Col } from "antd";
import {
  WalletOutlined,
  CalendarOutlined,
  ShoppingOutlined,
  FundOutlined,
} from "@ant-design/icons";
import { format } from "date-fns";

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
    value: `₹${stats.totalBalance.toLocaleString()}`,
    icon: <WalletOutlined style={{ fontSize: 32 }} />,
    bg: "linear-gradient(135deg, #4ade80, #22c55e)",
  },
  {
    label: "Upcoming Bills",
    value: stats.upcomingBills,
    icon: <CalendarOutlined style={{ fontSize: 32 }} />,
    bg: "linear-gradient(135deg, #facc15, #eab308)",
  },
  {
    label: `Expenses for ${month}`,
    value: `₹${stats.totalExpenses.toLocaleString()}`,
    icon: <ShoppingOutlined style={{ fontSize: 32 }} />,
    bg: "linear-gradient(135deg, #f87171, #ef4444)",
  },
  {
    label: "Active Budgets",
    value: stats.activeBudgets,
    icon: <FundOutlined style={{ fontSize: 32 }} />,
    bg: "linear-gradient(135deg, #60a5fa, #3b82f6)",
  },
];

export default function SummaryCards() {
  const [stats, setStats] = useState({
    totalBalance: 0,
    upcomingBills: 0,
    totalExpenses: 0,
    activeBudgets: 0,
  });

  // Get current month name (e.g., May)
  // const month = new Date().toLocaleString("default", { month: "long" });
  const currentMonth = format(new Date(), "MMMM yyyy");

  useEffect(() => {
    Promise.all([
      fetch(`/api/dashboard/total-balance`).then((r) => r.json()),
      fetch(`/api/dashboard/upcoming-bills`).then((r) => r.json()),
      fetch(`/api/dashboard/total-expenses`).then((r) => r.json()),
      fetch(`/api/dashboard/active-budgets`).then((r) => r.json()),
    ])
      .then(([bal, bills, exp, buds]) => {
        setStats({
          totalBalance: bal.totalBalance,
          upcomingBills: bills.count,
          totalExpenses: exp.totalExpenses,
          activeBudgets: buds.count,
        });
      })
      .catch((err) => console.log("error ", err));
  }, []);

  return (
    <Row gutter={[16, 16]}>
      {cardData(stats, currentMonth).map((card) => (
        <Col xs={24} sm={12} lg={6} key={card.label}>
          <Card
            style={{
              ...cardStyles,
              background: card.bg,
            }}
            bodyStyle={{ padding: 20 }}
          >
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
