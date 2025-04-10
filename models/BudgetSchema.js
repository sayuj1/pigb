import mongoose from "mongoose";
import Transaction from "./TransactionSchema"; // Make sure this is correctly imported

const BudgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  budgetName: { type: String, trim: true }, // 🆕 Optional name for budget
  category: { type: String, required: true, trim: true },
  limitAmount: { type: Number, required: true },
  spentAmount: { type: Number, default: 0 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  transactions: [
    {
      transactionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
        required: true,
      },
      date: { type: Date, required: true },
      amount: { type: Number, required: true },
      description: { type: String, trim: true },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

// Ensure only one budget exists for a given user, category, and time range
BudgetSchema.index(
  { userId: 1, category: 1, startDate: 1, endDate: 1 },
  { unique: true }
);

// Auto-update spentAmount before saving
BudgetSchema.pre("save", function (next) {
  this.spentAmount = this.transactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  );
  next();
});

BudgetSchema.statics.createBudget = async function (
  userId,
  category,
  startDate,
  endDate,
  limitAmount,
  budgetName = ""
) {
  const existingBudget = await this.findOne({
    userId,
    category,
    $or: [{ startDate: { $lte: endDate }, endDate: { $gte: startDate } }],
  });

  if (existingBudget) {
    throw new Error(
      "A budget for this category already exists in the selected time period."
    );
  }

  const newBudget = new this({
    userId,
    category,
    startDate,
    endDate,
    limitAmount,
    budgetName,
  });

  const existingTransactions = await Transaction.find({
    userId,
    category,
    date: { $gte: startDate, $lte: endDate },
  });

  for (const transaction of existingTransactions) {
    newBudget.transactions.push({
      transactionId: transaction._id,
      date: transaction.date,
      amount: transaction.amount,
      description: transaction.description,
    });
  }

  await newBudget.save();
  return newBudget;
};

// Static method to add an expense to the correct budget
BudgetSchema.statics.addExpense = async function (
  userId,
  category,
  expenseDate,
  amount,
  transactionId,
  description = ""
) {
  // Find the matching budget for this expense date
  const budget = await this.findOne({
    userId,
    category,
    startDate: { $lte: expenseDate },
    endDate: { $gte: expenseDate },
  });

  if (!budget) {
    // throw new Error("No matching budget found for this expense.");
    return;
  }

  // Add expense to transactions
  budget.transactions.push({
    transactionId,
    date: expenseDate,
    amount,
    description,
  });

  // Save and return updated budget
  await budget.save();
  return budget;
};

// Static method to remove an expense from a budget when a transaction is deleted
BudgetSchema.statics.removeExpense = async function (transactionId) {
  // Find the budget that contains this transaction
  const budget = await this.findOneAndUpdate(
    { "transactions.transactionId": transactionId },
    { $pull: { transactions: { transactionId } } }, // Remove the matching transaction
    { new: true }
  );

  if (budget) {
    await budget.save();
  }
  return budget;
};

// Static method to update an expense amount in a budget when a transaction is updated
BudgetSchema.statics.updateExpenseAmount = async function (
  transactionId,
  newAmount
) {
  // Find the budget containing the transaction
  const budget = await this.findOne({
    "transactions.transactionId": transactionId,
  });

  if (!budget) return; // No matching budget found

  // Find the transaction inside the budget
  const transaction = budget.transactions.find(
    (txn) => txn.transactionId.toString() === transactionId.toString()
  );

  if (!transaction) return;

  // Update the transaction amount
  transaction.amount = newAmount;

  // Recalculate spentAmount before saving
  budget.spentAmount = budget.transactions.reduce(
    (sum, txn) => sum + txn.amount,
    0
  );

  await budget.save();
  return budget;
};

export default mongoose.models.Budget || mongoose.model("Budget", BudgetSchema);
