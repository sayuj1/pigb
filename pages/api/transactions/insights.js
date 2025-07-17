import connectDB from "../../../lib/mongodb";
import Transaction from "@/models/TransactionSchema";
import Account from "@/models/AccountSchema";
import { authenticate } from "@/utils/backend/authMiddleware";

export default async function handler(req, res) {
    await connectDB();

    const userId = authenticate(req);

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {

        const { startDate, endDate, accountId } = req.query;

        const baseQuery = {
            userId,
        };

        if (startDate) {
            baseQuery.date = { ...baseQuery.date, $gte: new Date(startDate) };
        }
        if (endDate) {
            baseQuery.date = { ...baseQuery.date, $lte: new Date(endDate) };
        }
        if (accountId) {
            const ids = accountId.split(",");
            baseQuery.accountId = { $in: ids };
        }

        // Fetch all matching transactions (both income and expense)
        const transactions = await Transaction.find(baseQuery).populate("accountId");

        // Separate totals
        let totalExpense = 0;
        let totalIncome = 0;

        const expenseByAccountsMap = {};
        const categoryTotals = {};

        for (const tx of transactions) {
            const accId = tx.accountId?._id?.toString();
            const accName = tx.accountId?.name;

            if (tx.type === "expense") {
                totalExpense += tx.amount;

                if (accId) {
                    if (!expenseByAccountsMap[accId]) {
                        expenseByAccountsMap[accId] = {
                            accountId: accId,
                            accountName: accName,
                            total: 0,
                            icon: tx.accountId?.icon || "💰",
                            color: tx.accountId?.color || "#000000",
                        };
                    }
                    expenseByAccountsMap[accId].total += tx.amount;
                }

                if (!categoryTotals[tx.category]) categoryTotals[tx.category] = 0;
                categoryTotals[tx.category] += tx.amount;
            }

            if (tx.type === "income") {
                totalIncome += tx.amount;
            }
        }
        const topCategories = Object.entries(categoryTotals)
            .map(([category, total]) => ({ category, total }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 3);

        res.status(200).json({
            totalExpense,
            totalIncome: totalIncome.toFixed(2) || 0,
            expenseByAccounts: Object.values(expenseByAccountsMap),
            topCategories,
        });
    } catch (error) {
        console.error("Insights API Error:", error);
        res.status(500).json({ message: "Failed to fetch insights", error: error.message });
    }
}
