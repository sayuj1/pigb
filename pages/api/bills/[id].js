import connectDB from "../../../lib/mongodb";
import Bill from "@/models/BillsSchema";
import Transaction from "../../../models/TransactionSchema";
import { authenticate } from "@/utils/backend/authMiddleware";

export default async function handler(req, res) {
  await connectDB();

  const userId = authenticate(req);

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  switch (req.method) {
    case "GET":
      // Fetch Transactions for a Particular Bill
      try {
        const { id } = req.query; // Bill ID passed in query parameters
        console.log("id ", id);

        if (!id) {
          return res.status(400).json({ message: "Bill ID is required" });
        }

        // Fetch the bill based on id
        const bill = await Bill.findById({ _id: id, userId });
        if (!bill) {
          return res.status(404).json({ message: "Bill not found" });
        }

        // Fetch the transactions related to this bill
        const transactions = await Transaction.find({
          _id: { $in: bill.transactionIds }, // Fetch transactions that exist in the transactionIds array of the bill
        });

        res.status(200).json({
          message: "Transactions fetched successfully",
          transactions,
        });
      } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ message: "Server error", error: error.message });
      }
      break;

    default:
      res.status(405).json({ message: "Method Not Allowed" });
      break;
  }
}
