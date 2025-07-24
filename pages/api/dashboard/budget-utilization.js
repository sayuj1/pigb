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
        const { todayDate } = req.query;
        if (!todayDate) {
          return res.status(400).json({ message: "Missing todayDate parameter" });
        }

        const now = new Date(todayDate);

        const budgets = await Budget.find({
          userId,
          startDate: { $lte: now },
          endDate: { $gte: now },
        }).select("budgetName spentAmount limitAmount");

        res.status(200).json({
          budgets: budgets.map((b) => ({
            id: b._id,
            name: b.budgetName || b.category,
            spent: b.spentAmount,
            limit: b.limitAmount,
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
