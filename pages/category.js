import ProtectedRoute from "@/context/ProtectRoute";
import dynamic from "next/dynamic";
const SidebarLayout = dynamic(()=>import("@/components/Layout"), {ssr:false})

 function Category() {
  return (
    <SidebarLayout>
     <h1 className="text-2xl font-bold">Category</h1>
     <p>Welcome to your finance management Category.</p>
    </SidebarLayout>
  );
}

export default ProtectedRoute(Category);
