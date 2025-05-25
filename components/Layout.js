import { useState } from "react";
import { Divider, Layout, Menu, theme } from "antd";
import {
  DashboardOutlined,
  BankOutlined,
  DollarOutlined,
  CreditCardOutlined,
  FileTextOutlined,
  WalletOutlined,
  PieChartOutlined,
  AppstoreOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/router";
import Navbar from "./Navbar";
import { useTheme } from "@/context/ThemeContext";

const { Sider, Content } = Layout;

const menuItems = [
  { key: "", icon: <DashboardOutlined />, label: "Dashboard" },
  { key: "accounts", icon: <BankOutlined />, label: "Accounts" },
  { key: "income-expense", icon: <DollarOutlined />, label: "Income/Expense" },
  { key: "loans", icon: <CreditCardOutlined />, label: "Manage Loans" },
  { key: "bills", icon: <FileTextOutlined />, label: "Manage Bills" },
  { key: "savings", icon: <WalletOutlined />, label: "Manage Savings" },
  { key: "budget", icon: <PieChartOutlined />, label: "Manage Budget" },
  { key: "category", icon: <AppstoreOutlined />, label: "Manage Category" },
  { key: "shopping", icon: <ShoppingCartOutlined />, label: "Shopping Lists" },
];

export default function SidebarLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const { token } = theme.useToken();

  return (
    <Layout className="h-screen">
      {/* Sidebar */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        className="h-screen"
        theme={isDarkMode ? "dark" : "light"}
      >
        <div
          className="text-center my-4 font-bold text-lg"
          style={{
            color: token.colorText,
          }}
        >
          {collapsed ? "🧾" : "Expensify"}
          <Divider />
        </div>
        <Menu
          theme={isDarkMode ? "dark" : "light"}
          mode="inline"
          selectedKeys={[router.pathname.replace("/", "") || ""]}
          onClick={({ key }) => router.push(`/${key}`)}
          items={menuItems}
        />
      </Sider>

      {/* Content Area */}
      <Layout className="flex-1 h-screen">
        <Navbar />
        <Content className="bg-gray-100 h-full">
          <div
            className="p-4 m-1 rounded-md overflow-y-auto"
            style={{
              backgroundColor: token.colorBgContainer,
              maxHeight: "calc(100vh - 64px)", // 64px for Navbar height
            }}
          >
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
