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



const Transaction =
  mongoose.models.Transaction ||
  mongoose.model("Transaction", TransactionSchema);

export default Transaction;
