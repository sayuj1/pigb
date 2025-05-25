import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LabelList,
} from "recharts";

const COLORS = ["#22c55e", "#ef4444"]; // emerald: Paid, red: Remaining

const getLoanTypeBadge = (type) => {
  const display = type?.charAt(0).toUpperCase() + type?.slice(1);
  const color = type === "taken" ? "#ef4444" : "#22c55e"; // red or emerald
  return `<span style="background:${color};color:white;padding:2px 6px;border-radius:4px;font-size:12px">${display} Loan</span>`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const loan = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded shadow border border-gray-100 text-sm">
        <div className="font-semibold text-gray-800 mb-1">{label}</div>
        <div
          dangerouslySetInnerHTML={{ __html: getLoanTypeBadge(loan.type) }}
          className="mb-2"
        />
        <div className="text-gray-600">
          <span className="font-medium text-green-600">Paid:</span> ₹
          {loan.Paid.toLocaleString()}
        </div>
        <div className="text-gray-600">
          <span className="font-medium text-red-500">Remaining:</span> ₹
          {loan.Remaining.toLocaleString()}
        </div>
        <div className="text-gray-800 mt-1 font-medium">
          Total: ₹{loan.Total.toLocaleString()}
        </div>
      </div>
    );
  }

  return null;
};

export default function LoanRepaymentChart() {
  const [loans, setLoans] = useState([]);

  useEffect(() => {
    fetch(`/api/dashboard/loan-repayment`)
      .then((r) => r.json())
      .then((json) => setLoans(json.loans || []));
  }, []);

  if (loans.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400 text-sm">
        No loan repayment data available.
      </div>
    );
  }

  const chartData = loans.map((loan) => ({
    name: loan.name,
    Paid: loan.paid,
    Remaining: loan.remaining,
    Total: loan.paid + loan.remaining,
    type: loan.type,
  }));

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        Loan Repayment Progress
      </h2>
      <p className="text-sm text-gray-500 mb-4">Paid vs Remaining by Loan</p>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 0, bottom: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-20} textAnchor="end" height={80} />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" height={36} iconType="circle" />
          <Bar dataKey="Paid" fill={COLORS[0]} radius={[4, 4, 0, 0]}>
            <LabelList
              dataKey="Paid"
              position="top"
              formatter={(val) => `₹${val.toLocaleString()}`}
            />
          </Bar>
          <Bar dataKey="Remaining" fill={COLORS[1]} radius={[4, 4, 0, 0]}>
            <LabelList
              dataKey="Remaining"
              position="top"
              formatter={(val) => `₹${val.toLocaleString()}`}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
