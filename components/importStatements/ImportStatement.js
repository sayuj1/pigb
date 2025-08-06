import React, { useState, useEffect, useRef } from 'react'
import UploadPDF from '@/components/importStatements/UploadPDF';
import TransactionReviewTable from '@/components/importStatements/TransactionReviewTable';
import { Button, message, Popover } from 'antd';
import { addAccountIdToTransactions, attachCategoryIconsToTransactions, replaceDateWithBillDate } from '@/utils/dataFormatter';
import { formatTransactionsToUTC } from '@/utils/dateFormatter';

export default function ImportStatement() {
    const uploadRef = useRef();
    const [messageApi, contextHolder] = message.useMessage();
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState([]);
    const [errors, setErrors] = useState({});
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(false);

    const hasErrors = Object.values(errors).some(rowErrors => Object.keys(rowErrors).length > 0);
    const noAccountSelected = selectedAccount.length === 0;

    const getPopoverMessage = () => {
        if (noAccountSelected) return "Please select account";
        if (hasErrors) return "Please fill all the required fields";
        return null;
    };

    const isDisabled = hasErrors || noAccountSelected;

    const fetchAccounts = async () => {
        try {
            const res = await fetch("/api/accounts/account");
            const data = await res.json();
            setAccounts(data.accounts);
        } catch {
            messageApi.open({
                type: 'error',
                content: "Failed to load accounts",
            });
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/categories/category");
            const data = await res.json();
            setCategories(data.categories);
        } catch (error) {
            messageApi.open({
                type: 'error',
                content: "Failed to load categories",
            });

        }
    };

    // Fetch categories only once on mount
    useEffect(() => {
        fetchAccounts();
        fetchCategories();
    }, []);

    const saveTransactions = async () => {
        try {
            setLoading(true);
            const updatedTransactions = await attachCategoryIconsToTransactions(categories, transactions);
            const formattedTransactions = await formatTransactionsToUTC(updatedTransactions, "123");
            const payload = await addAccountIdToTransactions(formattedTransactions, selectedAccount);
            const finalPayload = await replaceDateWithBillDate(payload);

            const res = await fetch("/api/transactions/bulk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ transactions: finalPayload }),
            });

            if (!res.ok) throw new Error("Failed to import transactions");
            const response = await res.json()

            messageApi.open({
                type: 'success',
                content: response.message || "Transactions Imported!",
            });

            setTransactions([]);
            uploadRef.current?.removeFile();
        } catch (err) {
            messageApi.open({
                type: 'error',
                content: err || 'Failed to save transactions',
            });

        } finally {
            setLoading(false); // Stop loader
        }
    };

    const deleteTransactions = (showMessage) => {
        setTransactions([]);
        if (showMessage)
            message.success("File deleted successfully!")
    }

    return (
        <div className="p-6">
            {contextHolder}
            <h2 className="text-xl font-semibold mb-4">Import Bank Statement</h2>
            <UploadPDF ref={uploadRef} onSuccess={setTransactions} onRemoveTransactions={deleteTransactions} accounts={accounts} selectedAccount={selectedAccount} setSelectedAccount={setSelectedAccount} />
            {transactions.length > 0 && (
                <>
                    <TransactionReviewTable data={transactions} onChange={setTransactions} categories={categories} errors={errors} setErrors={setErrors} loading={loading} />
                    <Popover
                        content={getPopoverMessage()}
                        placement="top"
                        trigger="hover"
                    >
                        <span>
                            {/* Wrapping Button in <span> ensures tooltip works even when button is disabled */}
                            <Button
                                type="primary"
                                className="mt-4"
                                onClick={saveTransactions}
                                disabled={isDisabled}
                                loading={loading}
                            >
                                {loading ? "Importing..." : "Import Transactions"}
                            </Button>
                        </span>
                    </Popover>
                </>
            )}
        </div>
    );
}
