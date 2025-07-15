import mongoose from "mongoose";
import { authenticate } from "@/utils/backend/authMiddleware";
import connectDB from "@/lib/mongodb";
import Transaction from "@/models/TransactionSchema";

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

        const start = new Date(startDate);
        const end = new Date(endDate);
        const userObjectId = new mongoose.Types.ObjectId(userId);

        const transactions = await Transaction.aggregate([
          {
            $match: {
              userId: userObjectId,
              date: {
                $gte: start,
                $lte: end,
              },
            },
          },
        ]);

        // Step 2: Process into monthly map
        const monthlyMap = {};

        transactions.forEach((tx) => {
          const date = new Date(tx.date);
          const monthKey = date.toLocaleString("default", { month: "short" }) + " " + date.getFullYear(); // e.g., "Jun 2025"

          if (!monthlyMap[monthKey]) {
            monthlyMap[monthKey] = { income: 0, expense: 0 };
          }

          monthlyMap[monthKey][tx.type] += tx.amount;
        });

        // Step 3: Convert map to sorted array
        const monthly = Object.entries(monthlyMap)
          .map(([month, data]) => ({ month, ...data }))
          .sort((a, b) => {
            const getDate = (str) => new Date(`1 ${str}`);
            return getDate(a.month) - getDate(b.month);
          });

        return res.status(200).json({ monthly });

      } catch (err) {
        console.error("Error fetching expenses-income-trend", err);
        res.status(500).json({ error: "Internal Server Error" });
      }
      break;

    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
