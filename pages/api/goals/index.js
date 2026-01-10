import connectDB from "@/lib/mongodb";
import { authenticate } from "@/utils/backend/authMiddleware";
import { handleCreateGoal, handleGetGoals } from "@/services/goalService";
import { handleApiError } from "@/lib/errors";

export default async function handler(req, res) {
    await connectDB();
    const userId = authenticate(req);

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    switch (req.method) {
        case "GET":
            try {
                const { search, category, status, page, limit } = req.query;
                const data = await handleGetGoals(userId, { search, category, status, page, limit });
                res.status(200).json(data);
            } catch (error) {
                handleApiError(res, error, "Error fetching goals");
            }
            break;

        case "POST":
            try {
                const goal = await handleCreateGoal(userId, req.body);
                res.status(201).json({
                    message: "Goal created successfully",
                    goal,
                });
            } catch (error) {
                handleApiError(res, error, "Error creating goal");
            }
            break;

        default:
            res.setHeader("Allow", ["GET", "POST"]);
            res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
}
