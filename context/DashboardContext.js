import { createContext, useContext, useEffect, useState } from "react";
import dayjs from "dayjs";
import { format } from "date-fns";

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
    const [stats, setStats] = useState({
        totalBalance: 0,
        totalExpenses: 0,
        activeBudgets: 0,
        totalSavings: 0,
    });
    const [incomeExpenseData, setIncomeExpenseData] = useState([]);
    const [incomeExpenseLoading, setIncomeExpenseLoading] = useState(true);
    const [budgets, setBudgets] = useState([]);
    const [categoryChartData, setCategoryChartData] = useState([]);
    const [savings, setSavings] = useState([]);
    const [savingsPie, setSavingsPie] = useState([]);
    const [loans, setLoans] = useState([]);

    const currentMonth = format(new Date(), "MMMM yyyy");//dayjs().format("MMMM yyyy");

    const query = new URLSearchParams({
        startDate: dayjs().startOf("month").toISOString(),
        endDate: dayjs().endOf("month").toISOString(),
    }).toString();

    const incomeExpenseQuery = new URLSearchParams({
        startDate: dayjs().subtract(11, "month").startOf("month").toISOString(),
        endDate: dayjs().endOf("month").toISOString(),
    }).toString();

    const fetchStats = async () => {
        try {
            const [bal, exp, buds, sav] = await Promise.all([
                fetch(`/api/dashboard/total-balance`).then((r) => r.json()),
                fetch(`/api/dashboard/total-expenses?${query}`).then((r) => r.json()),
                fetch(`/api/dashboard/active-budgets?${query}`).then((r) =>
                    r.json()
                ),
                fetch(`/api/dashboard/total-savings`).then((r) => r.json()),
            ]);

            setStats({
                totalBalance: bal.totalBalance,
                totalExpenses: exp.totalExpenses,
                activeBudgets: buds.count,
                totalSavings: sav.totalSavings,
            });
        } catch (err) {
            console.error("Error fetching dashboard stats:", err);
        }
    };

    useEffect(() => {
        // summary cards
        fetchStats();
        // budget utilization
        fetch(`/api/dashboard/budget-utilization?${query}`)
            .then((r) => r.json())
            .then((json) => setBudgets(json.budgets || []));
        // spend category chart
        fetch(`/api/dashboard/category-spending?${query}`)
            .then((r) => r.json())
            .then((json) => {
                setCategoryChartData(
                    Object.entries(json.byCategory || {}).map(([name, value]) => ({
                        category: name,
                        amount: value,
                    }))
                );
            });
        // income expense chart
        fetch(`/api/dashboard/expenses-income-trend?${incomeExpenseQuery}`)
            .then((r) => r.json())
            .then((json) => {
                setIncomeExpenseData(json.monthly || []);
                setIncomeExpenseLoading(false);
            });
        //savings pie
        fetch("/api/dashboard/savings-trend")
            .then((r) => r.json())
            .then(({ savings, summary }) => {
                setSavings(savings || []);
                setSavingsPie(summary?.savingsByType || []);
            });
        // loans
        fetch(`/api/dashboard/loan-repayment`)
            .then((r) => r.json())
            .then((json) => setLoans(json.loans || []));
    }, []);



    return (
        <DashboardContext.Provider value={{ stats, currentMonth, fetchStats, budgets, categoryChartData, incomeExpenseData, incomeExpenseLoading, savings, savingsPie, loans }}>
            {children}
        </DashboardContext.Provider>
    );
};

export const useDashboard = () => useContext(DashboardContext);
