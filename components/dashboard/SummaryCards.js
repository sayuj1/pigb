import { Card, Row, Col, Typography } from "antd";
import {
  PiWalletDuotone,
  PiTrendDownDuotone,
  PiBankDuotone,
  PiTargetDuotone,
} from "react-icons/pi";
import { formatCurrency } from "@/utils/formatCurrency";
import { useDashboard } from "@/context/DashboardContext";
import SummaryCardSkeleton from "../resuable/skeletons/SummaryCardSkeleton";

const { Text, Title } = Typography;

const cardData = (stats, month) => [
  {
    label: "Total Balance",
    value: formatCurrency(stats.totalBalance),
    icon: <PiWalletDuotone className="text-2xl text-emerald-600" />,
    accent: "emerald",
    bg: "from-emerald-50 to-emerald-200/50",
    border: "border-emerald-200/60",
    text: "text-emerald-800",
  },
  {
    label: `Expenses for ${month}`,
    value: formatCurrency(stats.totalExpenses),
    icon: <PiTrendDownDuotone className="text-2xl text-rose-600" />,
    accent: "rose",
    bg: "from-rose-50 to-rose-200/50",
    border: "border-rose-200/60",
    text: "text-rose-800",
  },
  {
    label: "Total Savings",
    value: formatCurrency(stats.totalSavings),
    icon: <PiBankDuotone className="text-2xl text-blue-600" />,
    accent: "blue",
    bg: "from-blue-50 to-blue-200/50",
    border: "border-blue-200/60",
    text: "text-blue-800",
  },
  {
    label: "Active Budgets",
    value: stats.activeBudgets,
    icon: <PiTargetDuotone className="text-2xl text-indigo-600" />,
    accent: "indigo",
    bg: "from-indigo-50 to-indigo-200/50",
    border: "border-indigo-200/60",
    text: "text-indigo-800",
  },
];

export default function SummaryCards() {
  const { stats, currentMonth, statsLoading } = useDashboard();

  if (statsLoading) return <SummaryCardSkeleton />;

  return (
    <Row gutter={[16, 16]}>
      {cardData(stats, currentMonth).map((card) => (
        <Col xs={24} sm={12} lg={6} key={card.label}>
          <div className={`relative overflow-hidden rounded-2xl p-5 h-28 flex flex-col justify-center transition-all duration-300 hover:shadow-md border bg-gradient-to-br ${card.bg} ${card.border} group`}>
            <div className="relative z-10 flex justify-between items-center">
              <div className="flex-1 min-w-0">
                <Text className="text-gray-500 uppercase text-[9px] font-bold tracking-widest mb-1.5 block">
                  {card.label}
                </Text>
                <div className={`text-lg font-bold truncate ${card.text}`}>
                  {card.value}
                </div>
              </div>
              <div className={`bg-white p-2.5 rounded-xl shadow-sm border ${card.border} flex items-center justify-center`}>
                {card.icon}
              </div>
            </div>
          </div>
        </Col>
      ))}
    </Row>
  );
}
