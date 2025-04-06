import connectDB from "../../../lib/mongodb";
import SavingsTransaction from "@/models/SavingsTransactionSchema";
import Savings from "@/models/SavingsSchema";
import { authenticate } from "@/utils/backend/authMiddleware";

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

        // Verify ownership of the savings account
        const savings = await Savings.findOne({ _id: savingsId, userId });
        if (!savings) {
          return res.status(403).json({
            message: "Forbidden: You cannot access these transactions",
          });
        }

        // Build query with filters
        const query = { savingsId };

        if (type) {
          query.type = type;
        }

        if (search) {
          query.description = { $regex: search, $options: "i" };
        }

        if (start && end) {
          query.date = {
            $gte: new Date(start),
            $lte: new Date(end),
          };
        }

        // Build sort object dynamically
        const sortOptions = {};
        if (sortBy === "amount" || sortBy === "date") {
          sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;
        }

        // Get total count for pagination
        const totalTransactions = await SavingsTransaction.countDocuments(
          query
        );

        // Paginate and sort
        const transactions = await SavingsTransaction.find(query)
          .sort(sortOptions)
          .skip((page - 1) * limit)
          .limit(parseInt(limit));

        return res.status(200).json({
          savings,
          transactions,
          pagination: {
            totalTransactions,
            totalPages: Math.ceil(totalTransactions / limit),
            currentPage: parseInt(page),
            limit: parseInt(limit),
          },
        });
      } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ message: "Server error", error: error.message });
      }

      break;
    /** ✅ CREATE A NEW TRANSACTION **/
    case "POST":
      try {
        const { savingsId, date, amount, type, description } = req.body;
        if (!savingsId || !date || !amount || !type) {
          return res.status(400).json({ message: "Missing required fields" });
        }

        // Verify ownership of the savings account
        const savings = await Savings.findOne({ _id: savingsId, userId });
        if (!savings) {
          return res.status(403).json({
            message: "Forbidden: You cannot modify this savings account",
          });
        }

        // Determine how running balance should be updated
        let updatedBalance = savings.runningBalance;
        if (type === "deposit" || type === "interest") {
          updatedBalance += amount; // Increase balance
        } else if (type === "withdrawal") {
          updatedBalance -= amount; // Decrease balance
        }

        // Create transaction
        const transaction = await SavingsTransaction.create({
          savingsId,
          amount,
          date,
          type,
          description,
        });

        // Update the savings account balance
        savings.runningBalance = updatedBalance;
        await savings.save();

        return res.status(201).json({ transaction, updatedBalance });
      } catch (error) {
        console.error("Error creating transaction:", error);
        res.status(500).json({ message: "Server error", error: error.message });
      }
      break;
    case "PUT":
      try {
        const { _id: id, amount, date, type, description } = req.body;

        if (!amount || !date || !type) {
          return res.status(400).json({ message: "Missing required fields" });
        }

        // Find the transaction
        const transaction = await SavingsTransaction.findById(id);
        if (!transaction) {
          return res.status(404).json({ message: "Transaction not found" });
        }

        // Find the corresponding savings account
        const savings = await Savings.findOne({
          _id: transaction.savingsId,
          userId,
        });
        if (!savings) {
          return res.status(403).json({
            message: "Forbidden: You do not own this savings account",
          });
        }

        // Adjust running balance
        let updatedBalance = savings.runningBalance;

        // Reverse old transaction effect
        if (transaction.type === "deposit" || transaction.type === "interest") {
          updatedBalance -= transaction.amount;
        } else if (transaction.type === "withdrawal") {
          updatedBalance += transaction.amount;
        }

        // Apply new transaction effect
        if (type === "deposit" || type === "interest") {
          updatedBalance += amount;
        } else if (type === "withdrawal") {
          updatedBalance -= amount;
        }

        // Update the transaction
        transaction.amount = amount;
        transaction.date = date;
        transaction.type = type;
        transaction.description = description || transaction.description;
        await transaction.save();

        // Update running balance
        savings.runningBalance = updatedBalance;
        await savings.save();

        return res.status(200).json({ transaction, updatedBalance });
      } catch (error) {
        console.error("Error updating transaction:", error);
        res.status(500).json({ message: "Server error", error: error.message });
      }
      break;
    case "DELETE":
      try {
        const { id } = req.query;
        // Find the transaction
        const transaction = await SavingsTransaction.findById(id);
        if (!transaction) {
          return res.status(404).json({ message: "Transaction not found" });
        }

        // Find the corresponding savings account
        const savings = await Savings.findOne({
          _id: transaction.savingsId,
          userId,
        });
        if (!savings) {
          return res.status(403).json({
            message: "Forbidden: You do not own this savings account",
          });
        }

        // Adjust running balance before deleting
        let updatedBalance = savings.runningBalance;
        if (transaction.type === "deposit" || transaction.type === "interest") {
          updatedBalance -= transaction.amount;
        } else if (transaction.type === "withdrawal") {
          updatedBalance += transaction.amount;
        }

        // Delete the transaction
        await SavingsTransaction.findByIdAndDelete(id);

        // Update the savings balance
        savings.runningBalance = updatedBalance;
        await savings.save();

        return res
          .status(200)
          .json({ message: "Transaction deleted", updatedBalance });
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
