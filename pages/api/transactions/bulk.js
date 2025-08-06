import connectDB from "../../../lib/mongodb";
import { authenticate } from "@/utils/backend/authMiddleware";
import { handleCreateTransaction } from "@/services/transactionService";
import { handleApiError } from "@/lib/errors";

export default async function handler(req, res) {
  await connectDB();

  const userId = authenticate(req);

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  switch (req.method) {
    case "POST":
      try {
        const transactions = req.body?.transactions;
        for (const transaction of transactions) {
          await handleCreateTransaction(userId, transaction);
        }
        res.status(201).json({
          message: "Transactions Imported successfully!",
        });

      } catch (error) {
        handleApiError(res, error, "Error adding transaction");
      }
      break;

    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
