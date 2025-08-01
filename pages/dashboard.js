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
const SidebarLayout = dynamic(() => import("@/components/Layout"), {
  ssr: false,
});

function Dashboard() {
  const [totalSavings, setTotalSavings] = useState(0);
  return (
    <SidebarLayout>
      <div className="p-4 space-y-6">
        <SummaryCards totalSavings={totalSavings} />
        <ExpensesIncomeChart />
        <CategorySpendingChart />
        <BudgetUtilization />
        <SavingsTrendChart setTotalSavings={setTotalSavings} />
        <LoanRepaymentChart />
        {/* <UpcomingBillsList /> */}
      </div>
    </SidebarLayout>
  );
}

export default ProtectedRoute(Dashboard);

// pages/dashboard.jsx or app/dashboard/page.jsx
