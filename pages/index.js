import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useContext } from "react";
import AuthContext from "../context/AuthContext";
import { Button, Avatar } from "antd";
import { useRouter } from "next/router";
import {
  PiGaugeDuotone,
  PiBankDuotone,
  PiArrowsLeftRightDuotone,
  PiChartPieSliceDuotone,
  PiHandshakeDuotone,
  PiPiggyBankDuotone,
  PiListDashesDuotone,
  PiSquaresFourDuotone,
  PiFileArrowUpDuotone,
  PiTrophyDuotone,
} from "react-icons/pi";
import { CgSmartphoneChip } from "react-icons/cg";
import { HiCheckCircle } from "react-icons/hi";
import ROUTES from "@/lib/routes";
import Head from "next/head";
import { useTheme } from "@/context/ThemeContext";
import ParallaxBackground from "@/components/landing/ParallaxBackground";
import TiltCard from "@/components/landing/TiltCard";

export default function Home() {
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const { isDarkMode } = useTheme();
  const router = useRouter();

  const containerBg = isDarkMode ? "bg-[#141414]" : "bg-white";
  const textColor = isDarkMode ? "text-gray-100" : "text-gray-800";
  const navBg = isDarkMode ? "bg-[#141414]/80" : "bg-white/90";
  const cardBg = isDarkMode ? "bg-gray-800/50 backdrop-blur-md border border-gray-700 hover:bg-gray-700/60" : "bg-white/70 backdrop-blur-md border border-gray-100 hover:bg-[#e0f7f5]";

  return (
    <>
      <Head>
        <title>PigB - Manage Income, Expenses, Budgets & Savings</title>
        <meta
          name="description"
          content="PigB helps you manage your finances with ease — track income, expenses, budgets, loans, and savings all in one place."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#00b894" />
      </Head>

      <div className={`${containerBg} ${textColor} transition-colors duration-300 min-h-screen relative`}>
        {/* 🌐 Navbar */}
        <nav className={`fixed top-0 left-0 right-0 ${navBg} backdrop-blur-md shadow-sm z-50 transition-colors duration-300`}>
          <div className="max-w-7xl mx-auto flex justify-between items-center py-3 px-6 md:px-10">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Image src="/pigb-logo.svg" alt="PigB Logo" width={36} height={36} />
              <span className="font-bold text-xl text-[#00b894]">PigB</span>
            </Link>

            {/* Navigation Links */}
            <div className={`hidden md:flex items-center gap-8 ${isDarkMode ? "text-gray-300" : "text-gray-700"} font-medium`}>
              <a href="#features" className="hover:text-[#00b894] transition-colors">
                Features
              </a>
              <a href="#pricing" className="hover:text-[#00b894] transition-colors">
                Pricing
              </a>
              <a href="#cta" className="hover:text-[#00b894] transition-colors">
                Get Started
              </a>
            </div>

            {/* Right Actions */}
            {user ? (
              <div className="flex items-center gap-4">
                <Avatar src={user.profilePicture} size="default">
                  {user.name?.charAt(0).toUpperCase()}
                </Avatar>
                <span className={`hidden sm:inline font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                  {user.name}
                </span>
                <Button onClick={logout} danger type="primary" size="small">
                  Logout
                </Button>
              </div>
            ) : isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                <div className="w-20 h-4 bg-gray-200 animate-pulse rounded hidden sm:inline" />
                <Button loading disabled type="primary" size="small">
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Button
                  size="small"
                  className="!bg-transparent border border-[#00b894] !text-[#00b894] hover:!bg-[#00b894] hover:!text-white"
                  onClick={() => router.push(ROUTES.LOGIN)}
                >
                  Login
                </Button>
                <Button
                  type="primary"
                  size="small"
                  className="!bg-[#00b894] hover:!bg-[#00cec9] text-white"
                  onClick={() => router.push(ROUTES.SIGNUP)}
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </nav>

        {/* Push content below navbar */}
        <div className="pt-20" />

        {/* 🌈 Hero Section */}
        <section className="relative py-24 px-6 md:px-16 overflow-hidden">
          <ParallaxBackground />
          <div className="flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto gap-10 md:gap-16 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center md:text-left md:flex-1"
            >
              <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight">
                Master Your Money with <span className="bg-gradient-to-r from-[#00b894] to-[#00cec9] bg-clip-text text-transparent">PigB</span>
              </h1>
              <p className={`text-lg md:text-2xl max-w-xl mx-auto md:mx-0 mb-10 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                The modern way to track income, expenses, budgets, and savings. All in one beautiful, private dashboard.
              </p>
              {user || isAuthenticated ? (
                <Button
                  type="primary"
                  size="large"
                  onClick={() => router.push(ROUTES.DASHBOARD)}
                  loading={!user && isAuthenticated}
                  className="!h-14 !px-8 !text-lg !bg-[#00b894] hover:!bg-[#00cec9] font-semibold rounded-xl shadow-lg shadow-[#00b894]/20 transition-all duration-300 hover:-translate-y-1"
                >
                  View Dashboard
                </Button>
              ) : (
                <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4">
                  <Button
                    type="primary"
                    size="large"
                    onClick={() => router.push(ROUTES.SIGNUP)}
                    className="!h-14 !px-8 !text-lg !bg-[#00b894] hover:!bg-[#00cec9] font-semibold rounded-xl shadow-lg shadow-[#00b894]/20 transition-all duration-300 hover:-translate-y-1"
                  >
                    Get Started Free
                  </Button>
                  <Button
                    size="large"
                    onClick={() => router.push(ROUTES.LOGIN)}
                    className="!h-14 !px-8 !text-lg !bg-transparent border-2 border-[#00b894] !text-[#00b894] font-semibold rounded-xl transition-all duration-300 hover:bg-[#00b894]/5"
                  >
                    Login
                  </Button>
                </div>
              )}

            </motion.div>

            <motion.div
              className="md:flex-1 flex justify-center md:justify-end"
              initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            >
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-[#00b894] to-[#00cec9] rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                <Image
                  src="/wallet_diag.svg"
                  alt="Finance Illustration"
                  width={500}
                  height={400}
                  priority
                  className="object-contain drop-shadow-2xl relative z-10 transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* 🤖 AI Financial Reports */}
        <section className={`py-24 px-6 ${isDarkMode ? "bg-gray-900/50" : "bg-gradient-to-br from-[#e0f7f5] to-white"} relative overflow-hidden`}>
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-14 relative z-10">
            <motion.div
              className="md:flex-1"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-2xl bg-[#00b894]/10">
                  <CgSmartphoneChip className="text-[#00b894] w-10 h-10" />
                </div>
                <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-[#00b894] to-[#00cec9] bg-clip-text text-transparent">
                  AI Financial Reports
                </h2>
              </div>

              <p className={`text-lg md:text-xl mb-8 leading-relaxed ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                Let PigB analyze your transactions and generate intelligent monthly
                insights — spending patterns, savings health, anomalies, and smart
                recommendations.
              </p>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                {[
                  "Monthly Financial Insights",
                  "Smart Recommendations",
                  "AI Summary Reports",
                  "Real-time Data Sync",
                  "PDF Downloads",
                  "Revision History",
                ].map((text, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#00b894]/20 flex items-center justify-center">
                      <HiCheckCircle className="text-[#00b894] w-4 h-4" />
                    </div>
                    <span className={`font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{text}</span>
                  </li>
                ))}
              </ul>

              <Button
                type="primary"
                size="large"
                onClick={() => router.push(user ? "/ai-reports" : ROUTES.SIGNUP)}
                className="!h-14 !px-8 !bg-[#00b894] hover:!bg-[#00cec9] font-bold rounded-xl shadow-lg shadow-[#00b894]/20"
              >
                {user ? "View AI Report" : "Try AI Reports Now"}
              </Button>
            </motion.div>

            <motion.div
              className="md:flex-1 flex justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="relative p-4 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl">
                <Image
                  src="/ai-report.svg"
                  alt="AI Financial Insights"
                  width={450}
                  height={350}
                  className="object-contain drop-shadow-xl rounded-2xl"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* 💡 Features Section */}
        <section id="features" className="py-24 px-6 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <motion.h2
                className="text-4xl md:text-5xl font-bold mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                Core Features
              </motion.h2>
              <div className="w-20 h-1.5 bg-gradient-to-r from-[#00b894] to-[#00cec9] mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[
                { title: "Dashboard", link: "/dashboard", desc: "Real-time insights on your financial health.", icon: <PiGaugeDuotone className="w-10 h-10" /> },
                { title: "Accounts", link: "/accounts", desc: "Track balances across all your accounts.", icon: <PiBankDuotone className="w-10 h-10" /> },
                { title: "Income & Expense", link: "/income-expense", desc: "Log income and expenses seamlessly.", icon: <PiArrowsLeftRightDuotone className="w-10 h-10" /> },
                { title: "Budget", link: "/budget", desc: "Set limits and track category utilization.", icon: <PiChartPieSliceDuotone className="w-10 h-10" /> },
                { title: "Loans", link: "/loans", desc: "Monitor loans and EMI schedules.", icon: <PiHandshakeDuotone className="w-10 h-10" /> },
                { title: "Savings", link: "/savings", desc: "Set and track your savings pocket.", icon: <PiPiggyBankDuotone className="w-10 h-10" /> },
                { title: "Goals", link: "/goals", desc: "Reach your financial targets faster.", icon: <PiTrophyDuotone className="w-10 h-10" /> },
                { title: "Categories", link: "/category", desc: "Customize income and expense categories.", icon: <PiSquaresFourDuotone className="w-10 h-10" /> },
                { title: "Shopping Lists", link: "/shopping", desc: "Plan and link your shopping with expenses.", icon: <PiListDashesDuotone className="w-10 h-10" /> },
                { title: "Import", link: "/import-statements", desc: "Auto-convert bank PDFs to data.", icon: <PiFileArrowUpDuotone className="w-10 h-10" /> },
              ].map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <Link href={f.link}>
                    <TiltCard className="h-full">
                      <div className={`${cardBg} p-8 rounded-2xl h-full flex flex-col items-start transition-all duration-300 group cursor-pointer shadow-xl shadow-black/5`}>
                        <div className="p-3 rounded-xl bg-[#00b894]/10 text-[#00b894] mb-6 group-hover:bg-[#00b894] group-hover:text-white transition-colors duration-300">
                          {f.icon}
                        </div>
                        <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                        <p className={`${isDarkMode ? "text-gray-400" : "text-gray-500"} text-sm leading-relaxed`}>{f.desc}</p>
                      </div>
                    </TiltCard>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 💸 Pricing Section */}
        <section id="pricing" className={`py-24 px-6 ${isDarkMode ? "bg-gray-900/30" : "bg-gray-50/50"}`}>
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative p-12 rounded-3xl overflow-hidden shadow-2xl bg-white dark:bg-gray-800 border border-[#00b894]/20"
            >
              <div className="absolute top-0 right-0 p-8 transform translate-x-1/4 -translate-y-1/4 opacity-10">
                <PiPiggyBankDuotone className="w-48 h-48 text-[#00b894]" />
              </div>

              <h2 className="text-4xl font-bold mb-4">Simple Pricing</h2>
              <p className={`text-xl mb-10 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                PigB is <span className="text-[#00b894] font-extrabold italic">completely free</span>. Forever.
              </p>

              <div className="flex flex-col items-center">
                <div className="text-7xl font-extrabold text-[#00b894] mb-4 flex items-start">
                  <span className="text-3xl mt-2 mr-1">₹</span>0
                </div>
                <p className="text-gray-400 font-medium tracking-widest uppercase mb-10">Free Plan</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-10 text-left mb-10">
                  {["Unlimited Transactions", "All Core Features", "Secure Data Storage", "Zero Advertisements"].map((item, id) => (
                    <div key={id} className="flex items-center gap-2">
                      <HiCheckCircle className="text-[#00b894] w-5 h-5 flex-shrink-0" />
                      <span className={isDarkMode ? "text-gray-300" : "text-gray-700"}>{item}</span>
                    </div>
                  ))}
                </div>

                <Button
                  type="primary"
                  size="large"
                  onClick={() => router.push(ROUTES.SIGNUP)}
                  className="!h-14 !px-12 !text-lg !bg-[#00b894] hover:!bg-[#00cec9] font-bold rounded-xl shadow-lg shadow-[#00b894]/20 w-full sm:w-auto"
                >
                  Join Today
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 🚀 CTA Section */}
        <section id="cta" className="py-24 px-6 text-center overflow-hidden">
          <div className="max-w-5xl mx-auto relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[500px] bg-gradient-to-r from-[#00b894] to-[#00cec9] opacity-10 blur-3xl -z-10 rounded-full"></div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">
                Start Your Financial Journey <br /> <span className="text-[#00b894]">Today</span>
              </h2>
              <p className={`text-xl md:text-2xl mb-12 max-w-2xl mx-auto ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                Experience the most powerful and beautiful finance tracker. Join thousands of users who have mastered their money.
              </p>
              <Link href="/signup">
                <Button
                  size="large"
                  className="!h-16 !px-12 !text-xl !bg-[#00b894] hover:!bg-[#00cec9] !text-white !border-none font-bold rounded-2xl shadow-2xl shadow-[#00b894]/30"
                >
                  Create Free Account
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ⚓ Footer */}
        <footer className={`py-12 px-6 text-center border-t ${isDarkMode ? "bg-[#0a0a0a] border-gray-800" : "bg-gray-50 border-gray-100"}`}>
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col items-center gap-6">
              <Link href="/" className="flex items-center gap-2">
                <Image src="/pigb-logo.svg" alt="PigB Logo" width={32} height={32} />
                <span className="font-bold text-lg text-[#00b894]">PigB</span>
              </Link>
              <div className="flex gap-8 text-sm font-medium">
                <a href="#" className="hover:text-[#00b894] transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-[#00b894] transition-colors">Terms of Service</a>
                <a href="mailto:support@pigb.com" className="hover:text-[#00b894] transition-colors">Support</a>
              </div>
              <p className={`text-sm ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                &copy; {new Date().getFullYear()} PigB. Simple, Secure & Free. Built for privacy.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
