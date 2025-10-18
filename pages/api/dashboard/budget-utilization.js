import { authenticate } from "@/utils/backend/authMiddleware";
import connectDB from "../../../lib/mongodb";
import Budget from "@/models/BudgetSchema";

export default async function handler(req, res) {
  await connectDB();

  const userId = authenticate(req);

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  switch (req.method) {
    case "GET":
      try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
          return res.status(400).json({ message: "Missing start and end date parameters" });
        }

        const budgets = await Budget.find({
          userId,
          startDate: { $gte: new Date(startDate) },
          endDate: { $lte: new Date(endDate) },
        }).select("budgetName spentAmount limitAmount startDate endDate category");

        res.status(200).json({
          budgets: budgets.map((b) => ({
            id: b._id,
            name: b.budgetName || b.category,
            spent: b.spentAmount,
            limit: b.limitAmount,
            startDate: b.startDate,
            endDate: b.endDate,
            category: b.category

          })),
        });
      } catch (error) {
        console.error("Error fetching total expenses:", error);
        res.status(500).json({ message: "Server error", error: error.message });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
