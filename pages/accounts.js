import ProtectedRoute from "@/context/ProtectRoute";
import dynamic from "next/dynamic";

const AccountComp = dynamic(()=>import("@/components/accounts/Accounts"), {ssr:false})
const SidebarLayout = dynamic(()=>import("@/components/Layout"), {ssr:false})

 function Accounts() {
 
  return (
    <SidebarLayout>
     <AccountComp />
    </SidebarLayout>
  );
}

export default ProtectedRoute(Accounts);
