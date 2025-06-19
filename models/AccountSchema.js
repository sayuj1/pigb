import mongoose from "mongoose";

const AccountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: { type: String, required: true },
  type: { type: String, required: true },
  initialBalance: {
    type: Number,
    default: 0,
  },
  balance: { type: Number, default: 0 },
  creditLimit: { type: Number, default: 5000 },
  creditUsed: { type: Number, default: 0 },
  icon: { type: String, required: true },
  color: { type: String, required: true },
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

AccountSchema.pre("findOneAndDelete", async function (next) {
  try {
    const account = await this.model.findOne(this.getQuery());
    if (account) {
      const Transaction = mongoose.model("Transaction"); // Lazy get model by name
      await Transaction.deleteMany({ accountId: account._id });
    }
    next();
  } catch (error) {
    next(error);
  }
});

const Account =
  mongoose.models.Account || mongoose.model("Account", AccountSchema);
export default Account;
