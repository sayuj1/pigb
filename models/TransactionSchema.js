import { updateAccountBalance } from "@/utils/backend/transactionUtils";
import mongoose from "mongoose";

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
  source: { type: String, default: null },
});

// Middleware to update account balance when a transaction is created
TransactionSchema.post("save", async function (doc) {
  await updateAccountBalance(doc);
});

TransactionSchema.post("findOneAndDelete", async function (doc) {
  if (!doc) return;

  try {
    // Lazy get Account model by name to avoid circular import
    const Account = mongoose.model("Account");
    const Budget = mongoose.model("Budget");

    const account = await Account.findById(doc.accountId);
    if (!account) return;

    if (doc.type === "expense") {
      await Budget.removeExpense(doc._id);
    }

    if (account.type === "credit card") {
      if (doc.type === "expense") {
        account.creditUsed -= doc.amount;
      } else if (doc.type === "income") {
        account.creditUsed = Math.max(0, account.creditUsed - doc.amount);
      }
    } else {
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

const Transaction =
  mongoose.models.Transaction ||
  mongoose.model("Transaction", TransactionSchema);

export default Transaction;
