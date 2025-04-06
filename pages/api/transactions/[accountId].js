import { authenticate } from '@/utils/backend/authMiddleware';
import connectDB from '../../../lib/mongodb';
import Transaction from "@/models/TransactionSchema";

export default async function handler(req, res) {
    await connectDB();

    const userId = authenticate(req);

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.method === "GET") {
        const { accountId, page = 1, limit = 10, sortBy = "date", order = "desc", search, minAmount, maxAmount } = req.query;
        if (!accountId) {
            return res.status(400).json({ message: "Account ID is required." });
        }

        try {
            const skip = (parseInt(page) - 1) * parseInt(limit);
            const sortOrder = order === "asc" ? 1 : -1;
            
            let query = { accountId };
            
            // Apply search filter if provided
            if (search) {
                query.$or = [
                    { category: { $regex: search, $options: "i" } },
                    { description: { $regex: search, $options: "i" } }
                ];
            }

            // Apply amount range filter if provided
            if (minAmount || maxAmount) {
                query.amount = {};
                if (minAmount) query.amount.$gte = parseFloat(minAmount);
                if (maxAmount) query.amount.$lte = parseFloat(maxAmount);
            }

            const transactions = await Transaction.find(query)
                .sort({ [sortBy]: sortOrder }) // Sorting
                .skip(skip)
                .limit(parseInt(limit));

            const totalTransactions = await Transaction.countDocuments(query);

            res.status(200).json({ 
                message: "Transactions fetched successfully.", 
                transactions,
                totalPages: Math.ceil(totalTransactions / parseInt(limit)),
                currentPage: parseInt(page),
                totalTransactions
            });
        } catch (err) {
            res.status(500).json({ message: "Server error", error: err.message });
        }
    }

    res.status(405).json({ message: "Method not allowed." });
}
