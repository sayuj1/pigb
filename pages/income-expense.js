import ProtectedRoute from "@/context/ProtectRoute";
import dynamic from "next/dynamic";
const SidebarLayout = dynamic(() => import("@/components/Layout"), {
  ssr: false,
});
const Transactions = dynamic(
  () => import("@/components/transactions/Transactions"),
  { ssr: false }
);

function IncomeExpense() {
  return (
    <SidebarLayout>
      <Transactions />
    </SidebarLayout>
  );
}

export default ProtectedRoute(IncomeExpense);
