import Budget from "../../models/Budget"; // Adjust the path as needed
import connectDB from "../../../lib/mongodb"; // A utility function to connect to your database (see below)
import { authenticate } from "@/utils/backend/authMiddleware";
import Transaction from "@/models/TransactionSchema";

export default async function handler(req, res) {
  await connectDB();

  const userId = authenticate(req);

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  switch (req.method) {
    // ✅ Create a new budget
    case "POST":
      try {
        const { category, startDate, endDate, limitAmount, budgetName } =
          req.body;

        if (!category || !startDate || !endDate || !limitAmount) {
          return res.status(400).json({ message: "Missing required fields" });
        }

        const newBudget = await Budget.createBudget(
          userId,
          category,
          new Date(startDate),
          new Date(endDate),
          limitAmount,
          budgetName || ""
        );
        res
          .status(201)
          .json({ message: "Budget created successfully", budget: newBudget });
      } catch (error) {
        console.error("Error creating budget:", error);
        res.status(500).json({ message: "Server error", error: error.message });
      }
      break;

    // ✅ Get all budgets for a user with pagination, sorting, and searching
    case "GET":
      try {
        // Pagination
        const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
        const pageSize = parseInt(req.query.pageSize) || 10; // Default to 10 items per page if not provided
        const skip = (page - 1) * pageSize;

        // Sorting
        const sortBy = req.query.sortBy || "createdAt"; // Default sort by createdAt
        const sortOrder = req.query.sortOrder === "desc" ? -1 : 1; // Default ascending order

        // Searching (Simple search by category)
        const searchQuery = req.query.search || "";

        // Build search filter
        const searchFilter = searchQuery
          ? {
              $or: [
                { category: { $regex: searchQuery, $options: "i" } },
                { budgetName: { $regex: searchQuery, $options: "i" } },
              ],
            }
          : {};

        // Find budgets with filters, pagination, and sorting
        const budgets = await Budget.find({ userId, ...searchFilter })
          .skip(skip)
          .limit(pageSize)
          .sort({ [sortBy]: sortOrder });

        // Count total budgets for pagination metadata
        const totalBudgets = await Budget.countDocuments({
          userId,
          ...searchFilter,
        });

        res.status(200).json({
          budgets,
          totalBudgets,
          page,
          pageSize,
          totalPages: Math.ceil(totalBudgets / pageSize),
        });
      } catch (error) {
        console.error("Error fetching budgets:", error);
        res.status(500).json({ message: "Server error", error: error.message });
      }
      break;

    case "DELETE":
      try {
        const { id } = req.query;
        if (!id) return res.status(400).json({ message: "Missing budget ID" });

        // Make sure the budget belongs to the logged-in user
        const budget = await Budget.findOneAndDelete({ _id: id, userId });

        if (!budget) {
          return res
            .status(404)
            .json({ message: "Budget not found or unauthorized" });
        }

        // Successfully deleted budget
        res.status(200).json({ message: "Budget deleted successfully" });
      } catch (error) {
        console.error("Error deleting budget:", error);
        res.status(500).json({ message: "Server error", error: error.message });
      }
      break;

    case "PUT":
      try {
        const {
          _id: id,
          category,
          limitAmount,
          startDate,
          endDate,
          budgetName,
        } = req.body;

        if (!category || !limitAmount || !startDate || !endDate || !userId) {
          return res.status(400).json({ message: "Missing required fields" });
        }

        // Find the existing budget by ID
        const budget = await Budget.findById(id);

        if (!budget) {
          return res.status(404).json({ message: "Budget not found" });
        }

        // Check if the logged-in user is the owner of the budget
        if (budget.userId.toString() !== userId) {
          return res
            .status(403)
            .json({ message: "You are not authorized to edit this budget" });
        }

        const oldStartDate = budget.startDate;
        const oldEndDate = budget.endDate;
        const oldCategory = budget.category;

        // Check if startDate, endDate, or category is being changed
        const startDateChanged =
          new Date(startDate).getTime() !== new Date(oldStartDate).getTime();
        const endDateChanged =
          new Date(endDate).getTime() !== new Date(oldEndDate).getTime();
        const categoryChanged = category !== oldCategory;

        // 1. Remove transactions from the old budget if date range or category changes
        if (startDateChanged || endDateChanged || categoryChanged) {
          // Remove affected transactions from the old budget
          for (const transaction of budget.transactions) {
            const transactionDetails = await Transaction.findById(
              transaction.transactionId
            );

            // If transaction falls within the old budget's date range or category, remove it from the budget
            if (
              transactionDetails &&
              transactionDetails.date >= oldStartDate &&
              transactionDetails.date <= oldEndDate &&
              transactionDetails.category === oldCategory
            ) {
              await Budget.removeExpense(transaction.transactionId);
            }
          }
        }

        // 2. Update the budget fields
        budget.category = category;
        budget.limitAmount = limitAmount;
        budget.startDate = new Date(startDate);
        budget.endDate = new Date(endDate);
        budget.budgetName = budgetName || "";

        // 3. Add transactions back to the new budget
        if (startDateChanged || endDateChanged || categoryChanged) {
          // Find all transactions that match the new date range and category, and add them back
          const transactionsToAdd = await Transaction.find({
            userId: budget.userId,
            category: category,
            date: { $gte: startDate, $lte: endDate },
          });

          for (const transaction of transactionsToAdd) {
            await Budget.addExpense(
              budget.userId,
              category,
              transaction.date,
              transaction.amount,
              transaction._id,
              transaction.description
            );
          }
        }

        // 4. Save the updated budget
        await budget.save();

        res
          .status(200)
          .json({ message: "Budget updated successfully", budget });
      } catch (error) {
        console.error("Error updating budget:", error);
        res.status(500).json({ message: "Server error", error: error.message });
      }
      break;

    default:
      res.status(405).json({ message: "Method Not Allowed" });
      break;
  }
}
