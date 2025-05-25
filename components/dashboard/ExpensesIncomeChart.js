import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  Area,
  CartesianGrid,
} from "recharts";
import { Card, Typography } from "antd";

const { Title, Text } = Typography;

export default function ExpensesIncomeChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch(`/api/dashboard/expenses-income-trend`)
      .then((r) => r.json())
      .then((json) => setData(json.monthly || []));
  }, []);

  return (
    <Card
      title={<Title level={5}>Monthly Expenses vs Income</Title>}
      extra={<Text type="secondary">Last 12 Months</Text>}
      className="shadow-md"
      bodyStyle={{ padding: "1rem" }}
    >
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 40, left: 0, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis yAxisId="left" tickFormatter={(v) => `₹${v}`} />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={(v) => `₹${v}`}
          />
          <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
          <Legend />
          <Bar
            yAxisId="left"
            dataKey="income"
            name="Income"
            fill="#34d399"
            barSize={30}
            radius={[4, 4, 0, 0]}
          />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="expense"
            name="Expense"
            stroke="#f87171"
            fill="#fca5a5"
            strokeWidth={2}
            fillOpacity={0.4}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Card>
  );
}
