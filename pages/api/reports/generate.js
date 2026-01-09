import connectDB from "@/lib/mongodb";
import Transaction from "@/models/TransactionSchema";
import Report from "@/models/ReportSchema";
import { authenticate } from "@/utils/backend/authMiddleware";
import { generateFinancialReport } from "@/services/aiService";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }

    try {
        await connectDB();
        const userId = authenticate(req);

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Default to previous month if not specified
        let { month, year } = req.body;
        let startDate, endDate;

        if (month && year) {
            // Note: month is 0-indexed in Date, but assuming 1-indexed from client or handling carefully
            // Let's rely on date-fns for robust handling if we pass an ISO date string or specific params
            // For simplicity, let's assume body passes specific ISO strings or we calculate 'last month'
            const date = new Date(year, month - 1);
            startDate = startOfMonth(date);
            endDate = endOfMonth(date);
        } else {
            // Default to last month
            const today = new Date();
            const lastMonth = subMonths(today, 1);
            startDate = startOfMonth(lastMonth);
            endDate = endOfMonth(lastMonth);
        }

        // Check global monthly limit (3 generations per calendar month)
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

        if (totalGenerationsThisMonth >= 3) {
            return res.status(400).json({
                message: "You have reached your global limit of 3 AI reports for this month."
            });
        }

        // Fetch transactions

        const transactions = await Transaction.find({
            userId,
            date: { $gte: startDate, $lte: endDate },
        }).sort({ date: 1 });

        if (!transactions || transactions.length === 0) {
            return res.status(400).json({
                message: "No transactions found for this period to analyze."
            });
        }


        // Check for existing report
        // We need consistent month/year from startDate, which is derived from input or default
        const targetMonth = startDate.getMonth() + 1; // 1-12
        const targetYear = startDate.getFullYear();

        let reportDoc = await Report.findOne({ userId, month: targetMonth, year: targetYear });

        if (reportDoc) {
            if (reportDoc.versions.length >= 3) {
                return res.status(400).json({
                    message: "Maximum revisions (3) reached for this month. Please use an existing version."
                });
            }
        }

        // Initialize report version with 'generating' status
        let newVersionIndex;

        if (reportDoc) {
            reportDoc.versions.push({
                content: "",
                status: "generating"
            });
            newVersionIndex = reportDoc.versions.length - 1;
            reportDoc.selectedVersionIndex = newVersionIndex;
            await reportDoc.save();
        } else {
            reportDoc = await Report.create({
                userId,
                month: targetMonth,
                year: targetYear,
                versions: [{
                    content: "",
                    status: "generating"
                }],
                selectedVersionIndex: 0
            });
            newVersionIndex = 0;
        }

        try {
            // Generate Report
            const reportContent = await generateFinancialReport(
                transactions,
                format(startDate, 'yyyy-MM-dd'),
                format(endDate, 'yyyy-MM-dd')
            );

            // Update with content and completed status
            // Re-fetch to ensure we have latest version of document if needed, 
            // but since we are in same request and mongo is consistent for single doc updates usually ok.
            // But good to be safe if we want to handle concurrent weirdness, though here we likely hold the lock logically.
            // We can just update the object we have and save.

            reportDoc.versions[newVersionIndex].content = reportContent;
            reportDoc.versions[newVersionIndex].status = "completed";
            await reportDoc.save();

            res.status(200).json({ report: reportDoc });

        } catch (error) {
            // Update status to failed
            reportDoc.versions[newVersionIndex].status = "failed";
            reportDoc.versions[newVersionIndex].content = "Report generation failed. Please try again.";
            await reportDoc.save();

            throw error; // Re-throw to be caught by outer catch for logging/response
        }

    } catch (error) {
        console.error("Report Generation Error:", error);
        res.status(500).json({
            message: "An error occurred while generating the report.",
            error: error.message
        });
    }
}
