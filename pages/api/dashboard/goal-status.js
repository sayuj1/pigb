import { authenticate } from "@/utils/backend/authMiddleware";
import connectDB from "../../../lib/mongodb";
import Goal from "@/models/GoalSchema";
import dayjs from "dayjs";

export default async function handler(req, res) {
    await connectDB();

    const userId = authenticate(req);

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    switch (req.method) {
        case "GET":
            try {
                const goals = await Goal.find({ userId });

                const summary = {
                    totalGoals: goals.length,
                    completedGoals: goals.filter(g => g.status === "completed").length,
                    pendingGoals: goals.filter(g => g.status === "pending").length,
                    totalTargetAmount: goals.reduce((sum, g) => sum + g.targetAmount, 0),
                    totalCurrentAmount: goals.reduce((sum, g) => sum + g.currentAmount, 0),
                    nearingDeadline: goals.filter(g => {
                        const daysLeft = dayjs(g.deadline).diff(dayjs(), 'day');
                        return g.status === 'pending' && daysLeft >= 0 && daysLeft <= 7;
                    }).length,
                    overdue: goals.filter(g => {
                        return g.status === 'pending' && dayjs(g.deadline).isBefore(dayjs(), 'day');
                    }).length
                };

                res.status(200).json(summary);
            } catch (error) {
                console.error("Error fetching goal status:", error);
                res.status(500).json({ message: "Server error", error: error.message });
            }
            break;

        default:
            res.setHeader("Allow", ["GET"]);
            res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
}
