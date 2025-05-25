import { authenticate } from "@/utils/backend/authMiddleware";
import connectDB from "../../../lib/mongodb";
import Transaction from "@/models/TransactionSchema";
import { subMonths, startOfMonth, endOfMonth, format } from "date-fns";

export default async function handler(req, res) {
  await connectDB();

  const userId = authenticate(req);

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  switch (req.method) {
    case "GET":
      try {
        const now = new Date();
        const start = startOfMonth(subMonths(now, 11));

        // fetch last 12 months’ transactions
        const txns = await Transaction.find({
          userId,
          date: { $gte: start, $lte: now },
        }).select("amount type date");

        // initialize months array
        const months = [];
        for (let i = 11; i >= 0; i--) {
          const d = subMonths(now, i);
          months.push({ month: format(d, "MMM yyyy"), income: 0, expense: 0 });
        }

        // aggregate
        txns.forEach((t) => {
          const key = format(t.date, "MMM yyyy");
          const m = months.find((m) => m.month === key);
          if (m) {
            if (t.type === "income") m.income += t.amount;
            else if (t.type === "expense") m.expense += t.amount;
          }
        });

        res.status(200).json({ monthly: months });
      } catch (error) {
        console.error("Error fetching total expenses:", error);
        res.status(500).json({ message: "Server error", error: error.message });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
