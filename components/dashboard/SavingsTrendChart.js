import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { Divider } from "antd";
import { PiChartBarDuotone } from "react-icons/pi";
import { formatCurrency, formatIndiaCurrencyWithSuffix } from "@/utils/formatCurrency";
import SavingsPieChart from "./SavingsPieChart";
import { useDashboard } from "@/context/DashboardContext";
import ChartSkeleton from '@/components/resuable/skeletons/ChartSkeleton'

const COLORS = [
  "#818cf8", "#34d399", "#fbbf24", "#c084fc", "#fb7185",
  "#60a5fa", "#4ade80", "#38bdf8", "#a78bfa", "#f87171",
];

export default function SavingsAccountsDistributionChart() {
  const { savings, savingsPie, savingsLoading } = useDashboard();

  if (savingsLoading) {
    //  Show reusable chart skeleton
    return <ChartSkeleton title bars={4} pie />;
  }

  if (!savings.length) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
          <PiChartBarDuotone className="text-xl text-sky-500" />
          Savings Account Distribution
        </h2>
        <div className="flex flex-col items-center justify-center h-60 text-center text-gray-500 space-y-3">
          <div className="text-5xl text-sky-400">
            <PiChartBarDuotone />
          </div>
          <h3 className="text-base font-medium">No savings data found</h3>
          <p className="text-sm text-gray-400">
            Add savings accounts and transactions to visualize distribution.
          </p>
        </div>
      </div>
    );
  }

  const chartData = savings.map((item, i) => ({
    name: item.accountName,
    Balance: item.runningBalance,
    fill: COLORS[i % COLORS.length],
    type: item.savingsType,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const { name, Balance, type } = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-300 rounded shadow text-sm">
        <p className="font-medium">
          {name} (<b className="text-green-500">{formatCurrency(Balance)}</b>)
        </p>
        <p>{type}</p>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
        <PiChartBarDuotone className="text-xl text-sky-500" />
        Savings Account Distribution
      </h2>

      <ResponsiveContainer
        width="100%"
        height={50 + 50 * savings.length}
        className="p-1"
      >
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
        >
          <XAxis
            type="number"
            tickFormatter={formatIndiaCurrencyWithSuffix}
            stroke="#888"
          />
          <YAxis
            type="category"
            dataKey="name"
            width={160}
            tick={{ fontSize: 12, fill: "#333" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar
            dataKey="Balance"
            fill="#3b82f6"
            barSize={30}
            radius={[0, 4, 4, 0]}
            label={{
              position: "right",
              formatter: (v) => `${formatIndiaCurrencyWithSuffix(v)}`,
            }}
          />
        </BarChart>
      </ResponsiveContainer>

      <Divider variant="solid" />

      <SavingsPieChart savingsByType={savingsPie} />
    </div>
  );
}
