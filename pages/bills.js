import ProtectedRoute from "@/context/ProtectRoute";
import dynamic from "next/dynamic";
const SidebarLayout = dynamic(() => import("@/components/Layout"), {
  ssr: false,
});
const BillComp = dynamic(() => import("@/components/bills/Bill"), {
  ssr: false,
});

function Bills() {
  return (
    <SidebarLayout>
      <BillComp />
    </SidebarLayout>
  );
}

export default ProtectedRoute(Bills);
