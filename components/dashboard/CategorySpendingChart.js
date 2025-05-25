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

  useEffect(() => {
    fetch(`/api/dashboard/category-spending`)
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
        <Typography.Title level={5}>Spending by Category</Typography.Title>
      }
      extra={<Typography.Text type="secondary">{currentMonth}</Typography.Text>}
      className="shadow-md"
      style={{ marginTop: 24 }}
    >
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 20, right: 20, left: 40, bottom: 10 }}
        >
          <XAxis type="number" tickFormatter={(v) => `₹${v}`} />
          <YAxis dataKey="category" type="category" width={120} />
          <Tooltip formatter={(v) => `₹${v}`} />
          <Legend />
          <Bar dataKey="amount" fill="#1890ff">
            {data.map((entry, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
