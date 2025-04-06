import mongoose from "mongoose";
import Transaction from "./TransactionSchema.js";

const AccountSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true
  },
  name: { type: String, required: true },
  type: { type: String, required: true },
  initialBalance: {
    type: Number,
    default: 0,
  },
  balance: { type: Number, default: 0 }, // For regular accounts, this is the balance
  creditLimit: { type: Number, default: 5000 }, // Default credit limit for credit card
  creditUsed: { type: Number, default: 0 }, // Track usage of the credit limit
  icon: { type: String, required: true }, // Stores Ant Design icon name (e.g., "BankOutlined")
  color: {type: String, required: true},
  dueDate: {
    type: Date,
    validate: {
      validator: function (value) {
        return this.type !== "credit card" || value !== undefined;
      },
      message: "dueDate is required for credit card accounts.",
    },
  },
  createdAt: { type: Date, default: Date.now },
});

// Middleware to delete transactions when an account is deleted
AccountSchema.pre("findOneAndDelete", async function (next) {
  try {
    const account = await this.model.findOne(this.getQuery());
    if (account) {
      await Transaction.deleteMany({ accountId: account._id });
    }
    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.models.Account || mongoose.model("Account", AccountSchema);
