import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

const COLORS = [
  "#3b82f6", // blue
  "#f59e0b", // amber
  "#10b981", // green
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#0ea5e9", // sky blue
];

export default function SavingsAccountsTrendChart() {
  const [trends, setTrends] = useState([]);
  const [allMonths, setAllMonths] = useState([]);

  useEffect(() => {
    fetch(`/api/dashboard/savings-trend`)
      .then((r) => r.json())
      .then(({ trends, allMonths }) => {
        setTrends(trends || []);
        setAllMonths(allMonths || []);
      });
  }, []);

  if (!trends.length) {
    return (
      <div className="bg-white rounded-lg shadow p-6 flex items-center justify-center h-72 text-gray-500">
        No data available
      </div>
    );
  }

  // Prepare chart data (month + each account balance)
  const chartData = allMonths.map((month) => {
    const obj = { month };
    trends.forEach(({ accountName, balances }) => {
      const balObj = balances.find((b) => b.month === month);
      obj[accountName] = balObj ? balObj.balance : 0;
    });
    return obj;
  });

  return (
    <div className="bg-white rounded-lg shadow p-4 ">
      <h2 className="text-lg font-medium mb-4">
        Savings Account Balances Over Time
      </h2>
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 40, bottom: 5, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={(v) => `₹${v}`} />
          <Tooltip formatter={(value) => `₹${value}`} />
          <Legend verticalAlign="top" height={36} />
          {trends.map(({ accountName }, i) => (
            <Area
              key={accountName}
              type="monotone"
              dataKey={accountName}
              stackId="1"
              stroke={COLORS[i % COLORS.length]}
              fill={COLORS[i % COLORS.length]}
              fillOpacity={0.3}
              activeDot={{ r: 6 }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
