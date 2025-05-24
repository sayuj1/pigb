import mongoose from "mongoose";

const BillSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true,
  }, // Linked account
  name: { type: String, required: true }, // Example: Electricity, Internet, Rent
  amount: { type: Number, required: true }, // Bill amount
  dueDate: { type: Date, required: true }, // Due date for the bill
  isRecurring: { type: Boolean, default: false }, // Whether the bill is recurring
  frequency: {
    type: String,
    required: function () {
      return this.isRecurring;
    },
  }, // Required if recurring
  status: {
    type: String,
    enum: ["unpaid", "paid", "cancelled"],
    default: "unpaid",
  }, // Payment status
  transactionIds: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" },
  ], // Array of transaction IDs
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Bill || mongoose.model("Bill", BillSchema);
