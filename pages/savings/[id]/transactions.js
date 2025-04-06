import ProtectedRoute from "@/context/ProtectRoute";
import dynamic from "next/dynamic";
const SidebarLayout = dynamic(() => import("@/components/Layout"), {
  ssr: false,
});
const SavingsComp = dynamic(
  () => import("@/components/savings/transactions/SavingsTransactions"),
  {
    ssr: false,
  }
);

function SavingsTransaction() {
  return (
    <SidebarLayout>
      <SavingsComp />
    </SidebarLayout>
  );
}

export default ProtectedRoute(SavingsTransaction);
