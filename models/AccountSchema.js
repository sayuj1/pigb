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
    if (!account) return next();

    const Transaction = mongoose.model("Transaction");

    // Step 1: Fetch transaction IDs for this account
    const transactionIds = await Transaction.find({ accountId: account._id }).select("_id");

    // Step 2: Delete each transaction using findOneAndDelete to trigger middleware
    for (const tx of transactionIds) {
      await Transaction.findOneAndDelete({ _id: tx._id });
    }

    next();
  } catch (error) {
    next(error);
  }
});


const Account =
  mongoose.models.Account || mongoose.model("Account", AccountSchema);
export default Account;
