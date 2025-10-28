import { authenticate } from "@/utils/backend/authMiddleware";
import connectDB from "../../../lib/mongodb";
import SavingsTransaction from "@/models/SavingsTransactionSchema";
import Savings from "@/models/SavingsSchema";
import { format } from "date-fns";

export default async function handler(req, res) {
  await connectDB();

  const userId = authenticate(req);

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  switch (req.method) {
    case "GET":
      try {
        const savings = await Savings.find({ userId, status: "active" }).select("accountName runningBalance savingsType");
        // Group savings by savingsType
        const typeMap = new Map();
        let totalAmount = 0;

        for (const item of savings) {
          const { savingsType, runningBalance = 0 } = item;
          totalAmount += runningBalance;

          if (!typeMap.has(savingsType)) {
            typeMap.set(savingsType, { savingsType, amount: 0 });
          }
          typeMap.get(savingsType).amount += runningBalance;
        }

        // Prepare breakdown by savingsType
        const savingsByType = Array.from(typeMap.values()).map((entry) => ({
          savingsType: entry.savingsType,
          amount: entry.amount,
          percentage: totalAmount > 0 ? ((entry.amount / totalAmount) * 100).toFixed(2) : "0.00",
        }));

        res.status(200).json({
          savings,
          summary: {
            totalAmount,
            savingsByType,
          },
        });

        // res.status(200).json({ savings });
      } catch (error) {
        console.error("Error fetching savings balances:", error);
        res.status(500).json({ message: "Server error", error: error.message });
      }
      break;
    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
