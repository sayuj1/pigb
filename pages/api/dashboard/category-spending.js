import { authenticate } from "@/utils/backend/authMiddleware";
import connectDB from "../../../lib/mongodb";
import Transaction from "@/models/TransactionSchema";
import mongoose from "mongoose";
import { getCache } from "@/lib/useCache";

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
        const cacheKey = `${userId}:${startDate}:${endDate}`;

        const data = await getCache({
          key: cacheKey,
          prefix: "category-spend",
          ttl: 60 * 60 * 24 * 4, // 4 days
          fetchFn: async () => {
            const agg = await Transaction.aggregate([
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
                  _id: "$category",
                  total: { $sum: "$amount" },
                },
              },
            ]);

            const byCategory = agg.reduce((acc, cur) => {
              acc[cur._id] = cur.total;
              return acc;
            }, {});

            return { byCategory };
          },
        });

        res.status(200).json(data);
      } catch (error) {
        console.error("Error fetching Category Spend:", error);
        res.status(500).json({ message: "Server error", error: error.message });
      }
      break;

    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
