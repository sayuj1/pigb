import connectDB from '../../../lib/mongodb';
import Account from "@/models/AccountSchema";
import TransactionSchema from '@/models/TransactionSchema';
import { authenticate } from "@/utils/backend/authMiddleware";

export default async function handler(req, res) {
    await connectDB();

    const userId = authenticate(req);

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    switch (req.method) {
        case "GET":
            try {
                const accounts = await Account.find({
                    $or: [{ userId }],
                });

                res.status(200).json({ message: "Accounts fetched successfully.", accounts });
            } catch (error) {
                res.status(500).json({ message: "Server error", error: error.message });
            }
            break;

        case "POST":
            try {
                const { name, type, balance, creditLimit, dueDate, iconColor, icon } = req.body;

                if (type === "credit card" && (!creditLimit || !dueDate)) {
                    return res.status(400).json({ message: "Credit limit and due date are required for credit card accounts." });
                }

                const existingAccount = await Account.findOne({ userId, name });
                if (existingAccount) {
                    return res.status(400).json({ message: "Account with this name already exists." });
                }

                const newAccount = await Account.create({ 
                    userId, 
                    name, 
                    type, 
                    balance: type === "credit card" ? 0 : balance,
                    initialBalance: type === "credit card" ? 0 : balance, // Store initial balance for non-credit accounts
                    creditLimit: type === "credit card" ? creditLimit || 5000 : undefined, // Default credit limit for credit card
                    creditUsed: type === "credit card" ? 0 : undefined, // Initialize creditUsed for credit cards
                    dueDate: type === "credit card" ? dueDate : undefined, // Set due date only for credit card accounts
                    icon,
                    color: iconColor
                });

                res.status(201).json({ message: "Account created successfully.", account: newAccount });
            } catch (error) {
                res.status(500).json({ message: "Server error", error: error.message });
            }
            break;

        case "DELETE":
            try {
                const { id } = req.query;

                const account = await Account.findOne({ _id: id, userId });
                if (!account) {
                    return res.status(404).json({ message: "Account not found." });
                }

                await Account.findOneAndDelete({ _id: id, userId });

                res.status(200).json({ message: "Account deleted successfully." });
            } catch (error) {
                res.status(500).json({ message: "Server error", error: error.message });
            }
            break;

        case "PUT":
            try {
                const { id } = req.query;
                const {
                  name,
                  type,
                  initialBalance: newInitialBalance,
                  creditLimit,
                  dueDate,
                  icon,
                  iconColor
                } = req.body;
              
                const account = await Account.findOne({ _id: id, userId });
              
                if (!account) {
                  return res.status(404).json({ message: "Account not found." });
                }
              
                if (name && name !== account.name) {
                  const existingAccount = await Account.findOne({ userId, name });
                  if (existingAccount) {
                    return res.status(400).json({ message: "Account with this name already exists." });
                  }
                }
              
                if (name) account.name = name;
                if (type) account.type = type;
                if (icon) account.icon = icon;
                if (iconColor) account.color = iconColor;
                if (creditLimit !== undefined && account.type === "credit card") {
                  account.creditLimit = creditLimit;
                }
                if (dueDate !== undefined && account.type === "credit card") {
                  account.dueDate = dueDate;
                }
              
                // Handle balance update if initialBalance is actually changed
                if (
                  newInitialBalance !== undefined &&
                  newInitialBalance !== account.initialBalance
                ) {
                  const transactions = await TransactionSchema.find({ accountId: account._id });
              
                  account.initialBalance = newInitialBalance;
              
                  if (transactions.length > 0) {
                    const totalIncome = transactions
                      .filter((txn) => txn.type === "income")
                      .reduce((sum, txn) => sum + txn.amount, 0);
                    const totalExpenses = transactions
                      .filter((txn) => txn.type === "expense")
                      .reduce((sum, txn) => sum + txn.amount, 0);
              
                    account.balance = newInitialBalance + totalIncome - totalExpenses;
                  } else {
                    account.balance = newInitialBalance;
                  }
                }
              
                await account.save();
              
                res.status(200).json({ message: "Account updated successfully.", account });
              } catch (error) {
                res.status(500).json({ message: "Server error", error: error.message });
              }
            break;              

        default:
            res.setHeader("Allow", ["GET", "POST", "DELETE", "PUT"]);
            res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
}
