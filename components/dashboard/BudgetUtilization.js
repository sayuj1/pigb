import { useEffect, useState } from "react";
import { Progress, Tooltip, Typography } from "antd";
import { PieChartOutlined } from "@ant-design/icons";
import { PiWalletLight } from "react-icons/pi";
import dayjs from "dayjs";

export default function BudgetUtilization() {
  const [budgets, setBudgets] = useState([]);

  const query = new URLSearchParams({
    todayDate: dayjs().startOf("day").toISOString(),
  }).toString();

  useEffect(() => {
    fetch(`/api/dashboard/budget-utilization?${query}`)
      .then((r) => r.json())
      .then((json) => setBudgets(json.budgets || []));
  }, []);

  const getStrokeColor = (percent) => {
    if (percent < 70) return "#faad14"; // green
    if (percent < 90) return "#52c41a"; // orange
    return "#ff4d4f"; // red
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6  mx-auto w-[100%]">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
        Budget Utilization
        <span className="inline-flex items-center gap-1 px-2 py-[2px] bg-green-100 text-green-700 text-xs font-semibold rounded-full">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Active
        </span>
      </h2>
      {budgets.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-center text-gray-500 space-y-3">
          <div className="text-5xl text-green-400">
            <PiWalletLight />
          </div>
          <Typography.Title level={5} className="!mb-0">
            No budgets available
          </Typography.Title>
          <Typography.Text type="secondary">
            Start by creating a new budget to track your expenses.
          </Typography.Text>
        </div>
      )}
      <div className="space-y-6">
        {budgets.map((b) => {
          const percent = Math.min(100, Math.round((b.spent / b.limit) * 100));
          return (
            <div
              key={b.id}
              className="flex items-center gap-4 p-3 rounded-md hover:bg-gray-50 transition"
            >
              <Tooltip title="Budget">
                <PieChartOutlined className="text-blue-500 text-2xl flex-shrink-0" />
              </Tooltip>

              <div className="flex-1">
                <p className="text-md font-medium text-gray-900 mb-1">
                  {b.name}
                </p>
                <Progress
                  percent={percent}
                  strokeColor={getStrokeColor(percent)}
                  strokeWidth={12}
                  showInfo={false}
                  strokeLinecap="round"
                />
                <p className="text-xs text-gray-500 mt-1">
                  ₹{b.spent.toLocaleString()} / ₹{b.limit.toLocaleString()} (
                  {percent}%)
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
