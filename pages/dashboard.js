import ProtectedRoute from "@/context/ProtectRoute";
import dynamic from "next/dynamic";
import SummaryCards from "@/components/dashboard/SummaryCards";
import ExpensesIncomeChart from "@/components/dashboard/ExpensesIncomeChart";
import CategorySpendingChart from "@/components/dashboard/CategorySpendingChart";
import BudgetUtilization from "@/components/dashboard/BudgetUtilization";
import SavingsTrendChart from "@/components/dashboard/SavingsTrendChart";
import LoanRepaymentChart from "@/components/dashboard/LoanRepaymentChart";
import UpcomingBillsList from "@/components/dashboard/UpcomingBillsList";
import { useState } from "react";
import Head from "next/head";
import { DashboardProvider } from "@/context/DashboardContext";
const SidebarLayout = dynamic(() => import("@/components/Layout"), {
  ssr: false,
});

function Dashboard() {
  const [totalSavings, setTotalSavings] = useState(0);
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
        <SidebarLayout>
          <div className="p-4 space-y-6">
            <SummaryCards totalSavings={totalSavings} />
            <ExpensesIncomeChart />
            <CategorySpendingChart />
            <BudgetUtilization />
            <SavingsTrendChart setTotalSavings={setTotalSavings} />
            <LoanRepaymentChart />
            {/* <UpcomingBillsList /> */}
            {/*TODO: Add section for overdue bills */}
          </div>
        </SidebarLayout>
      </DashboardProvider>
    </>

  );
}

export default ProtectedRoute(Dashboard);

// pages/dashboard.jsx or app/dashboard/page.jsx
