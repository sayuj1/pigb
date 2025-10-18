import React from "react";
import { Progress, Tooltip, Typography } from "antd";
import { PieChartOutlined, CalendarOutlined } from "@ant-design/icons";
import { PiWalletLight } from "react-icons/pi";
import { useDashboard } from "@/context/DashboardContext";
import BudgetSkeleton from "../resuable/skeletons/BudgetSkeleton";
import dayjs from "dayjs";

export default function BudgetUtilization() {
  const { budgets, currentMonth, budgetsLoading } = useDashboard();

  const getStrokeColor = (percent) => {
    if (percent < 50) return "#52c41a"; // green
    if (percent < 90) return "#faad14"; // orange
    return "#ff4d4f"; // red
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6 mx-auto w-[100%]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-0">
            <PiWalletLight className="text-xl text-green-500" /> Budget Utilization
            {budgets.length > 0 && !budgetsLoading && (
              <> ({currentMonth})</>
            )}
          </h2>
        </div>

        <Typography.Text type="secondary" className="text-sm">
          {currentMonth}
        </Typography.Text>
      </div>

      {/* Loader */}
      {budgetsLoading ? (
        <BudgetSkeleton />
      ) : budgets.length === 0 ? (
        // Empty State
        <div className="flex flex-col items-center justify-center h-64 text-center text-gray-500 space-y-3">
          <div className="text-5xl text-green-400">
            <PiWalletLight className="text-5xl text-green-400" />
          </div>
          <Typography.Title level={5} className="!mb-0">
            No budgets available
          </Typography.Title>
          <Typography.Text type="secondary">
            Start by creating a new budget to track your expenses.
          </Typography.Text>
        </div>
      ) : (
        // Loaded Data
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
                  {/* Budget name */}
                  <p className="text-md font-medium text-gray-900 mb-1">
                    {b.name}
                  </p>

                  {/* Category + Date Range */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-2">
                    {b.category && (
                      <span className="flex items-center gap-1">

                        <span className="capitalize">{b.category}</span>
                      </span>
                    )}
                    {(b.startDate || b.endDate) && (
                      <span className="flex items-center gap-1">
                        <CalendarOutlined className="text-gray-400" />
                        <span>
                          {dayjs(b.startDate).format("DD MMM")} -{" "}
                          {dayjs(b.endDate).format("DD MMM YYYY")}
                        </span>
                      </span>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <Progress
                    percent={percent}
                    strokeColor={getStrokeColor(percent)}
                    strokeWidth={12}
                    showInfo={false}
                    strokeLinecap="round"
                  />

                  {/* Spend Summary */}
                  <p className="text-xs text-gray-500 mt-1">
                    ₹{b.spent.toLocaleString()} / ₹{b.limit.toLocaleString()} (
                    {percent}%)
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
