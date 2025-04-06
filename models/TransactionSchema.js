import mongoose from "mongoose";
import Account from "./AccountSchema.js";
import Budget from "./BudgetSchema.js";

const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
  type: { type: String, enum: ["income", "expense"], required: true },
  category: { type: String, required: true }, // Example: Salary, Food, Rent
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  description: { type: String },
});

// Middleware to update account balance when a transaction is created
TransactionSchema.post("save", async function (doc) {
  try {
    const account = await Account.findById(doc.accountId);
    if (!account) return;

    if (doc.type === "expense") {
      const budget = await Budget.findOne({
        userId: doc.userId,
        category: doc.category,
        startDate: { $lte: doc.date },
        endDate: { $gte: doc.date },
      });

      if (budget) {
        budget.transactions.push({
          transactionId: doc._id, // Store the transaction ID
          date: doc.date,
          amount: doc.amount,
          description: doc.description || "",
        });

        await budget.save();
      }
    }

    if (account.type === "credit card") {
      // If it's a credit card, check for credit usage
      if (doc.type === "expense") {
        // Ensure the credit card usage does not exceed the credit limit
        if (account.creditUsed + doc.amount > account.creditLimit) {
          console.error("Credit limit exceeded for account:", account.name);
          return; // If the credit limit is exceeded, don't allow the transaction
        }
        // Update credit usage
        account.creditUsed += doc.amount;
      } else if (doc.type === "income") {
        // Reduce credit usage on income
        account.creditUsed = Math.max(0, account.creditUsed - doc.amount);
      }
    } else {
      // If it's a regular account, update balance
      if (doc.type === "income") {
        account.balance += doc.amount;
      } else if (doc.type === "expense") {
        account.balance -= doc.amount;
      }
    }

    await account.save();
  } catch (error) {
    console.error("Error updating account balance:", error);
  }
});

TransactionSchema.post("findOneAndDelete", async function (doc) {
  if (!doc) return;

  try {
    const account = await Account.findById(doc.accountId);
    if (!account) return;

    if (doc.type === "expense") {
      const budget = await Budget.findOne({
        userId: doc.userId,
        category: doc.category,
        startDate: { $lte: doc.date },
        endDate: { $gte: doc.date },
      });

      if (budget) {
        // Remove transaction using transactionId
        budget.transactions = budget.transactions.filter(
          (transaction) => transaction.transactionId.toString() !== doc._id.toString()
        );

        await budget.save();
      }
    }

    if (account.type === "credit card") {
      // Reverse the impact of the transaction on credit usage
      if (doc.type === "expense") {
        account.creditUsed -= doc.amount;
      } else if (doc.type === "income") {
        account.creditUsed = Math.max(0, account.creditUsed - doc.amount);
      }
    } else {
      // Reverse the impact of the transaction on balance
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


export default mongoose.models.Transaction || mongoose.model("Transaction", TransactionSchema);
