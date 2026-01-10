import ProtectedRoute from "@/context/ProtectRoute";
import { useState } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import SummaryCards from "@/components/dashboard/SummaryCards";
import ExpensesIncomeChart from "@/components/dashboard/ExpensesIncomeChart";
import CategorySpendingChart from "@/components/dashboard/CategorySpendingChart";
import BudgetUtilization from "@/components/dashboard/BudgetUtilization";
import SavingsTrendChart from "@/components/dashboard/SavingsTrendChart";
import LoanRepaymentChart from "@/components/dashboard/LoanRepaymentChart";
import GoalProgress from "@/components/dashboard/GoalProgress";
import { DashboardProvider, useDashboard } from "@/context/DashboardContext";
import DashboardWelcome from "@/components/dashboard/DashboardWelcome";


const SidebarLayout = dynamic(() => import("@/components/Layout"), {
  ssr: false,
});

function DashboardView() {
  const [totalSavings, setTotalSavings] = useState(0);
  const {
    budgets,
    goalStats,
    incomeExpenseData,
    categoryChartData,
    savings,
    loans,
    stats,
    statsLoading,
    budgetsLoading,
    goalStatsLoading,
    categoryLoading,
    incomeExpenseLoading,
    savingsLoading,
    loansLoading
  } = useDashboard();

  const isEverythingEmpty = !statsLoading && !budgetsLoading && !goalStatsLoading && !categoryLoading && !incomeExpenseLoading && !savingsLoading && !loansLoading &&
    stats.totalBalance === 0 &&
    stats.totalExpenses === 0 &&
    budgets.length === 0 &&
    goalStats.totalGoals === 0 &&
    incomeExpenseData.length === 0 &&
    categoryChartData.length === 0 &&
    savings.length === 0 &&
    loans.length === 0;

  return (
    <SidebarLayout>
      <div className="p-4 space-y-6">
        <div className="flex justify-between items-center">
          {!isEverythingEmpty && <h2 className="text-2xl font-semibold text-gray-800">Overview</h2>}
        </div>

        {isEverythingEmpty ? (
          <DashboardWelcome />
        ) : (
          <>
            <SummaryCards totalSavings={totalSavings} />
            <ExpensesIncomeChart />
            <CategorySpendingChart />
            <BudgetUtilization />
            <GoalProgress />
            <SavingsTrendChart setTotalSavings={setTotalSavings} />
            <LoanRepaymentChart />
          </>
        )}
        {/* <UpcomingBillsList /> */}
        {/*TODO: Add section for overdue bills */}
      </div>
    </SidebarLayout>
  );
}

function Dashboard() {
  return (
    <>
      <Head>
        <title>Pigb Dashboard</title>
        <meta
          name="description"
          content="Get a bird’s-eye view of your finances with real-time insights into balances, bills, and budgets."
        />
      </Head>
      <DashboardProvider>
        <DashboardView />
      </DashboardProvider>
    </>
  );
}

export default ProtectedRoute(Dashboard);
