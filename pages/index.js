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
} from "react-icons/pi";
import ROUTES from "@/lib/routes";
import Head from "next/head";

export default function Home() {
  const { user, logout } = useContext(AuthContext);
  const router = useRouter();

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

      <div className="bg-white text-gray-800">
        {/* 🌐 Navbar */}
        <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md shadow-sm z-50">
          <div className="max-w-7xl mx-auto flex justify-between items-center py-3 px-6 md:px-10">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Image src="/pigb-logo.svg" alt="PigB Logo" width={36} height={36} />
              <span className="font-bold text-xl text-[#00b894]">PigB</span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8 text-gray-700 font-medium">
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
                <span className="hidden sm:inline font-medium text-gray-700">
                  {user.name}
                </span>
                <Button onClick={logout} danger type="primary" size="small">
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
        <section className="bg-gradient-to-br from-[#00b894] to-[#00cec9] text-white py-24 px-6 md:px-16 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto gap-10 md:gap-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center md:text-left md:flex-1 relative z-10"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
                Welcome to <span className="text-white/90">PigB</span>
              </h1>
              <p className="text-base md:text-xl max-w-xl mx-auto md:mx-0 mb-8 text-white/90">
                Manage your finances with ease — track income, expenses, budgets,
                loans, and more in one beautiful dashboard.
              </p>
              {user ? (
                <Button
                  type="primary"
                  size="large"
                  onClick={() => router.push(ROUTES.DASHBOARD)}
                  className="!bg-white !text-[#00b894] hover:!bg-[#00cec9] hover:!text-white font-medium shadow-md"
                >
                  View Dashboard
                </Button>
              ) : (
                <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4">
                  <Button
                    type="primary"
                    size="large"
                    onClick={() => router.push(ROUTES.SIGNUP)}
                    className="!bg-white !text-[#00b894] hover:!bg-[#00cec9] hover:!text-white font-medium shadow-md"
                  >
                    Get Started
                  </Button>
                  <Button
                    size="large"
                    onClick={() => router.push(ROUTES.LOGIN)}
                    className="!bg-transparent border border-white !text-white hover:!bg-white hover:!text-[#00b894] font-medium"
                  >
                    Login
                  </Button>
                </div>
              )}
            </motion.div>

            <motion.div
              className="md:flex-1 flex justify-center md:justify-end"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Image
                src="/wallet_diag.svg"
                alt="Finance Illustration"
                width={420}
                height={320}
                priority
                className="object-contain drop-shadow-lg"
              />
            </motion.div>
          </div>
        </section>

        {/* 💡 Features Section */}
        <section id="features" className="py-20 px-6 bg-white">
          <motion.h2
            className="text-3xl font-bold text-center mb-12 text-gray-800"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            Core Features
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
            {[
              {
                title: "Dashboard",
                link: "/dashboard",
                desc: "Get a bird’s-eye view of your finances with real-time insights.",
                icon: <PiGaugeDuotone className="text-[#00b894] w-12 h-12 mb-4" />,
              },
              {
                title: "Accounts",
                link: "/accounts",
                desc: "Track balances across all your bank, wallet, and cash accounts.",
                icon: <PiBankDuotone className="text-[#00b894] w-12 h-12 mb-4" />,
              },
              {
                title: "Income & Expense",
                link: "/income-expense",
                desc: "Log income and expenses, view trends, and stay informed.",
                icon: <PiArrowsLeftRightDuotone className="text-[#00b894] w-12 h-12 mb-4" />,
              },
              {
                title: "Budget",
                link: "/budget",
                desc: "Set monthly budgets for categories and track utilization.",
                icon: <PiChartPieSliceDuotone className="text-[#00b894] w-12 h-12 mb-4" />,
              },
              {
                title: "Loans",
                link: "/loans",
                desc: "Monitor loans with automated EMI calculations.",
                icon: <PiHandshakeDuotone className="text-[#00b894] w-12 h-12 mb-4" />,
              },
              {
                title: "Savings",
                link: "/savings",
                desc: "Organize and track your savings goals.",
                icon: <PiPiggyBankDuotone className="text-[#00b894] w-12 h-12 mb-4" />,
              },
              {
                title: "Categories",
                link: "/category",
                desc: "Customize income and expense categories.",
                icon: <PiSquaresFourDuotone className="text-[#00b894] w-12 h-12 mb-4" />,
              },
              {
                title: "Shopping Lists",
                link: "/shopping",
                desc: "Plan and link your shopping with expenses.",
                icon: <PiListDashesDuotone className="text-[#00b894] w-12 h-12 mb-4" />,
              },
              {
                title: "Import Statements",
                link: "/import-statements",
                desc: "Upload bank PDFs to auto-convert into transactions.",
                icon: <PiFileArrowUpDuotone className="text-[#00b894] w-12 h-12 mb-4" />,
              },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Link href={f.link}>
                  <div className="bg-gray-100 p-6 rounded-xl shadow hover:shadow-lg hover:bg-[#e0f7f5] transition-transform duration-200 hover:scale-105 cursor-pointer h-full flex flex-col items-center text-center">
                    {f.icon}
                    <h3 className="text-xl font-semibold mb-2 text-gray-800">
                      {f.title}
                    </h3>
                    <p className="text-gray-600 text-sm">{f.desc}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 💸 Pricing Section */}
        <section id="pricing" className="py-20 px-6 bg-gray-50">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Simple Pricing</h2>
            <p className="text-gray-600 text-lg mb-10">
              PigB is <span className="text-[#00b894] font-semibold">completely free</span> —
              no subscriptions, no ads, and no hidden fees.
            </p>

            <div className="bg-white shadow-lg rounded-2xl p-10 inline-block">
              <h3 className="text-5xl font-bold text-[#00b894] mb-2">₹0</h3>
              <p className="text-gray-500 mb-6">Forever Free</p>
              <ul className="text-gray-700 text-left list-disc list-inside mb-8 space-y-2">
                <li>Unlimited transactions</li>
                <li>Full access to all features</li>
                <li>Secure data storage</li>
                <li>No premium tiers</li>
              </ul>
              <Button
                type="primary"
                size="large"
                onClick={() => router.push(ROUTES.SIGNUP)}
                className="!bg-[#00b894] hover:!bg-[#00cec9] text-white font-medium shadow-md"
              >
                Start for Free
              </Button>
            </div>
          </motion.div>
        </section>

        {/* 🚀 CTA Section */}
        <motion.section
          id="cta"
          className="bg-gradient-to-r from-[#00b894] to-[#00cec9] py-16 text-white text-center px-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-4">
            Ready to take control of your finances?
          </h2>
          <p className="mb-6 text-lg">
            Join thousands of users using PigB to manage their money smarter.
          </p>
          <Link href="/signup">
            <Button size="large" className="!bg-white !text-[#00b894] hover:!bg-[#00cec9] hover:!text-white">
              Get Started Now
            </Button>
          </Link>
        </motion.section>

        {/* ⚓ Footer */}
        <footer className="bg-gray-900 text-gray-300 py-8 px-6 text-center">
          <p className="mb-2 text-sm">
            PigB — Simple, Secure & Free Finance Tracker.
          </p>
          <p className="text-xs">
            &copy; {new Date().getFullYear()} PigB. All rights reserved.
          </p>
        </footer>
      </div>
    </>
  );
}
