import connectDB from "../../../lib/mongodb";
import Savings from "@/models/SavingsSchema";
import { authenticate } from "@/utils/backend/authMiddleware";
import { handleCreateSavings, handleDeleteSavings, handleUpdateSavings } from "@/services/savingsService";
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
    case "PUT":
      try {
        const savings = await handleUpdateSavings(userId, req.query?.id, req.body);
        res.status(200).json({
          message: "Savings account updated successfully",
          savings,
        });
      } catch (error) {
        handleApiError(res, error, "Error updating savings account");
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
      break;
    default:
      res.setHeader("Allow", ["GET", "POST", "DELETE", "PUT"]);
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
