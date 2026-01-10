import connectDB from "@/lib/mongodb";
import { authenticate } from "@/utils/backend/authMiddleware";
import { handleUpdateGoal, handleDeleteGoal } from "@/services/goalService";
import { handleApiError } from "@/lib/errors";

export default async function handler(req, res) {
    await connectDB();
    const userId = authenticate(req);

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.query;

    switch (req.method) {
        case "PUT":
            try {
                const goal = await handleUpdateGoal(userId, id, req.body);
                res.status(200).json({
                    message: "Goal updated successfully",
                    goal,
                });
            } catch (error) {
                handleApiError(res, error, "Error updating goal");
            }
            break;

        case "DELETE":
            try {
                const result = await handleDeleteGoal(userId, id);
                res.status(200).json(result);
            } catch (error) {
                handleApiError(res, error, "Error deleting goal");
            }
            break;

        default:
            res.setHeader("Allow", ["PUT", "DELETE"]);
            res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
}
