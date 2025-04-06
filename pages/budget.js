import ProtectedRoute from "@/context/ProtectRoute";
import dynamic from "next/dynamic";
const SidebarLayout = dynamic(()=>import("@/components/Layout"), {ssr:false})

 function Budget() {
  return (
    <SidebarLayout>
     <h1 className="text-2xl font-bold">Budget</h1>
     <p>Welcome to your finance management Budget.</p>
    </SidebarLayout>
  );
}

export default ProtectedRoute(Budget);
