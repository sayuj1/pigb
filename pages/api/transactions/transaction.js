import connectDB from "../../../lib/mongodb";
import Transaction from "../../../models/TransactionSchema";
import Account from "@/models/AccountSchema";
import Budget from "@/models/BudgetSchema";
import { authenticate } from "@/utils/backend/authMiddleware";
import { delCache, delAllWithPrefix } from "@/lib/useCache";
import { handleCreateTransaction, handleDeleteTransaction, handleUpdateTransaction } from "@/services/transactionService";
import { handleApiError } from "@/lib/errors";

export default async function handler(req, res) {
  await connectDB();

  const userId = authenticate(req);

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  switch (req.method) {
    // ✅ Fetch Transactions
    case "GET":
      try {
        // Extract and sanitize query parameters
        let {
          page = "1",
          limit = "10",
          sortBy = "date",
          sortOrder = "desc",
          search = "",
          type,
          category,
          minAmount,
          maxAmount,
          startDate,
          endDate,
          accountId,
        } = req.query;

        const parsedPage = Math.max(1, parseInt(page));
        const parsedLimit = Math.max(1, parseInt(limit));
        const skip = (parsedPage - 1) * parsedLimit;
        const sortDirection = sortOrder === "asc" ? 1 : -1;

        // Base query: only user-specific transactions
        const query = { userId };

        // Text search (description/category)
        if (search.trim()) {
          const regex = new RegExp(search.trim(), "i");
          query.$or = [{ category: regex }, { description: regex }];
        }

        // Filters
        if (type) query.type = type;
        if (category) query.category = category;

        if (minAmount || maxAmount) {
          query.amount = {};
          if (minAmount) query.amount.$gte = parseFloat(minAmount);
          if (maxAmount) query.amount.$lte = parseFloat(maxAmount);
        }

        if (startDate || endDate) {
          query.date = {};
          if (startDate) query.date.$gte = new Date(startDate);
          if (endDate) query.date.$lte = new Date(endDate);
        }

        if (accountId) {
          const accountIds = Array.isArray(accountId)
            ? accountId
            : accountId.split(",").map((id) => id.trim());
          query.accountId = { $in: accountIds };
        }

        // Fetch filtered & paginated transactions
        const [transactions, total] = await Promise.all([
          Transaction.find(query)
            .populate({
              path: "accountId",
              select: "name type icon color balance",
            })
            .sort({ [sortBy]: sortDirection })
            .skip(skip)
            .limit(parsedLimit),
          Transaction.countDocuments(query),
        ]);

        // Success response
        res.status(200).json({
          message: "Transactions fetched successfully",
          transactions,
          pagination: {
            currentPage: parsedPage,
            totalPages: Math.ceil(total / parsedLimit),
            totalItems: total,
          },
        });
      } catch (error) {
        console.error("[GET /transactions] Error:", {
          message: error.message,
          stack: error.stack,
        });

        res.status(500).json({
          message: "An error occurred while fetching transactions.",
          error: error.message,
        });
      }
      break;

    // ✅ Add New Transaction
    case "POST":
      try {
        const transaction = await handleCreateTransaction(userId, req.body);
        res.status(201).json({
          message: "Transaction added successfully",
          transaction,
        });
      } catch (error) {
        handleApiError(res, error, "Error adding transaction");
      }
      break;


    // ✅ Edit (Update) Transaction
    case "PUT":
      try {
        const transaction = await handleUpdateTransaction(userId, req.query?.id, req.body);
        res.status(200).json({
          message: "Transaction updated successfully",
          transaction,
        });
      } catch (error) {
        handleApiError(res, error, "Error updating transaction");
      }
      break;

    // Delete Transaction
    case "DELETE":
      try {
        const resp = await handleDeleteTransaction(userId, req.query?.id);
        res.status(200).json(resp);

      } catch (error) {
        console.error("Error deleting transaction:", error);
        handleApiError(res, error, "Failed to delete transaction");
      }
      break;
    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
