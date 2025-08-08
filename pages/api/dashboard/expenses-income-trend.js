import mongoose from "mongoose";
import { authenticate } from "@/utils/backend/authMiddleware";
import connectDB from "@/lib/mongodb";
import Transaction from "@/models/TransactionSchema";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { getCache } from "@/lib/useCache";
import { CACHE_TTL_1_DAY } from "@/contants/app_constants";

dayjs.extend(utc);
dayjs.extend(timezone);

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

        // Step 1: Try Redis cache
        const cached = await getCache({
          key: cacheKey,
          prefix: "expenses-income-trend",
          ttl: CACHE_TTL_1_DAY, // 1 days = 86400 seconds
          fetchFn: async () => {
            // Step 2: Fetch from DB
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

            // Step 3: Process into monthly map
            const monthlyMap = {};
            transactions.forEach((tx) => {
              const monthKey = dayjs.utc(tx.date).tz("Asia/Kolkata").format("MMM YYYY");
              if (!monthlyMap[monthKey]) {
                monthlyMap[monthKey] = { income: 0, expense: 0 };
              }
              monthlyMap[monthKey][tx.type] += tx.amount;
            });

            // Step 4: Convert map to sorted array
            const monthly = Object.entries(monthlyMap)
              .map(([month, data]) => ({ month, ...data }))
              .sort((a, b) => {
                const getDate = (str) => new Date(`1 ${str}`);
                return getDate(a.month) - getDate(b.month);
              });

            return { monthly };
          },
        });

        return res.status(200).json(cached);

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
