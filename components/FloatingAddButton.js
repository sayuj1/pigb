import React, { useState } from 'react'
import { PlusOutlined } from "@ant-design/icons";
import { FloatButton } from "antd";
import { useDashboard } from "@/context/DashboardContext";
import { useTransactions } from "@/context/TransactionContext";
import { useRouter } from "next/router";
import AddTransactionModal from './transactions/AddTransactionModal';


export default function FloatingAddButton() {
    const router = useRouter();
    const dashboard = useDashboard();
    const transactions = useTransactions();
    const [modalVisible, setModalVisible] = useState(false);

    const handleAddTransaction = async () => {
        if (router.pathname === "/dashboard") {
            await dashboard?.fetchAllDashboardData();
        } else if (router.pathname === "/income-expense") {
            await Promise.all([
                transactions?.fetchTransactions(),
                transactions?.fetchInsights(),
            ]);
        }
    };

    return (
        <>
            <FloatButton
                icon={<PlusOutlined />}
                type="primary"
                onClick={() => setModalVisible(true)}
                tooltip="Add Transaction"
                style={{
                    background: "linear-gradient(135deg, #00b894, #00cec9)",
                    color: "#fff",
                    boxShadow: "0 4px 12px rgba(0, 200, 180, 0.4)",
                }}
            />
            {/* Add Transaction Modal */}
            <AddTransactionModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onAddTransaction={handleAddTransaction}
            />
        </>

    );
}
