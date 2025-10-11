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
        {user && (
          <div className="h-16 px-4 flex justify-end items-center bg-white border-b shadow-sm">
            <div className="flex items-center gap-4">
              <Avatar src={user.profilePicture} size="default">
                {user.name?.charAt(0).toUpperCase()}
              </Avatar>
              <span className="font-medium text-gray-700">{user.name}</span>
              <Button
                onClick={logout}
                type="primary"
                danger
              >
                Logout
              </Button>
            </div>
          </div>
        )}

        {/* 🌈 Hero Section */}
        <section className="bg-gradient-to-br from-[#00b894] to-[#00cec9] text-white py-24 px-6 md:px-16 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto gap-10 md:gap-16">
            {/* 🌟 Left: Text Section */}
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

              {/* Buttons */}
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

            {/* 💼 Right: Hero Illustration */}
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
        <section className="py-20 px-6 bg-white">
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
                desc: "Get a bird’s-eye view of your finances with real-time insights into balances, bills, and budgets.",
                icon: <PiGaugeDuotone className="text-[#00b894] w-12 h-12 mb-4" />,
              },
              {
                title: "Accounts",
                link: "/accounts",
                desc: "Track balances across all your bank, wallet, and cash accounts in one place.",
                icon: <PiBankDuotone className="text-[#00b894] w-12 h-12 mb-4" />,
              },
              {
                title: "Income & Expense",
                link: "/income-expense",
                desc: "Log income and spending transactions, view trends, and stay informed.",
                icon: (
                  <PiArrowsLeftRightDuotone className="text-[#00b894] w-12 h-12 mb-4" />
                ),
              },
              {
                title: "Budget",
                link: "/budget",
                desc: "Set monthly budgets for spending categories and track utilization.",
                icon: <PiChartPieSliceDuotone className="text-[#00b894] w-12 h-12 mb-4" />,
              },
              {
                title: "Loans",
                link: "/loans",
                desc: "Monitor given and taken loans with automated EMI calculation and repayments.",
                icon: <PiHandshakeDuotone className="text-[#00b894] w-12 h-12 mb-4" />,
              },
              {
                title: "Manage Savings",
                link: "/savings",
                desc: "Organize savings by goals or accounts and track deposits and withdrawals.",
                icon: <PiPiggyBankDuotone className="text-[#00b894] w-12 h-12 mb-4" />,
              },
              {
                title: "Categories",
                link: "/category",
                desc: "Create and customize income & expense categories with icons.",
                icon: <PiSquaresFourDuotone className="text-[#00b894] w-12 h-12 mb-4" />,
              },
              {
                title: "Shopping Lists",
                link: "/shopping",
                desc: "Plan purchases, mark items, and link them with expenses.",
                icon: <PiListDashesDuotone className="text-[#00b894] w-12 h-12 mb-4" />,
              },
              {
                title: "Import Bank Statement",
                link: "/import-statements",
                desc: "Upload your bank PDF statements and convert them into categorized transactions in seconds.",
                icon: <PiFileArrowUpDuotone className="text-[#00b894] w-12 h-12 mb-4" />,
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link href={feature.link}>
                  <div className="bg-gray-100 p-6 rounded-xl shadow hover:shadow-lg hover:bg-[#e0f7f5] transition-transform duration-200 hover:scale-105 cursor-pointer h-full flex flex-col items-center text-center">
                    {feature.icon}
                    <h3 className="text-xl font-semibold mb-2 text-gray-800">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm">{feature.desc}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 🚀 CTA Section */}
        <motion.section
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
            <Button size="large">
              Get Started Now
            </Button>
          </Link>
        </motion.section>

        {/* ⚓ Footer */}
        <footer className="bg-gray-900 text-gray-300 py-8 px-6 text-center">
          <p className="mb-2">
            &copy; {new Date().getFullYear()} PigB. All rights reserved.
          </p>
          {/* <div className="space-x-4">
            <Link href="#"><span className="hover:underline">Privacy</span></Link>
            <Link href="#"><span className="hover:underline">Terms</span></Link>
            <Link href="#"><span className="hover:underline">Support</span></Link>
          </div> */}
        </footer>
      </div>
    </>
  );
}
