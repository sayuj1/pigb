import ProtectedRoute from "@/context/ProtectRoute";
import dynamic from "next/dynamic";
const SidebarLayout = dynamic(()=>import("@/components/Layout"), {ssr:false})

 function Loans() {
  return (
    <SidebarLayout>
     <h1 className="text-2xl font-bold">Loans</h1>
     <p>Welcome to your finance management Loans.</p>
    </SidebarLayout>
  );
}

export default ProtectedRoute(Loans);
