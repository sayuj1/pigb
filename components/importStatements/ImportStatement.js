import React, { useState, useEffect, useRef } from 'react';
import UploadPDF from '@/components/importStatements/UploadPDF';
import TransactionReviewTable from '@/components/importStatements/TransactionReviewTable';
import { Button, message, Popover, Steps, Card, theme, Result } from 'antd';
import { addAccountIdToTransactions, attachCategoryIconsToTransactions, replaceDateWithBillDate } from '@/utils/dataFormatter';
import { formatTransactionsToUTC } from '@/utils/dateFormatter';
import { useAccount } from '@/context/AccountContext';
import { CloudUploadOutlined, FileSearchOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { PiBankDuotone } from "react-icons/pi";

export default function ImportStatement() {
    const uploadRef = useRef();
    const [messageApi, contextHolder] = message.useMessage();
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(null); // Changed default to null
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const { accounts, fetchAccounts } = useAccount();
    const [currentStep, setCurrentStep] = useState(0);

    const { token } = theme.useToken();

    const hasErrors = Object.values(errors).some(rowErrors => Object.keys(rowErrors).length > 0);
    const noAccountSelected = !selectedAccount; // Updated check since initialized as null

    const getPopoverMessage = () => {
        if (noAccountSelected) return "Please select an account first";
        if (hasErrors) return "Please fix validation errors in the table";
        return null;
    };

    const isDisabled = hasErrors || noAccountSelected;

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/categories/category");
            const data = await res.json();
            setCategories(data.categories);
        } catch (error) {
            messageApi.error("Failed to load categories");
        }
    };

    useEffect(() => {
        fetchAccounts();
        fetchCategories();
    }, []);

    const handleUploadSuccess = (data) => {
        setTransactions(data);
        setCurrentStep(1); // Move to review step
    };

    const saveTransactions = async () => {
        try {
            setLoading(true);
            const updatedTransactions = await attachCategoryIconsToTransactions(categories, transactions);
            const formattedTransactions = await formatTransactionsToUTC(updatedTransactions, "123");
            const payload = await addAccountIdToTransactions(formattedTransactions, selectedAccount); // Ensure selectedAccount is ID
            const finalPayload = await replaceDateWithBillDate(payload);

            const res = await fetch("/api/transactions/bulk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ transactions: finalPayload }),
            });

            if (!res.ok) throw new Error("Failed to import transactions");
            const response = await res.json();

            messageApi.success(response.message || "Transactions Imported!");

            setTransactions([]);
            uploadRef.current?.removeFile();
            setCurrentStep(2); // Move to success step
        } catch (err) {
            messageApi.error(err.message || 'Failed to save transactions');
        } finally {
            setLoading(false);
        }
    };

    const deleteTransactions = (showMessage) => {
        setTransactions([]);
        setCurrentStep(0); // Go back to start
        if (showMessage) message.success("File removed");
    };

    const resetFlow = () => {
        setTransactions([]);
        setCurrentStep(0);
        setSelectedAccount(null);
        uploadRef.current?.removeFile();
    };

    const steps = [
        {
            title: 'Upload Statement',
            icon: <CloudUploadOutlined />,
            description: "Select bank & upload PDF"
        },
        {
            title: 'Review Transactions',
            icon: <FileSearchOutlined />,
            description: "Verify & categorize"
        },
        {
            title: 'Finished',
            icon: <CheckCircleOutlined />,
            description: "Import complete"
        },
    ];

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            {contextHolder}

            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                    <PiBankDuotone className="text-3xl" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Import Statement</h1>
                    <p className="text-gray-500">Upload your bank statement PDF to automatically extract and categorized transactions.</p>
                </div>
            </div>

            <Card className="shadow-sm rounded-2xl border-gray-100 overflow-hidden">
                <div className="bg-gray-50/50 p-6 border-b border-gray-100">
                    <Steps current={currentStep} items={steps} />
                </div>

                <div className="p-8 min-h-[400px]">
                    {currentStep === 0 && (
                        <div className="max-w-2xl mx-auto">
                            <UploadPDF
                                ref={uploadRef}
                                onSuccess={handleUploadSuccess}
                                onRemoveTransactions={deleteTransactions}
                                accounts={accounts}
                                selectedAccount={selectedAccount}
                                setSelectedAccount={setSelectedAccount}
                            />
                        </div>
                    )}

                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <div>
                                    <h3 className="font-semibold text-blue-900">Review Transactions</h3>
                                    <p className="text-blue-600 text-sm">Please review categories and dates before importing.</p>
                                </div>
                                <div className="flex gap-3">
                                    <Button onClick={() => deleteTransactions(true)} danger>Cancel Import</Button>
                                    <Popover content={getPopoverMessage()}>
                                        <Button
                                            type="primary"
                                            onClick={saveTransactions}
                                            disabled={isDisabled}
                                            loading={loading}
                                            size="large"
                                            className="px-8"
                                        >
                                            Import {transactions.length} Transactions
                                        </Button>
                                    </Popover>
                                </div>
                            </div>

                            <TransactionReviewTable
                                data={transactions}
                                onChange={setTransactions}
                                categories={categories}
                                errors={errors}
                                setErrors={setErrors}
                                loading={loading}
                            />
                        </div>
                    )}

                    {currentStep === 2 && (
                        <Result
                            status="success"
                            title="Import Successful!"
                            subTitle="All transactions have been successfully added to your account."
                            extra={[
                                <Button type="primary" key="console" onClick={resetFlow} size="large">
                                    Import Another Statement
                                </Button>,
                                <Button key="buy" onClick={() => window.location.href = '/income-expense'}>
                                    View Transactions
                                </Button>,
                            ]}
                        />
                    )}
                </div>
            </Card>
        </div>
    );
}
