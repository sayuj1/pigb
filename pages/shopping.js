import ProtectedRoute from "@/context/ProtectRoute";
import dynamic from "next/dynamic";
const SidebarLayout = dynamic(() => import("@/components/Layout"), {
  ssr: false,
});
const ShoppingComp = dynamic(
  () => import("@/components/shoppings/ShoppingListManager"),
  {
    ssr: false,
  }
);

function Shopping() {
  return (
    <SidebarLayout>
      <ShoppingComp />
    </SidebarLayout>
  );
}

export default ProtectedRoute(Shopping);
