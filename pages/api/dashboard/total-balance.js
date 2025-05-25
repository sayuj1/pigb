import { authenticate } from "@/utils/backend/authMiddleware";
import connectDB from "../../../lib/mongodb";
import Account from "@/models/AccountSchema";

export default async function handler(req, res) {
  await connectDB();

  const userId = authenticate(req);

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  switch (req.method) {
    case "GET":
      try {
        const accounts = await Account.find({ userId }).select("balance");
        const totalBalance = accounts.reduce(
          (sum, a) => sum + (a.balance || 0),
          0
        );
        res.status(200).json({ totalBalance });
      } catch (error) {
        console.error("Error fetching total balance:", error);
        res.status(500).json({ message: "Server error", error: error.message });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
