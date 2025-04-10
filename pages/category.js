import ProtectedRoute from "@/context/ProtectRoute";
import dynamic from "next/dynamic";
const SidebarLayout = dynamic(() => import("@/components/Layout"), {
  ssr: false,
});
const CategoryComp = dynamic(
  () => import("@/components/categories/CategoryList"),
  {
    ssr: false,
  }
);

function Category() {
  return (
    <SidebarLayout>
      <CategoryComp />
    </SidebarLayout>
  );
}

export default ProtectedRoute(Category);
