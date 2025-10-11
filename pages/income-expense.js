import ProtectedRoute from "@/context/ProtectRoute";
import { TransactionProvider } from "@/context/TransactionContext";
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
    <TransactionProvider>
      <SidebarLayout>
        <Transactions />
      </SidebarLayout>
    </TransactionProvider>
  );
}

export default ProtectedRoute(IncomeExpense);
