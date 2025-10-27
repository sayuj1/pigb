import connectDB from "../../../lib/mongodb";
import SavingsTransaction from "@/models/SavingsTransactionSchema";
import Savings from "@/models/SavingsSchema";
import { authenticate } from "@/utils/backend/authMiddleware";
import { handleCreateSavingsTransaction, handleUpdateSavingsTransaction } from "@/services/savingsTransactionService";
import { handleApiError } from "@/lib/errors";

export default async function handler(req, res) {
  await connectDB();

  const userId = authenticate(req);

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  switch (req.method) {
    case "GET":
      try {
        const {
          savingsId,
          page = 1,
          limit = 10,
          type,
          search = "",
          start,
          end,
          sortBy = "date", // "date" or "amount"
          sortOrder = "desc", // "asc" or "desc"
        } = req.query;

        if (!savingsId) {
          return res.status(400).json({ message: "savingsId is required" });
        }

        // Verify savings account ownership
        const savings = await Savings.findOne({ _id: savingsId, userId });
        if (!savings) {
          return res.status(403).json({
            message: "Forbidden: You cannot access these transactions",
          });
        }

        // Build query
        const query = { savingsId };
        if (type) query.type = type;
        if (search) query.description = { $regex: search, $options: "i" };
        if (start && end) {
          query.date = {
            $gte: new Date(start),
            $lte: new Date(end),
          };
        }

        // Sort setup
        const sortOptions = {};
        if (["amount", "date"].includes(sortBy)) {
          sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;
        }

        // Pagination metadata
        const parsedLimit = parseInt(limit);
        const parsedPage = parseInt(page);
        const skip = (parsedPage - 1) * parsedLimit;

        const totalTransactions = await SavingsTransaction.countDocuments(query);

        // Fetch paginated results
        const transactions = await SavingsTransaction.find(query)
          .sort(sortOptions)
          .skip(skip)
          .limit(parsedLimit)
          .populate("accountId", "name balance icon color") // Optional field
          .select("-__v"); // Optional: clean response

        return res.status(200).json({
          savings,
          transactions,
          pagination: {
            totalTransactions,
            totalPages: Math.ceil(totalTransactions / parsedLimit),
            currentPage: parsedPage,
            limit: parsedLimit,
          },
        });
      } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ message: "Server error", error: error.message });
      }
      break;

    case "POST":
      try {
        const savings = await handleCreateSavingsTransaction(userId, req.body);
        res.status(201).json({
          message: "Savings transaction created successfully",
          ...savings,
        });
      } catch (error) {
        handleApiError(res, error, "Error creating savings transaction");
      }
      break;

    case "PUT":
      try {
        const savings = await handleUpdateSavingsTransaction(userId, req.body);
        res.status(200).json({
          message: "Savings transaction updated successfully",
          ...savings,
        });
      } catch (error) {
        handleApiError(res, error, "Error updating savings transaction");
      }
      break;

    case "DELETE":
      try {
        const { id } = req.query;

        // Find the savings transaction
        const transaction = await SavingsTransaction.findById(id);
        if (!transaction) {
          return res.status(404).json({ message: "Transaction not found" });
        }

        // Find the associated savings account
        const savings = await Savings.findOne({
          _id: transaction.savingsId,
          userId,
        });
        if (!savings) {
          return res.status(403).json({
            message: "Forbidden: You do not own this savings account",
          });
        }

        // Reverse transaction effect on savings balance
        let updatedBalance = savings.runningBalance;
        if (transaction.type === "deposit" || transaction.type === "interest") {
          updatedBalance -= transaction.amount;
        } else if (transaction.type === "withdrawal") {
          updatedBalance += transaction.amount;
        }

        // Delete linked transaction if it exists
        if (transaction.transactionId) {
          const deleteRes = await fetch(
            `${process.env.API_BASE_URL || "http://localhost:3000"}/api/transactions/transaction?id=${transaction.transactionId}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                cookie: req.headers.cookie || "",
              },
            }
          );

          const deleteData = await deleteRes.json();
          if (!deleteRes.ok) {
            return res.status(500).json({
              message: "Failed to delete linked transaction",
              error: deleteData.message || "Unknown error",
            });
          }
        }

        // Delete the savings transaction
        await SavingsTransaction.findByIdAndDelete(id);

        // Update the savings account balance
        savings.runningBalance = updatedBalance;
        await savings.save();

        return res.status(200).json({
          message: "Transaction deleted",
          updatedBalance,
        });

      } catch (error) {
        console.error("Error deleting transaction:", error);
        res.status(500).json({ message: "Server error", error: error.message });
      }
      break;


    default:
      res.setHeader("Allow", ["GET", "POST", "DELETE", "PUT"]);
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
