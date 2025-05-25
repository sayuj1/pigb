import { authenticate } from "@/utils/backend/authMiddleware";
import connectDB from "../../../lib/mongodb";
import Bill from "@/models/BillsSchema";
import { addDays } from "date-fns";

export default async function handler(req, res) {
  await connectDB();

  const userId = authenticate(req);

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  switch (req.method) {
    case "GET":
      try {
        const today = new Date();
        const in7 = addDays(today, 7);

        const count = await Bill.countDocuments({
          userId,
          status: "unpaid",
          dueDate: { $gte: today, $lte: in7 },
        });

        res.status(200).json({ count });
      } catch (error) {
        console.error("Error fetching upcoming bills:", error);
        res.status(500).json({ message: "Server error", error: error.message });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
