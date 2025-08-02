import { useEffect, useState } from "react";
import { Card, Row, Col } from "antd";
import {
  WalletOutlined,
  BankOutlined,
  ShoppingOutlined,
  FundOutlined,

} from "@ant-design/icons";
import { format } from "date-fns";
import dayjs from "dayjs";
import { formatCurrency, formatIndiaCurrencyWithSuffix } from "@/utils/formatCurrency";

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
    bg: "linear-gradient(135deg, #34d399, #10b981)", // Soft Emerald Green
  },
  {
    label: `Expenses for ${month}`,
    value: `${formatCurrency(stats.totalExpenses)}`,
    icon: <ShoppingOutlined style={{ fontSize: 32 }} />,
    bg: "linear-gradient(135deg, #fca5a5, #f43f5e)", // Rosy Red
  },
  {
    label: "Total Savings",
    value: `${formatCurrency(stats.totalSavings)}`,
    icon: <BankOutlined style={{ fontSize: 32 }} />,
    bg: "linear-gradient(135deg, #93c5fd, #3b82f6)", // Calming Sky Blue
  },
  {
    label: "Active Budgets",
    value: stats.activeBudgets,
    icon: <FundOutlined style={{ fontSize: 32 }} />,
    bg: "linear-gradient(135deg, #c4b5fd, #8b5cf6)", // Soft Violet
  },
]
  ;

export default function SummaryCards() {
  const [stats, setStats] = useState({
    totalBalance: 0,
    // upcomingBills: 0,
    totalExpenses: 0,
    activeBudgets: 0,
    totalSavings: 0,
  });

  // Get current month name (e.g., May)
  // const month = new Date().toLocaleString("default", { month: "long" });
  const currentMonth = format(new Date(), "MMMM yyyy");

  const query = new URLSearchParams({
    startDate: dayjs().startOf("month").toISOString(),
    endDate: dayjs().endOf("month").toISOString(),

  }).toString();



  const active_budget_query = new URLSearchParams({
    todayDate: dayjs().startOf("day").toISOString(),
  }).toString();

  useEffect(() => {
    Promise.all([
      fetch(`/api/dashboard/total-balance`).then((r) => r.json()),
      // fetch(`/api/dashboard/upcoming-bills`).then((r) => r.json()),
      fetch(`/api/dashboard/total-expenses?${query}`).then((r) => r.json()),
      fetch(`/api/dashboard/active-budgets?${active_budget_query}`).then((r) => r.json()),
      fetch(`/api/dashboard/total-savings`).then((r) => r.json()),
    ])
      .then(([bal, exp, buds, sav]) => {
        setStats({
          totalBalance: bal.totalBalance,
          // upcomingBills: bills.count,
          totalExpenses: exp.totalExpenses,
          activeBudgets: buds.count,
          totalSavings: sav.totalSavings,
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
