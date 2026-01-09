import connectDB from "@/lib/mongodb";
import Report from "@/models/ReportSchema";
import { authenticate } from "@/utils/backend/authMiddleware";
import { startOfMonth, endOfMonth } from "date-fns";

export default async function handler(req, res) {
    await connectDB();
    const userId = authenticate(req);

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    // GET: Fetch report details
    if (req.method === "GET") {
        try {
            const { month, year } = req.query;

            if (!month || !year) {
                return res.status(400).json({ message: "Month and Year are required." });
            }


            // Calculate Global Monthly Usage (Current Calendar Month)
            const now = new Date();
            const startOfCurrentMonth = startOfMonth(now);
            const endOfCurrentMonth = endOfMonth(now);

            const allReportsThisMonth = await Report.find({
                userId,
                "versions.createdAt": { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth }
            });

            const totalGenerationsThisMonth = allReportsThisMonth.reduce((count, doc) => {
                const versionsInMonth = doc.versions.filter(v =>
                    v.createdAt >= startOfCurrentMonth && v.createdAt <= endOfCurrentMonth
                );
                return count + versionsInMonth.length;
            }, 0);

            const usageStats = {
                used: totalGenerationsThisMonth,
                limit: 3
            };

            const report = await Report.findOne({ userId, month, year });

            if (!report) {
                // Return usageStats even if report is null
                return res.status(200).json({ report: null, usageStats });
            }

            res.status(200).json({ report, usageStats });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error fetching report" });
        }
    }

    // PUT: Update selected version
    else if (req.method === "PUT") {
        try {
            const { reportId, selectedVersionIndex } = req.body;

            const report = await Report.findOneAndUpdate(
                { _id: reportId, userId },
                { selectedVersionIndex },
                { new: true }
            );

            if (!report) {
                return res.status(404).json({ message: "Report not found" });
            }

            res.status(200).json({ report });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error updating report version" });
        }
    } else {
        res.setHeader("Allow", ["GET", "PUT"]);
        res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
}
