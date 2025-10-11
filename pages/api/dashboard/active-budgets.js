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

        const count = await Budget.countDocuments({
          userId,
          startDate: { $gte: new Date(startDate) },
          endDate: { $lte: new Date(endDate) },
        });

        res.status(200).json({ count });
      } catch (error) {
        console.error("Error fetching total balance:", error);
        res.status(500).json({ message: "Server error", error: error.message });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
