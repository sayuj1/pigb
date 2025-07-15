import { authenticate } from "@/utils/backend/authMiddleware";
import connectDB from "@/lib/mongodb";
import Transaction from "@/models/TransactionSchema";
import { subMonths, startOfMonth, endOfMonth, format, parseISO, addMonths, isAfter } from "date-fns";

export default async function handler(req, res) {
  await connectDB();

  const userId = authenticate(req);
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  switch (req.method) {
    case "GET":
      try {
        // Parse start and end date from query
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
          return res.status(400).json({ message: "startDate and endDate are required" });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isAfter(start, end)) {
          return res.status(400).json({ message: "startDate must be before endDate" });
        }

        // Fetch transactions in range
        const txns = await Transaction.find({
          userId,
          date: { $gte: start, $lte: end },
        }).select("amount type date");

        // Prepare monthly buckets
        const months = [];
        let d = start;
        while (!isAfter(d, end)) {
          months.push({ month: format(d, "MMM yyyy"), income: 0, expense: 0 });
          d = addMonths(d, 1);
        }

        // Aggregate data
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
        console.error("Error fetching transactions:", error);
        res.status(500).json({ message: "Server error", error: error.message });
      }
      break;

    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
