import {
    PieChart,
    Pie,
    Tooltip,
    Cell,
    Legend,
    ResponsiveContainer,
} from "recharts";
// import { PiChartDonutFill } from "react-icons/pi";
import { RiPieChart2Line } from "react-icons/ri";

const COLORS = [
    "#818cf8", // Indigo-400
    "#34d399", // Emerald-400
    "#fbbf24", // Amber-400
    "#c084fc", // Purple-400
    "#fb7185", // Rose-400
    "#60a5fa", // Blue-400
    "#4ade80", // Green-400
    "#38bdf8", // Sky-400
    "#a78bfa", // Violet-400
    "#f87171", // Red-400
];

const SavingsPieChart = ({ savingsByType }) => {
    const data = savingsByType.map((item, index) => ({
        name: item.savingsType,
        value: item.amount,
        fill: COLORS[index % COLORS.length],
    }));

    return (
        <>
            {/* <div className="w-full max-w-md mx-auto bg-white border border-gray-200 rounded-xl shadow p-4"> */}
            <h2 className="text-lg font-semibold mt-4 flex items-center gap-2"> <RiPieChart2Line className="text-xl text-sky-500" />Distribution by Savings Type</h2>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${value.toLocaleString("en-IN")}`} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
            {/* </div> */}
        </>
    );
};

export default SavingsPieChart;
