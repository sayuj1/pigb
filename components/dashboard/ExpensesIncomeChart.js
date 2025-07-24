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
import {
  getDynamicDx,
  getSecondaryDynamicDx,
} from "../../utils/chartUtils";
import dayjs from "dayjs";
import { formatIndiaCurrencyWithSuffix } from "@/utils/formatCurrency";


const { Title, Text } = Typography;

export default function ExpensesIncomeChart() {
  const [data, setData] = useState([]);

  const query = new URLSearchParams({
    startDate: dayjs().subtract(11, "month").startOf("month").toISOString(),
    endDate: dayjs().endOf("month").toISOString(),
  }).toString();

  useEffect(() => {
    fetch(`/api/dashboard/expenses-income-trend?${query}`)
      .then((r) => r.json())
      .then((json) => setData(json.monthly || []));
  }, []);

  const dynamicDx = getDynamicDx(data, "income");
  const dynamicDxRight = getSecondaryDynamicDx(data, "expense");
  console.log("dx ", dynamicDx, dynamicDxRight);

  return (
    <Card
      title={<Title level={5}>Monthly Expenses vs Income</Title>}
      extra={<Text type="secondary">Last 12 Months</Text>}
      className="shadow-md"
      bodyStyle={{ padding: "1rem" }}
    >
      <ResponsiveContainer width="100%" height={320} className="p-1">
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 40, left: 0, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis
            yAxisId="left"
            tickFormatter={(v) => `${formatIndiaCurrencyWithSuffix(v)}`}
            label={{
              value: "Income Vs Expense (₹)",
              angle: -90,
              position: "outsideLeft",
              dx: dynamicDx,
              style: { textAnchor: "middle" },
            }}
          />
          {/* <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={(v) => `₹${formatYAxis(v)}`}
            label={{
              value: "Expense",
              angle: 90,
              position: "outsideRight",
              dx: dynamicDxRight,
              style: { textAnchor: "middle" },
            }}
          /> */}
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
            yAxisId="left"
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
