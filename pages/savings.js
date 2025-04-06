import ProtectedRoute from "@/context/ProtectRoute";
import dynamic from "next/dynamic";
const SidebarLayout = dynamic(() => import("@/components/Layout"), {
  ssr: false,
});
const SavingsComp = dynamic(() => import("@/components/savings/Savings"), {
  ssr: false,
});

function Savings() {
  return (
    <SidebarLayout>
      <SavingsComp />
    </SidebarLayout>
  );
}

export default ProtectedRoute(Savings);
