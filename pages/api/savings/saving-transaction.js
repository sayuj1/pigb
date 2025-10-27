import connectDB from "../../../lib/mongodb";
import SavingsTransaction from "@/models/SavingsTransactionSchema";
import Savings from "@/models/SavingsSchema";
import { authenticate } from "@/utils/backend/authMiddleware";
import { handleCreateSavingsTransaction, handleDeleteSavingsTransaction, handleUpdateSavingsTransaction } from "@/services/savingsTransactionService";
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
        const response = await handleDeleteSavingsTransaction(userId, req.query?.id);
        return res.status(200).json({
          message: "Transaction deleted",
          ...response,
        });

      } catch (error) {
        console.error("Error deleting savings transaction:", error);
        handleApiError(res, error, "Failed to delete savings transaction");
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST", "DELETE", "PUT"]);
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
