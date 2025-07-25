import mongoose from "mongoose";

// Savings Transaction Schema
const SavingsTransactionSchema = new mongoose.Schema({
  savingsId: { type: mongoose.Schema.Types.ObjectId, ref: "Savings", required: true },
  date: { type: Date, required: true },
  amount: { type: Number, required: true }, // Amount deposited, withdrawn, or adjusted
  type: { type: String, enum: ["deposit", "interest", "withdrawal"], required: true },
  description: { type: String, trim: true }, // Optional description of the transaction
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: false, // Optional, can be null for interest transactions
  },
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transaction",
    required: false, // Optional, can be null if not linked to a transaction
  },
});

export default mongoose.models.SavingsTransaction || mongoose.model("SavingsTransaction", SavingsTransactionSchema);