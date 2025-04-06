import ProtectedRoute from "@/context/ProtectRoute";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "antd";
import dynamic from "next/dynamic";
const SidebarLayout = dynamic(() => import("@/components/Layout"), { ssr: false })

function Home() {
  const { isDarkMode, toggleTheme } = useTheme();
  return (
    <SidebarLayout>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Welcome to your finance management dashboard.</p>
      <Button onClick={toggleTheme}>
        Switch to {isDarkMode ? "Light" : "Dark"} Mode
      </Button>
    </SidebarLayout>
  );
}

export default ProtectedRoute(Home);
