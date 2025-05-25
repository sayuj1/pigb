import { authenticate } from "@/utils/backend/authMiddleware";
import connectDB from "@/lib/mongodb";
import Transaction from "@/models/TransactionSchema";
import mongoose from "mongoose";
import { startOfMonth, endOfMonth } from "date-fns";

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
    const now = new Date();
    const from = startOfMonth(now);
    const to = endOfMonth(now);

    const expenses = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId), // Cast correctly
          type: "expense",
          date: { $gte: from, $lte: to },
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
