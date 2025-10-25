import { delAllWithPrefix, delCache } from "@/lib/useCache";
import connectDB from "../../../lib/mongodb";
import Savings from "@/models/SavingsSchema";
import SavingsTransaction from "@/models/SavingsTransactionSchema";
import Transaction from "@/models/TransactionSchema";
import { authenticate } from "@/utils/backend/authMiddleware";
import { handleCreateSavings, handleDeleteSavings } from "@/services/savingsService";
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
        const savings = await handleCreateSavings(userId, req.body);
        res.status(201).json({
          message: "Savings account created successfully",
          savings,
        });
      } catch (error) {
        handleApiError(res, error, "Error creating savings account");
      }
      break;

    case "GET":
      try {
        const savingsAccounts = await Savings.find({ userId });

        if (!savingsAccounts || savingsAccounts.length === 0) {
          return res
            .status(200)
            .json({ message: "No savings accounts found for this user" });
        }

        return res.status(200).json(savingsAccounts);
      } catch (error) {
        console.error("Error fetching savings accounts:", error);
        res.status(500).json({ message: "Server error", error: error.message });
      }
      break;
    // ✅ Edit Savings Account
    case "PUT":
      try {
        const { id } = req.query;
        const { accountName, savingsType, amount } = req.body;

        if (!accountName || !savingsType || amount === undefined) {
          return res.status(400).json({
            message: "Account name, savings type, and amount are required",
          });
        }

        // Fetch existing savings account
        const existingSavings = await Savings.findById(id);
        if (!existingSavings) {
          return res.status(404).json({ message: "Savings account not found" });
        }

        // ✅ Ensure only the owner can edit or delete
        if (existingSavings.userId.toString() !== userId) {
          return res
            .status(403)
            .json({ message: "Forbidden: You cannot modify this record" });
        }

        // If the amount is changed, adjust the running balance accordingly
        const difference = amount - existingSavings.amount;
        existingSavings.amount = amount;
        existingSavings.savingsType = savingsType;
        existingSavings.accountName = accountName;
        existingSavings.runningBalance += difference;

        await existingSavings.save();

        res.status(200).json({
          message: "Savings account updated successfully",
          savings: existingSavings,
        });
      } catch (error) {
        console.error("Error updating savings account:", error);
        res.status(500).json({ message: "Server error", error: error.message });
      }
      break;

    case "DELETE":
      try {
        const resp = await handleDeleteSavings(userId, req.query?.id);
        res.status(200).json(resp);

      } catch (error) {
        console.error("Error deleting savings account:", error);
        handleApiError(res, error, "Failed to delete savings account");
      }

    default:
      res.setHeader("Allow", ["GET", "POST", "DELETE", "PUT"]);
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
