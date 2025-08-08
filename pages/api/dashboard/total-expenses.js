import { authenticate } from "@/utils/backend/authMiddleware";
import connectDB from "@/lib/mongodb";
import Transaction from "@/models/TransactionSchema";
import mongoose from "mongoose";
import { getCache } from "@/lib/useCache";
import { CACHE_TTL_1_DAY } from "@/contants/app_constants";

export default async function handler(req, res) {
  await connectDB();

  const userId = authenticate(req);
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method !== "GET") {
    return res
      .setHeader("Allow", ["GET"])
      .status(405)
      .json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    const { startDate, endDate } = req.query;

    const total = await getCache({
      key: userId,
      prefix: "total-expense",
      ttl: CACHE_TTL_1_DAY, // 1 day = 86400 seconds
      fetchFn: async () => {
        const expenses = await Transaction.aggregate([
          {
            $match: {
              userId: new mongoose.Types.ObjectId(userId),
              type: "expense",
              date: {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
              },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$amount" },
            },
          },
        ]);
        return { totalExpenses: expenses[0]?.total || 0 };
      },
    });

    return res.status(200).json(total);
  } catch (error) {
    console.error("Error fetching total expenses:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
