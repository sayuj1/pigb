import ProtectedRoute from "@/context/ProtectRoute";
import dynamic from "next/dynamic";
import Head from "next/head";

const SidebarLayout = dynamic(() => import("@/components/Layout"), {
    ssr: false,
});
const GoalsComp = dynamic(() => import("@/components/goals/Goals"), {
    ssr: false,
});

function GoalsPage() {
    return (
        <>
            <Head>
                <title>Manage Goals | Pigb</title>
                <meta name="description" content="Set and track your financial goals with Pigb." />
            </Head>
            <SidebarLayout>
                <GoalsComp />
            </SidebarLayout>
        </>
    );
}

export default ProtectedRoute(GoalsPage);
