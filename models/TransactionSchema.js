import mongoose from "mongoose";
import Account from "./AccountSchema.js";
import Budget from "./BudgetSchema.js";
import { updateAccountBalance } from "@/utils/backend/updateAccountBalance";

const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true,
  },
  type: { type: String, enum: ["income", "expense"], required: true },
  category: { type: String, required: true }, // Example: Salary, Food, Rent
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  description: { type: String },
});

// Middleware to update account balance when a transaction is created
TransactionSchema.post("save", async function (doc) {
  await updateAccountBalance(doc);
});

TransactionSchema.post("findOneAndDelete", async function (doc) {
  if (!doc) return;

  try {
    const account = await Account.findById(doc.accountId);
    if (!account) return;

    if (doc.type === "expense") {
      const budget = await Budget.findOne({
        userId: doc.userId,
        category: doc.category,
        startDate: { $lte: doc.date },
        endDate: { $gte: doc.date },
      });

      if (budget) {
        // Remove transaction using transactionId
        budget.transactions = budget.transactions.filter(
          (transaction) =>
            transaction.transactionId.toString() !== doc._id.toString()
        );

        await budget.save();
      }
    }

    if (account.type === "credit card") {
      // Reverse the impact of the transaction on credit usage
      if (doc.type === "expense") {
        account.creditUsed -= doc.amount;
      } else if (doc.type === "income") {
        account.creditUsed = Math.max(0, account.creditUsed - doc.amount);
      }
    } else {
      // Reverse the impact of the transaction on balance
      if (doc.type === "income") {
        account.balance -= doc.amount;
      } else if (doc.type === "expense") {
        account.balance += doc.amount;
      }
    }

    await account.save();
  } catch (error) {
    console.error("Error updating balance on transaction delete:", error);
  }
});

export default mongoose.models.Transaction ||
  mongoose.model("Transaction", TransactionSchema);
