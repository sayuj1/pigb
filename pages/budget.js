import ProtectedRoute from "@/context/ProtectRoute";
import dynamic from "next/dynamic";
const SidebarLayout = dynamic(() => import("@/components/Layout"), {
  ssr: false,
});
const BudgetComp = dynamic(() => import("@/components/budgets/Budget"), {
  ssr: false,
});

function Budget() {
  return (
    <SidebarLayout>
      <BudgetComp />
    </SidebarLayout>
  );
}

export default ProtectedRoute(Budget);
