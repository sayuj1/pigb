import connectDB from "../../../lib/mongodb";
import Transaction from "../../../models/TransactionSchema";
import Account from "@/models/AccountSchema";
import Budget from "@/models/BudgetSchema";
import { authenticate } from "@/utils/backend/authMiddleware";
import { updateAccountBalance } from "@/utils/backend/accountHelper";

export default async function handler(req, res) {
  await connectDB();

  const userId = authenticate(req);

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  switch (req.method) {
    case "POST":
      try {
        console.log("user id ", userId);
        const body = req.body?.transactions;

        const isBulk = Array.isArray(body);
        const transactionsToInsert = [];
        console.log("isBulk ", isBulk);
        if (isBulk) {
          for (const tx of body) {
            const { accountId, type, category, amount, billDate, description } =
              tx;

            if (!accountId || !type || !category || !amount) {
              return res.status(400).json({
                message: "Missing required fields in one of the transactions",
              });
            }

            const newTransaction = new Transaction({
              userId,
              accountId,
              type,
              category,
              amount,
              date: billDate || Date.now(),
              description,
            });

            transactionsToInsert.push(newTransaction);
          }

          // Save all transactions
          const savedTransactions = await Transaction.insertMany(
            transactionsToInsert
          );

          for (const tx of savedTransactions) {
            await updateAccountBalance(tx);
          }

          // ✅ Add expenses to Budget if applicable
          for (const transaction of savedTransactions) {
            if (transaction.type === "expense") {
              await Budget.addExpense(
                userId,
                transaction.category,
                transaction.date,
                transaction.amount,
                transaction._id,
                transaction.description
              );
            }
          }

          res.status(201).json({
            message: "Bulk transactions added successfully",
            transactions: savedTransactions,
          });
        } else {
          // Single transaction fallback (existing logic)
          const {
            accountId,
            type,
            category,
            amount,
            billDate: date,
            description,
          } = body;

          if (!accountId || !type || !category || !amount) {
            return res.status(400).json({ message: "Missing required fields" });
          }

          const transaction = new Transaction({
            userId,
            accountId,
            type,
            category,
            amount,
            date: date || Date.now(),
            description,
          });
          console.log("saving transaction");
          await transaction.save();

          if (type === "expense") {
            await Budget.addExpense(
              userId,
              category,
              transaction.date,
              transaction.amount,
              transaction._id,
              transaction.description
            );
          }

          res
            .status(201)
            .json({ message: "Transaction added successfully", transaction });
        }
      } catch (error) {
        console.log("error ", error);
        console.error("Error adding transaction(s):", error);
        res.status(500).json({ message: "Server error", error: error.message });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
