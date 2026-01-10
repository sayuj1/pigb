import { createContext, useContext, useEffect, useState } from "react";
import dayjs from "dayjs";
import { format } from "date-fns";

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
    // Data States
    const [stats, setStats] = useState({
        totalBalance: 0,
        totalExpenses: 0,
        activeBudgets: 0,
        totalSavings: 0,
    });
    const [budgets, setBudgets] = useState([]);
    const [categoryChartData, setCategoryChartData] = useState([]);
    const [incomeExpenseData, setIncomeExpenseData] = useState([]);
    const [savings, setSavings] = useState([]);
    const [savingsPie, setSavingsPie] = useState([]);
    const [loans, setLoans] = useState([]);
    const [goalStats, setGoalStats] = useState({
        totalGoals: 0,
        completedGoals: 0,
        pendingGoals: 0,
        totalTargetAmount: 0,
        totalCurrentAmount: 0,
        nearingDeadline: 0,
        overdue: 0
    });

    // Loader States
    const [statsLoading, setStatsLoading] = useState(false);
    const [budgetsLoading, setBudgetsLoading] = useState(false);
    const [categoryLoading, setCategoryLoading] = useState(false);
    const [incomeExpenseLoading, setIncomeExpenseLoading] = useState(false);
    const [savingsLoading, setSavingsLoading] = useState(false);
    const [loansLoading, setLoansLoading] = useState(false);
    const [goalStatsLoading, setGoalStatsLoading] = useState(false);

    const currentMonth = format(new Date(), "MMMM yyyy");

    const query = new URLSearchParams({
        startDate: dayjs().startOf("month").toISOString(),
        endDate: dayjs().endOf("month").toISOString(),
    }).toString();

    const incomeExpenseQuery = new URLSearchParams({
        startDate: dayjs().subtract(5, "month").startOf("month").toISOString(),
        endDate: dayjs().endOf("month").toISOString(),
    }).toString();

    // Fetch functions with loader handling

    const fetchStats = async () => {
        setStatsLoading(true);
        try {
            const [bal, exp, buds, sav] = await Promise.all([
                fetch(`/api/dashboard/total-balance`).then((r) => r.json()),
                fetch(`/api/dashboard/total-expenses?${query}`).then((r) => r.json()),
                fetch(`/api/dashboard/active-budgets?${query}`).then((r) => r.json()),
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
        } finally {
            setStatsLoading(false);
        }
    };

    const fetchBudgetUtilization = async () => {
        setBudgetsLoading(true);
        try {
            const res = await fetch(`/api/dashboard/budget-utilization?${query}`);
            const json = await res.json();
            setBudgets(json.budgets || []);
        } catch (err) {
            console.error("Error fetching budgets:", err);
        } finally {
            setBudgetsLoading(false);
        }
    };

    const fetchCategorySpending = async () => {
        setCategoryLoading(true);
        try {
            const res = await fetch(`/api/dashboard/category-spending?${query}`);
            const json = await res.json();
            setCategoryChartData(
                Object.entries(json.byCategory || {}).map(([name, value]) => ({
                    category: name,
                    amount: value,
                }))
            );
        } catch (err) {
            console.error("Error fetching category spending:", err);
        } finally {
            setCategoryLoading(false);
        }
    };

    const fetchIncomeExpenseTrend = async () => {
        setIncomeExpenseLoading(true);
        try {
            const res = await fetch(
                `/api/dashboard/expenses-income-trend?${incomeExpenseQuery}`
            );
            const json = await res.json();
            setIncomeExpenseData(json.monthly || []);
        } catch (err) {
            console.error("Error fetching income/expense trend:", err);
        } finally {
            setIncomeExpenseLoading(false);
        }
    };

    const fetchSavingsTrend = async () => {
        setSavingsLoading(true);
        try {
            const res = await fetch("/api/dashboard/savings-trend");
            const { savings, summary } = await res.json();
            setSavings(savings || []);
            setSavingsPie(summary?.savingsByType || []);
        } catch (err) {
            console.error("Error fetching savings trend:", err);
        } finally {
            setSavingsLoading(false);
        }
    };

    const fetchLoanRepayment = async () => {
        setLoansLoading(true);
        try {
            const res = await fetch(`/api/dashboard/loan-repayment`);
            const json = await res.json();
            setLoans(json.loans || []);
        } catch (err) {
            console.error("Error fetching loan repayment:", err);
        } finally {
            setLoansLoading(false);
        }
    };

    const fetchGoalStats = async () => {
        setGoalStatsLoading(true);
        try {
            const res = await fetch("/api/dashboard/goal-status");
            const json = await res.json();
            setGoalStats(json);
        } catch (err) {
            console.error("Error fetching goal stats:", err);
        } finally {
            setGoalStatsLoading(false);
        }
    };

    const fetchAllDashboardData = () => {
        fetchStats();
        fetchBudgetUtilization();
        fetchCategorySpending();
        fetchIncomeExpenseTrend();
        fetchSavingsTrend();
        fetchLoanRepayment();
        fetchGoalStats();
    };

    useEffect(() => {
        fetchAllDashboardData();
    }, []);

    return (
        <DashboardContext.Provider
            value={{
                // Data
                stats,
                currentMonth,
                budgets,
                categoryChartData,
                incomeExpenseData,
                savings,
                savingsPie,
                loans,
                goalStats,

                // Loaders
                statsLoading,
                budgetsLoading,
                categoryLoading,
                incomeExpenseLoading,
                savingsLoading,
                loansLoading,
                goalStatsLoading,

                // Fetchers
                fetchStats,
                fetchBudgetUtilization,
                fetchCategorySpending,
                fetchIncomeExpenseTrend,
                fetchSavingsTrend,
                fetchLoanRepayment,
                fetchGoalStats,
                fetchAllDashboardData,
            }}
        >
            {children}
        </DashboardContext.Provider>
    );
};

export const useDashboard = () => useContext(DashboardContext);
