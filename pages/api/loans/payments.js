import connectDB from "../../../lib/mongodb";
import { authenticate } from "@/utils/backend/authMiddleware";
import Loan from "@/models/LoanSchema";

export default async function handler(req, res) {
  await connectDB();

  const userId = authenticate(req);

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  switch (req.method) {
    case "POST":
      try {
        const { loanId } = req.query;
        const { amount, date } = req.body;

        if (!amount || amount <= 0) {
          return res.status(400).json({ message: "Invalid payment amount" });
        }

        const loan = await Loan.findOne({ _id: loanId, userId });
        if (!loan) return res.status(404).json({ message: "Loan not found" });

        // Add payment
        loan.payments.push({
          amount,
          date: date ? new Date(date) : new Date(),
        });

        loan.updateEMI();
        await loan.save();

        res.status(201).json(loan);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
      break;

    case "DELETE":
      try {
        const { loanId, paymentId } = req.query;

        const loan = await Loan.findOne({ _id: loanId, userId });
        if (!loan) return res.status(404).json({ message: "Loan not found" });

        loan.payments = loan.payments.filter(
          (p) => p._id.toString() !== paymentId
        );

        await loan.save();

        res.status(200).json(loan);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
      break;

    case "PUT":
      try {
        const { loanId, paymentId } = req.query;
        const { amount, date } = req.body;

        if (!amount || amount <= 0) {
          return res.status(400).json({ message: "Invalid payment amount" });
        }

        const loan = await Loan.findOne({ _id: loanId, userId });
        if (!loan) return res.status(404).json({ message: "Loan not found" });

        const payment = loan.payments.id(paymentId);
        if (!payment)
          return res.status(404).json({ message: "Payment not found" });

        payment.amount = amount;
        if (date) {
          payment.date = new Date(date);
        }

        loan.updateEMI();
        await loan.save();

        res.status(200).json(loan);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
