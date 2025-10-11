// AccountContext.js
import { createContext, useContext, useState, useEffect } from "react";

const AccountContext = createContext();

export const AccountProvider = ({ children }) => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAccounts = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/accounts/account");
            if (!response.ok) throw new Error("Failed to fetch accounts");

            const data = await response.json();
            setAccounts(data.accounts || []);
            return data.accounts || []; // return value for awaiting components
        } catch (err) {
            setError(err.message);
            throw err; // ✅ rethrow so caller can handle error
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    return (
        <AccountContext.Provider
            value={{ accounts, setAccounts, loading, error, fetchAccounts }}
        >
            {children}
        </AccountContext.Provider>
    );
};

export const useAccount = () => useContext(AccountContext);
