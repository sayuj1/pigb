import { authenticate } from "@/utils/backend/authMiddleware";
import connectDB from "../../../lib/mongodb";
import Loan from "@/models/LoanSchema";

export default async function handler(req, res) {
  await connectDB();

  const userId = authenticate(req);

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  switch (req.method) {
    case "GET":
      try {
        const loans = await Loan.find({ userId, status: "active" }).select(
          "loanType borrowerName lenderName amount remainingBalance"
        );

        const result = loans.map((l) => {
          const paid = l.amount - (l.remainingBalance ?? l.amount);
          const name = l.loanType === "taken" ? l.borrowerName : l.lenderName;
          return {
            id: l._id,
            name,
            paid,
            remaining: l.remainingBalance,
            type: l.loanType,
          };
        });

        res.status(200).json({ loans: result });
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
