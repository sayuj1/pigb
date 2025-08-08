import { authenticate } from "@/utils/backend/authMiddleware";
import connectDB from "../../../lib/mongodb";
import Account from "@/models/AccountSchema";
import { getCache } from "@/lib/useCache";
import { CACHE_TTL_1_DAY } from "@/contants/app_constants";

export default async function handler(req, res) {
  await connectDB();

  const userId = authenticate(req);
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  switch (req.method) {
    case "GET":
      try {
        const data = await getCache({
          key: userId,
          prefix: "total-balance",
          ttl: CACHE_TTL_1_DAY, // 1 day
          fetchFn: async () => {
            const accounts = await Account.find({ userId }).select("balance");
            const totalBalance = accounts.reduce(
              (sum, a) => sum + (a.balance || 0),
              0
            );
            return { totalBalance };
          },
        });

        return res.status(200).json(data);
      } catch (error) {
        console.error("Error fetching total balance:", error);
        res.status(500).json({ message: "Server error", error: error.message });
      }

    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
