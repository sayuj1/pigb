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
        // 1. Get all savings accounts for user with _id and accountName
        const userSavings = await Savings.find({ userId }).select(
          "_id accountName"
        );
        if (userSavings.length === 0) {
          return res.status(200).json({ trends: [] });
        }

        // 2. Fetch transactions for these accounts
        const savingsIds = userSavings.map((s) => s._id);
        const txns = await SavingsTransaction.find({
          savingsId: { $in: savingsIds },
        }).select("date amount type savingsId");

        // 3. Prepare a map from savingsId to its transactions grouped by month
        const savingsTxnMap = {};
        userSavings.forEach(({ _id, accountName }) => {
          savingsTxnMap[_id] = {
            accountName,
            monthly: {}, // monthly net amounts
          };
        });

        // 4. Group transactions by savingsId and month, sum amounts with type consideration
        txns.forEach(({ savingsId, date, amount, type }) => {
          const monthKey = format(date, "MMM yyyy");
          const entry = savingsTxnMap[savingsId];
          if (!entry) return; // safety

          entry.monthly[monthKey] = entry.monthly[monthKey] ?? 0;
          if (type === "withdrawal") entry.monthly[monthKey] -= amount;
          else entry.monthly[monthKey] += amount;
        });

        // 5. Get all unique months across all accounts for consistent X-axis
        const allMonthsSet = new Set();
        Object.values(savingsTxnMap).forEach(({ monthly }) => {
          Object.keys(monthly).forEach((m) => allMonthsSet.add(m));
        });
        const allMonths = Array.from(allMonthsSet).sort(
          (a, b) => new Date(a) - new Date(b)
        );

        // 6. For each savings account, compute running balance for each month (fill missing months with previous balance)
        const trends = Object.values(savingsTxnMap).map(
          ({ accountName, monthly }) => {
            let runningBalance = 0;
            const balances = allMonths.map((month) => {
              const delta = monthly[month] ?? 0;
              runningBalance += delta;
              return { month, balance: runningBalance };
            });
            return { accountName, balances };
          }
        );

        res.status(200).json({ trends, allMonths });
      } catch (error) {
        console.error("Error fetching savings transactions:", error);
        res.status(500).json({ message: "Server error", error: error.message });
      }
      break;

    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
