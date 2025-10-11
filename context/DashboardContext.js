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

    const fetchBudgetUtilization = async () => {
        const res = await fetch(`/api/dashboard/budget-utilization?${query}`);
        const json = await res.json();
        setBudgets(json.budgets || []);
    };

    const fetchCategorySpending = async () => {
        const res = await fetch(`/api/dashboard/category-spending?${query}`);
        const json = await res.json();
        setCategoryChartData(
            Object.entries(json.byCategory || {}).map(([name, value]) => ({
                category: name,
                amount: value,
            }))
        );
    };

    const fetchIncomeExpenseTrend = async () => {
        const res = await fetch(`/api/dashboard/expenses-income-trend?${incomeExpenseQuery}`);
        const json = await res.json();
        setIncomeExpenseData(json.monthly || []);
        setIncomeExpenseLoading(false);
    };

    const fetchSavingsTrend = async () => {
        const res = await fetch("/api/dashboard/savings-trend");
        const { savings, summary } = await res.json();
        setSavings(savings || []);
        setSavingsPie(summary?.savingsByType || []);
    };

    const fetchLoanRepayment = async () => {
        const res = await fetch(`/api/dashboard/loan-repayment`);
        const json = await res.json();
        setLoans(json.loans || []);
    };



    useEffect(() => {
        // summary cards
        fetchStats();
        // budget utilization
        fetchBudgetUtilization();
        // spend category chart
        fetchCategorySpending();
        // income expense chart
        fetchIncomeExpenseTrend();
        //savings pie
        fetchSavingsTrend();
        // loans
        fetchLoanRepayment();

    }, []);



    return (
        <DashboardContext.Provider value={{ stats, currentMonth, budgets, categoryChartData, incomeExpenseData, incomeExpenseLoading, savings, savingsPie, loans, fetchStats, fetchLoanRepayment, fetchCategorySpending, fetchIncomeExpenseTrend, fetchSavingsTrend, fetchLoanRepayment }}>
            {children}
        </DashboardContext.Provider>
    );
};

export const useDashboard = () => useContext(DashboardContext);
