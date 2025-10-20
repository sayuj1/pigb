import Budget from "@/models/BudgetSchema";
import connectDB from "../../../lib/mongodb";
import { authenticate } from "@/utils/backend/authMiddleware";
import { handleCreateBudget, handleDeleteBudget, handleUpdateBudget } from "@/services/budgetService";
import { handleApiError } from "@/lib/errors";

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
        const newBudget = await handleCreateBudget(userId, req.body);
        res.status(201).json({
          message: "Budget created successfully",
          newBudget,
        });
      } catch (error) {
        handleApiError(res, error, "Error adding budget");
      }
      break;

    case "GET":
      try {
        // Pagination
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const skip = (page - 1) * pageSize;

        // Sorting
        const sortBy = req.query.sortBy || "createdAt";
        const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;

        // Searching
        const searchQuery = req.query.search || "";

        // Date filtering
        const { startDate, endDate } = req.query;
        const dateFilter =
          startDate && endDate
            ? {
              startDate: { $lte: new Date(endDate) },
              endDate: { $gte: new Date(startDate) },
            }
            : {};

        // Search filter
        const searchFilter = searchQuery
          ? {
            $or: [
              { category: { $regex: searchQuery, $options: "i" } },
              { budgetName: { $regex: searchQuery, $options: "i" } },
            ],
          }
          : {};

        // Combined filters
        const filters = {
          userId,
          ...dateFilter,
          ...searchFilter,
        };

        const budgets = await Budget.find(filters)
          .skip(skip)
          .limit(pageSize)
          .sort({ [sortBy]: sortOrder });

        const totalBudgets = await Budget.countDocuments(filters);

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
        const resp = await handleDeleteBudget(userId, req.query?.id);
        res.status(200).json(resp);

      } catch (error) {
        console.error("Error deleting budget:", error);
        handleApiError(res, error, "Failed to delete budget");
      }

    case "PUT":
      try {
        const budget = await handleUpdateBudget(userId, req.query?.id, req.body);
        res.status(200).json({
          message: "Budget updated successfully",
          budget,
        });
      } catch (error) {
        handleApiError(res, error, "Error updating budget");
      }
      break;

    default:
      res.status(405).json({ message: "Method Not Allowed" });
      break;
  }
}
