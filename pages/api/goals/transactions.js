import connectDB from "@/lib/mongodb";
import { authenticate } from "@/utils/backend/authMiddleware";
import { handleAddMoneyToGoal, handleGetGoalHistory } from "@/services/goalTransactionService";
import { handleApiError } from "@/lib/errors";

export default async function handler(req, res) {
    await connectDB();
    const userId = authenticate(req);

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const { goalId } = req.query;

    switch (req.method) {
        case "GET":
            try {
                const history = await handleGetGoalHistory(userId, goalId);
                res.status(200).json(history);
            } catch (error) {
                handleApiError(res, error, "Error fetching goal history");
            }
            break;

        case "POST":
            try {
                const result = await handleAddMoneyToGoal(userId, goalId, req.body);
                res.status(201).json({
                    message: "Money added successfully",
                    ...result,
                });
            } catch (error) {
                handleApiError(res, error, "Error adding money to goal");
            }
            break;

        default:
            res.setHeader("Allow", ["GET", "POST"]);
            res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
}
