import connectDB from "../../../lib/mongodb";
import Savings from "@/models/SavingsSchema";
import { authenticate } from "@/utils/backend/authMiddleware";
import { handleCloseSavingsAccount, handleCreateSavings, handleDeleteSavings, handleUpdateSavings } from "@/services/savingsService";
import { handleApiError } from "@/lib/errors";
import { buildQuery } from "@/utils/backend/buildQuery";

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
        // Build query dynamically
        const { filters, sort, skip, limit } = buildQuery(
          req.query,
          userId,
          ["accountName", "savingsType"] // searchable fields
        );

        // Run parallel queries
        const [data, total] = await Promise.all([
          Savings.find(filters).sort(sort).skip(skip).limit(limit),
          Savings.countDocuments(filters),
        ]);

        res.status(200).json({
          total,
          page: Number(req.query.page || 1),
          totalPages: Math.ceil(total / limit),
          savingsAccounts: data,
        });
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
    case "PATCH":
      try {

        const result = await handleCloseSavingsAccount(userId, req.query, req.body);
        return res.status(200).json(result);

      } catch (error) {
        handleApiError(res, error, "Error closing savings account");
      }
      break;
    default:
      res.setHeader("Allow", ["GET", "POST", "DELETE", "PUT", "PATCH"]);
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
