import mongoose from "mongoose";
import { authenticate } from "@/utils/backend/authMiddleware";
import connectDB from "@/lib/mongodb";
import Transaction from "@/models/TransactionSchema";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";


dayjs.extend(utc);
// dayjs.extend(timezone);

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

        // //Step 2: Process into monthly map
        const monthlyMap = {};

        transactions.forEach((tx) => {

          const monthKey = dayjs.utc(tx.date).tz("Asia/Kolkata").format("MMM YYYY");
          //dayjs(tx.date).format("MMM YYYY"); //date.toLocaleString("default", { month: "short" }) + " " + date.
          console.log("monthKey", tx.date, tx.amount, tx.type);
          if (!monthlyMap[monthKey]) {
            monthlyMap[monthKey] = { income: 0, expense: 0 };
          }

          monthlyMap[monthKey][tx.type] += tx.amount;
        });

        // // Step 3: Convert map to sorted array
        // const monthly = Object.entries(monthlyMap)
        //   .map(([month, data]) => ({ month, ...data }))
        //   .sort((a, b) => {
        //     const getDate = (str) => new Date(`1 ${str}`);
        //     return getDate(a.month) - getDate(b.month);
        //   });
        // const monthlyMap = {};
        // transactions.forEach((tx) => {
        //   const monthKey = tx.date//dayjs(tx.date).utc().format('DD MMM YYYY')//tx.date.toISOString()//dayjs(tx.date).utc().format("MMM YYYY");
        //   console.log("monthKey", new Date(tx.date).toLocaleDateString("en-GB", {
        //     // day: "2-digit",
        //     month: "short",
        //     year: "numeric",
        //   }), tx.date, tx.amount, tx.type);
        //   if (!monthlyMap[monthKey]) {
        //     monthlyMap[monthKey] = { income: 0, expense: 0 };
        //   }
        //   monthlyMap[monthKey][tx.type] += tx.amount;
        // });

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
