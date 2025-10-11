import { createContext, useContext, useState, useEffect } from "react";
import dayjs from "dayjs";
import useDebounce from "@/hooks/useDebounce";

const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const [filters, setFilters] = useState({
        search: "",
        minAmount: "",
        maxAmount: "",
        sortBy: "date",
        sortOrder: "desc",
        startDate: dayjs().startOf("month").toISOString(),
        endDate: dayjs().endOf("month").toISOString(),
        type: "",
        accountId: [],
    });
    const [searchInput, setSearchInput] = useState("");
    const debouncedSearch = useDebounce(searchInput, 500);
    const debouncedMinAmount = useDebounce(filters.minAmount, 500);
    const debouncedMaxAmount = useDebounce(filters.maxAmount, 500);
    const [accountOptions, setAccountOptions] = useState([]);
    const [insights, setInsights] = useState({
        totalExpense: 0,
        expenseByAccounts: [],
        topCategories: [],
    });

    //TODO: move this to account context Fetch Accounts
    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const res = await fetch("/api/accounts/account");
                const data = await res.json();
                setAccountOptions(data.accounts || []);
            } catch (err) {
                console.error("Failed to load accounts", err);
            }
        };
        fetchAccounts();
    }, []);

    // Fetch Transactions
    const fetchTransactions = async (params = {}) => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page: params.current || pagination.current,
                limit: params.pageSize || pagination.pageSize,
                search: debouncedSearch,
                minAmount: debouncedMinAmount || "",
                maxAmount: debouncedMaxAmount || "",
                sortBy: filters.sortBy,
                sortOrder: filters.sortOrder,
                startDate: filters.startDate,
                endDate: filters.endDate,
                type: filters.type || "",
                ...(filters.accountId.length && {
                    accountId: filters.accountId.join(","),
                }),
            }).toString();

            const res = await fetch(`/api/transactions/transaction?${query}`);
            const data = await res.json();

            setTransactions(data.transactions);
            setPagination((prev) => ({ ...prev, total: data.pagination.totalItems }));
        } catch (error) {
            console.error("Failed to fetch transactions", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch transaction Insights
    const fetchInsights = async () => {
        try {
            const query = new URLSearchParams({
                startDate: filters.startDate,
                endDate: filters.endDate,
                ...(filters.accountId.length && {
                    accountId: filters.accountId.join(","),
                }),
            }).toString();

            const res = await fetch(`/api/transactions/insights?${query}`);
            const data = await res.json();
            setInsights(data);
        } catch (err) {
            console.error("Failed to load insights", err);
        }
    };

    // Auto-fetch on filters/pagination change
    useEffect(() => {
        fetchTransactions();
        fetchInsights();
    }, [
        pagination.current,
        pagination.pageSize,
        filters.sortBy,
        filters.sortOrder,
        filters.startDate,
        filters.endDate,
        debouncedSearch,
        debouncedMinAmount,
        debouncedMaxAmount,
        filters.type,
        filters.accountId,
    ]);

    useEffect(() => {
        setFilters((prev) => ({ ...prev, search: debouncedSearch }));
        setPagination((prev) => ({ ...prev, current: 1 }));
    }, [debouncedSearch]);

    return (
        <TransactionContext.Provider
            value={{
                transactions,
                setTransactions,
                loading,
                pagination,
                setPagination,
                filters,
                setFilters,
                searchInput,
                setSearchInput,
                accountOptions,
                insights,
                fetchTransactions,
                fetchInsights,
            }}
        >
            {children}
        </TransactionContext.Provider>
    );
};

export const useTransactions = () => useContext(TransactionContext);
