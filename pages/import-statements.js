
import ProtectedRoute from "@/context/ProtectRoute";
import dynamic from "next/dynamic";
const SidebarLayout = dynamic(() => import("@/components/Layout"), {
    ssr: false,
});
const ImportStatementComp = dynamic(
    () => import("@/components/importStatements/ImportStatement"),
    {
        ssr: false,
    }
);

function Category() {
    return (
        <SidebarLayout>
            <ImportStatementComp />
        </SidebarLayout>
    );
}

export default ProtectedRoute(Category);
