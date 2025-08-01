import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  Legend,
} from "recharts";
import { Card, Typography } from "antd";
import { format } from "date-fns";
import { PiChartBarLight } from "react-icons/pi";
import dayjs from "dayjs";
import { formatIndiaCurrencyWithSuffix } from "@/utils/formatCurrency";

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#a0d911",
  "#ff4d4f",
  "#36cfc9",
  "#f759ab",
  "#597ef7",
];

export default function CategorySpendingBarChart() {
  const [data, setData] = useState([]);
  const currentMonth = format(new Date(), "MMMM yyyy");

  const query = new URLSearchParams({
    startDate: dayjs().startOf("month").toISOString(),
    endDate: dayjs().endOf("month").toISOString(),
  }).toString();

  useEffect(() => {
    fetch(`/api/dashboard/category-spending?${query}`)
      .then((r) => r.json())
      .then((json) => {
        setData(
          Object.entries(json.byCategory || {}).map(([name, value]) => ({
            category: name,
            amount: value,
          }))
        );
      });
  }, []);

  return (
    <Card
      title={
        <Typography.Title level={5}>
          <span className="flex items-center gap-2">
            <PiChartBarLight className="text-2xl text-blue-400" />
            Spending by Category
          </span>
        </Typography.Title>
      }
      extra={<Typography.Text type="secondary">{currentMonth}</Typography.Text>}
      className="shadow-md"
      style={{ marginTop: 24, minHeight: 350 }}
    >
      {data.length === 0 ? (
        <div className="flex flex-col justify-center items-center h-[300px] text-gray-500 text-center space-y-3">
          <div className="text-5xl text-blue-400">
            <PiChartBarLight />
          </div>
          <Typography.Title level={5} className="!mb-0">
            No category spending data found
          </Typography.Title>
          <Typography.Text type="secondary">
            No spending has been recorded for this month.
          </Typography.Text>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={350} className="p-1">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 20, right: 20, left: 40, bottom: 10 }}
          >
            <XAxis type="number" tickFormatter={(v) => `${formatIndiaCurrencyWithSuffix(v)}`}
            />
            <YAxis dataKey="category" type="category" width={120} />
            <Tooltip formatter={(v) => `₹${v}`} />
            <Legend
              content={() => (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 8,
                    justifyContent: "center",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      backgroundColor: "#e9505dff", // Match your bar color
                      borderRadius: 2,
                    }}
                  ></div>
                  <span style={{ color: "#e9505dff" }}>Expense (₹)</span>
                </div>
              )}
            />

            <Bar dataKey="amount" fill="#1890ff">
              {data.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
