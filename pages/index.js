import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useContext } from "react";
import AuthContext from "../context/AuthContext";
import { Button } from "antd";
import { useRouter } from "next/router";

import {
  PiGaugeDuotone,
  PiBankDuotone,
  PiReceiptDuotone,
  PiArrowsLeftRightDuotone,
  PiChartPieSliceDuotone,
  PiHandshakeDuotone,
  PiPiggyBankDuotone,
  PiListDashesDuotone,
  PiSquaresFourDuotone,
} from "react-icons/pi";

export default function Home() {
  const { user, logout } = useContext(AuthContext);
  const router = useRouter();
  return (
    <div className="bg-white text-gray-800">
      {user && (
        <div className="h-16 px-4 flex justify-end items-center bg-white border-b shadow-sm">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="font-medium text-gray-700">{user.name}</span>
              <Button onClick={logout} type="primary" danger>
                Logout
              </Button>
            </div>
          ) : (
            <div />
          )}
        </div>
      )}
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white py-24 px-6 text-center relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-bold mb-4">Welcome to Expensify</h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8">
            Manage your finances with ease — track income, expenses, budgets,
            loans, and more.
          </p>
          <div className="space-x-4">
            {user ? (
              <Button
                type="primary"
                size="large"
                onClick={() => router.push("/dashboard")}
              >
                View Dashboard
              </Button>
            ) : (
              <div className="flex justify-center gap-4">
                <Button type="primary" onClick={() => router.push("/signup")}>
                  Get Started
                </Button>
                <Button onClick={() => router.push("/login")}>Login</Button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Illustration */}
        <motion.div
          className="absolute bottom-0 right-4 w-64 md:w-96 opacity-80"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Image
            src="/undraw_finance_re_gnv2.svg"
            alt="Finance Illustration"
            width={400}
            height={300}
            priority
          />
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white">
        <motion.h2
          className="text-3xl font-bold text-center mb-12"
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
              icon: (
                <PiGaugeDuotone className="text-indigo-600 w-12 h-12 mb-4" />
              ),
            },
            {
              title: "Accounts",
              link: "/accounts",
              desc: "Track balances across all your bank, wallet, and cash accounts in one place.",
              icon: (
                <PiBankDuotone className="text-indigo-600 w-12 h-12 mb-4" />
              ),
            },
            {
              title: "Bills",
              link: "/bills",
              desc: "Keep tabs on upcoming bill due dates, payment history, and reminders.",
              icon: (
                <PiReceiptDuotone className="text-indigo-600 w-12 h-12 mb-4" />
              ),
            },
            {
              title: "Income & Expense",
              link: "/income-expense",
              desc: "Log income and spending transactions, view trends, and stay informed.",
              icon: (
                <PiArrowsLeftRightDuotone className="text-indigo-600 w-12 h-12 mb-4" />
              ),
            },
            {
              title: "Budget",
              link: "/budget",
              desc: "Set monthly budgets for spending categories and track utilization.",
              icon: (
                <PiChartPieSliceDuotone className="text-indigo-600 w-12 h-12 mb-4" />
              ),
            },
            {
              title: "Loans",
              link: "/loans",
              desc: "Monitor given and taken loans with automated EMI calculation and repayments.",
              icon: (
                <PiHandshakeDuotone className="text-indigo-600 w-12 h-12 mb-4" />
              ),
            },
            {
              title: "Manage Savings",
              link: "/savings",
              desc: "Organize savings by goals or accounts and track deposits and withdrawals.",
              icon: (
                <PiPiggyBankDuotone className="text-indigo-600 w-12 h-12 mb-4" />
              ),
            },
            {
              title: "Categories",
              link: "/category",
              desc: "Create and customize income & expense categories with icons.",
              icon: (
                <PiSquaresFourDuotone className="text-indigo-600 w-12 h-12 mb-4" />
              ),
            },
            {
              title: "Shopping Lists",
              link: "/shopping",
              desc: "Plan purchases, mark items, and link them with expenses.",
              icon: (
                <PiListDashesDuotone className="text-indigo-600 w-12 h-12 mb-4" />
              ),
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
                <div className="bg-gray-100 p-6 rounded-xl shadow hover:shadow-md hover:bg-indigo-50 transition cursor-pointer h-full flex flex-col items-center text-center">
                  {feature.icon}
                  <h3 className="text-xl font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{feature.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        className="bg-indigo-700 py-16 text-white text-center px-6"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl font-bold mb-4">
          Ready to take control of your finances?
        </h2>
        <p className="mb-6 text-lg">
          Join thousands of users using Expensify to manage their money smarter.
        </p>
        <Link href="/signup">
          <button className="bg-white text-indigo-700 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100">
            Get Started Now
          </button>
        </Link>
      </motion.section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 px-6 text-center">
        <p className="mb-2">
          &copy; {new Date().getFullYear()} Expensify. All rights reserved.
        </p>
        <div className="space-x-4">
          <Link href="#">
            <span className="hover:underline">Privacy</span>
          </Link>
          <Link href="#">
            <span className="hover:underline">Terms</span>
          </Link>
          <Link href="#">
            <span className="hover:underline">Support</span>
          </Link>
        </div>
      </footer>
    </div>
  );
}
