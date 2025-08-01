import { authenticate } from "@/utils/backend/authMiddleware";
import connectDB from "@/lib/mongodb";
import Savings from "@/models/SavingsSchema";
import mongoose from "mongoose";

export default async function handler(req, res) {
    await connectDB();
    const userId = authenticate(req);

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    switch (req.method) {
        case "GET":
            try {
                const totalSavings = await Savings.aggregate([
                    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: "$runningBalance" },
                        },
                    },
                ]);

                const total = totalSavings[0]?.total || 0;

                res.status(200).json({ totalSavings: total });
            } catch (error) {
                console.error("Error fetching total savings:", error);
                res.status(500).json({ message: "Server error", error: error.message });
            }
            break;

        default:
            res.setHeader("Allow", ["GET"]);
            res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
}
