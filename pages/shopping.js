import ProtectedRoute from "@/context/ProtectRoute";
import dynamic from "next/dynamic";
const SidebarLayout = dynamic(()=>import("@/components/Layout"), {ssr:false})

 function Shopping() {
  return (
    <SidebarLayout>
     <h1 className="text-2xl font-bold">Shopping</h1>
     <p>Welcome to your finance management Shopping.</p>
    </SidebarLayout>
  );
}

export default ProtectedRoute(Shopping);
