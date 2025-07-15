import { authenticate } from "@/utils/backend/authMiddleware";
import connectDB from "../../../lib/mongodb";
import Transaction from "@/models/TransactionSchema";
import mongoose from "mongoose";

import { startOfMonth, endOfMonth } from "date-fns";

export default async function handler(req, res) {
  await connectDB();

  const userId = authenticate(req);

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  switch (req.method) {
    // case "GET":
    //   try {
    //     const now = new Date();
    //     const from = startOfMonth(now);
    //     const to = endOfMonth(now);

    //     const agg = await Transaction.aggregate([
    //       {
    //         $match: {
    //           userId: new mongoose.Types.ObjectId(userId),
    //           type: "expense",
    //           date: { $gte: from, $lte: to },
    //         },
    //       },
    //       { $group: { _id: "$category", total: { $sum: "$amount" } } },
    //     ]);

    //     const byCategory = agg.reduce((acc, cur) => {
    //       acc[cur._id] = cur.total;
    //       return acc;
    //     }, {});

    //     res.status(200).json({ byCategory });
    //   } catch (error) {
    //     console.error("Error fetching Category Spend:", error);
    //     res.status(500).json({ message: "Server error", error: error.message });
    //   }
    //   break;
    case "GET":
      try {
        const now = new Date();
        const startDate = startOfMonth(now);
        const endDate = endOfMonth(now);

        const query = {
          userId: new mongoose.Types.ObjectId(userId),
          type: "expense",
        };

        if (startDate) {
          query.date = { ...query.date, $gte: new Date(startDate) };
        }
        if (endDate) {
          query.date = { ...query.date, $lte: new Date(endDate) };
        }

        const agg = await Transaction.aggregate([
          {
            $match: query,
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

        res.status(200).json({ byCategory });
      } catch (error) {
        console.error("Error fetching Category Spend:", error);
        res.status(500).json({ message: "Server error", error: error.message });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
