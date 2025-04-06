import ProtectedRoute from "@/context/ProtectRoute";
import dynamic from "next/dynamic";
const SidebarLayout = dynamic(()=>import("@/components/Layout"), {ssr:false})

 function Bills() {
  return (
    <SidebarLayout>
     <h1 className="text-2xl font-bold">Bills</h1>
     <p>Welcome to your finance management Bills.</p>
    </SidebarLayout>
  );
}

export default ProtectedRoute(Bills);
