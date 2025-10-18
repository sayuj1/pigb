import { updateAccountBalance } from "@/utils/backend/accountUtils";
import { addExpenseToBudget, removeExpenseFromBudget } from "@/utils/backend/budgetUtils";
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
  await updateAccountBalance(doc, "addTransaction");
  if (doc.type === "expense") {
    await addExpenseToBudget(
      doc.userId,
      doc.category,
      doc.date,
      doc.amount,
      doc._id,
      doc.description
    );
  }
});

TransactionSchema.post("findOneAndDelete", async function (doc) {
  if (!doc) return;

  try {
    await updateAccountBalance(doc, "deleteTransaction");
    if (doc.type === "expense") {
      await removeExpenseFromBudget(doc._id);
    }

  } catch (error) {
    console.error("Error updating balance on transaction delete:", error);
  }
});

const Transaction =
  mongoose.models.Transaction ||
  mongoose.model("Transaction", TransactionSchema);

export default Transaction;
