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
    case "POST": {
      const {
        loanType,
        borrowerName,
        lenderName,
        loanCategory,
        amount,
        interestRate,
        tenureMonths,
        startDate,
        endDate,
      } = req.body;

      if (!loanType || !["taken", "given"].includes(loanType)) {
        return res.status(400).json({ error: "Invalid loan type" });
      }

      if (
        !loanCategory ||
        !["personal", "business", "home", "car", "education", "other"].includes(
          loanCategory
        )
      ) {
        return res.status(400).json({ error: "Invalid loan category" });
      }

      if (loanType === "taken" && !borrowerName) {
        return res
          .status(400)
          .json({ error: "Borrower name is required for taken loans" });
      }

      if (loanType === "given" && !lenderName) {
        return res
          .status(400)
          .json({ error: "Lender name is required for given loans" });
      }

      try {
        const newLoan = new Loan({
          userId,
          loanType,
          borrowerName,
          lenderName,
          loanCategory,
          amount,
          interestRate,
          tenureMonths,
          startDate,
          endDate,
        });

        await newLoan.save();
        res.status(201).json(newLoan);
      } catch (error) {
        res.status(500).json({ error: "Failed to create loan" });
      }
      break;
    }

    case "PUT": {
      try {
        const { id } = req.query;
        const {
          loanType,
          borrowerName,
          lenderName,
          loanCategory,
          amount,
          interestRate,
          tenureMonths,
          startDate,
          endDate,
        } = req.body;

        const loan = await Loan.findOne({ _id: id, userId });
        if (!loan) return res.status(404).json({ message: "Loan not found" });

        // Update loan fields
        if (loanType !== undefined) loan.loanType = loanType;
        if (borrowerName !== undefined) loan.borrowerName = borrowerName;
        if (lenderName !== undefined) loan.lenderName = lenderName;
        if (loanCategory !== undefined) loan.loanCategory = loanCategory;
        if (amount !== undefined) loan.amount = amount;
        if (interestRate !== undefined) loan.interestRate = interestRate;
        if (tenureMonths !== undefined) loan.tenureMonths = tenureMonths;
        if (startDate !== undefined) loan.startDate = startDate;
        if (endDate !== undefined) loan.endDate = endDate;

        await loan.save();
        res.status(200).json(loan);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
      break;
    }

    case "DELETE": {
      try {
        const { id } = req.query;
        const loan = await Loan.findOneAndDelete({ _id: id, userId });

        if (!loan) return res.status(404).json({ message: "Loan not found" });

        res.status(200).json({ message: "Loan deleted successfully" });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
      break;
    }

    case "GET": {
      try {
        let {
          page = 1,
          limit = 10,
          sort = "-createdAt",
          search = "",
        } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);

        const query = { userId };

        if (search) {
          query.$or = [
            { borrowerName: { $regex: search, $options: "i" } },
            { lenderName: { $regex: search, $options: "i" } },
          ];
        }

        const totalLoans = await Loan.countDocuments(query);
        const loans = await Loan.find(query)
          .sort(sort)
          .skip((page - 1) * limit)
          .limit(limit);

        res.status(200).json({
          loans,
          pagination: {
            totalLoans,
            currentPage: page,
            totalPages: Math.ceil(totalLoans / limit),
          },
        });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
      break;
    }

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
