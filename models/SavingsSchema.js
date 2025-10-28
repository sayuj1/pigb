import mongoose from "mongoose";

// Savings Schema
const SavingsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  accountName: { type: String, required: true }, // User-defined name for the savings account
  savingsType: { type: String, required: true }, // Type of savings (e.g., PPF, Mutual Funds, Gold)
  amount: { type: Number, required: true }, // Initial amount of the savings
  runningBalance: { type: Number, default: 0 }, // Running balance, calculated dynamically
  createdAt: { type: Date, default: Date.now }, // Date when the savings account was created
  status: { type: String, enum: ["active", "closed"], default: "active" },
  closedAt: { type: Date, default: null }, // Date when the savings account was closed
});

export default mongoose.models.Savings ||
  mongoose.model("Savings", SavingsSchema);
