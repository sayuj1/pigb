import React, { useState } from "react";
import { Divider, Layout, Menu, theme } from "antd";
import {
  DashboardOutlined,
  BankOutlined,
  DollarOutlined,
  CreditCardOutlined,
  FileTextOutlined,
  SyncOutlined,
  WalletOutlined,
  PieChartOutlined,
  AppstoreOutlined,
  ShoppingCartOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { CgSmartphoneChip } from "react-icons/cg";

import Navbar from "./Navbar";
import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";
import Image from "next/image";
import BetaTag from "./resuable/BetaTag";
import FloatingAddButton from "./FloatingAddButton";
import { useRouter } from "next/router";



const { Sider, Content } = Layout;

const menuItems = [
  { key: "dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
  {
    key: "ai-reports", icon: <CgSmartphoneChip />, label: (
      <span>
        AI Reports{" "}
        <BetaTag />
      </span>
    )
  },
  { key: "accounts", icon: <BankOutlined />, label: "Accounts" },
  { key: "income-expense", icon: <DollarOutlined />, label: "Income/Expense" },
  // { key: "bills", icon: <SyncOutlined />, label: "Planned Bills" },
  { key: "savings", icon: <WalletOutlined />, label: "Manage Savings" },
  { key: "budget", icon: <PieChartOutlined />, label: "Manage Budget" },
  { key: "category", icon: <AppstoreOutlined />, label: "Manage Category" },
  { key: "shopping", icon: <ShoppingCartOutlined />, label: "Shopping Lists" },
  {
    key: "import-statements",
    icon: <FileTextOutlined />,
    label: (
      <span>
        Import{" "}
        <BetaTag />
      </span>
    )
  },
  { key: "loans", icon: <CreditCardOutlined />, label: "Manage Loans" },
  {
    key: "goals", icon: <TrophyOutlined />, label: (<span>
      Manage Goals
      <BetaTag />
    </span>)
  },
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
          <Link href="/" className="flex ml-6 items-center gap-2">
            {collapsed ? (
              <Image
                src="/pigb-logo.svg"
                alt="PigB Logo"
                width={32}
                height={32}
              />
            ) : (
              <>
                <Image
                  src="/pigb-logo.svg"
                  alt="PigB Logo"
                  width={32}
                  height={32}
                />
                <span className="bg-gradient-to-r from-[#00b894] to-[#00cec9] bg-clip-text text-transparent font-bold text-xl">
                  PigB
                </span>
              </>
            )}
          </Link>

          <Divider />
        </div>

        <Menu
          theme={isDarkMode ? "dark" : "light"}
          mode="inline"
          selectedKeys={[router.pathname.replace("/", "") || ""]}
          onClick={({ key }) => router.push("/" + key)}
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
              height: "calc(100vh - 75px)", // 64px for Navbar height + padding 16px

            }}
          >

            {children}

          </div>
          <FloatingAddButton />


        </Content>
      </Layout>

    </Layout>
  );
}
