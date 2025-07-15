import { authenticate } from "@/utils/backend/authMiddleware";
import connectDB from "@/lib/mongodb";
import Transaction from "@/models/TransactionSchema";
import mongoose from "mongoose";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

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
    // ✅ Ensure both are in UTC
    const from = dayjs().utc().startOf("month").toISOString();
    const to = dayjs().utc().endOf("month").toISOString();

    console.log("From:", from);
    console.log("To:", to);

    const expenses = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          type: "expense",
          date: { $gte: new Date(from), $lte: new Date(to) },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    res.status(200).json({ totalExpenses: expenses[0]?.total || 0 });
  } catch (error) {
    console.error("Error fetching total expenses:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
