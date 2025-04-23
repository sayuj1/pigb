import ProtectedRoute from "@/context/ProtectRoute";
import dynamic from "next/dynamic";
const SidebarLayout = dynamic(() => import("@/components/Layout"), {
  ssr: false,
});
const LoanComp = dynamic(() => import("@/components/loans/LoanManagement"), {
  ssr: false,
});

function Loans() {
  return (
    <SidebarLayout>
      <LoanComp />
    </SidebarLayout>
  );
}

export default ProtectedRoute(Loans);
