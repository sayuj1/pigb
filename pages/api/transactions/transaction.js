import connectDB from "../../../lib/mongodb";
import Transaction from "../../../models/TransactionSchema";
import Account from "@/models/AccountSchema";
import Budget from "@/models/BudgetSchema";
import { authenticate } from "@/utils/backend/authMiddleware";
import { delCache, delAllWithPrefix } from "@/lib/useCache";

export default async function handler(req, res) {
  await connectDB();

  const userId = authenticate(req);

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  switch (req.method) {
    // ✅ Fetch Transactions
    case "GET":
      try {
        // Extract and sanitize query parameters
        let {
          page = "1",
          limit = "10",
          sortBy = "date",
          sortOrder = "desc",
          search = "",
          type,
          category,
          minAmount,
          maxAmount,
          startDate,
          endDate,
          accountId,
        } = req.query;

        const parsedPage = Math.max(1, parseInt(page));
        const parsedLimit = Math.max(1, parseInt(limit));
        const skip = (parsedPage - 1) * parsedLimit;
        const sortDirection = sortOrder === "asc" ? 1 : -1;

        // Base query: only user-specific transactions
        const query = { userId };

        // Text search (description/category)
        if (search.trim()) {
          const regex = new RegExp(search.trim(), "i");
          query.$or = [{ category: regex }, { description: regex }];
        }

        // Filters
        if (type) query.type = type;
        if (category) query.category = category;

        if (minAmount || maxAmount) {
          query.amount = {};
          if (minAmount) query.amount.$gte = parseFloat(minAmount);
          if (maxAmount) query.amount.$lte = parseFloat(maxAmount);
        }

        if (startDate || endDate) {
          query.date = {};
          if (startDate) query.date.$gte = new Date(startDate);
          if (endDate) query.date.$lte = new Date(endDate);
        }

        if (accountId) {
          const accountIds = Array.isArray(accountId)
            ? accountId
            : accountId.split(",").map((id) => id.trim());
          query.accountId = { $in: accountIds };
        }

        // Fetch filtered & paginated transactions
        const [transactions, total] = await Promise.all([
          Transaction.find(query)
            .populate({
              path: "accountId",
              select: "name type icon color balance",
            })
            .sort({ [sortBy]: sortDirection })
            .skip(skip)
            .limit(parsedLimit),
          Transaction.countDocuments(query),
        ]);

        // Success response
        res.status(200).json({
          message: "Transactions fetched successfully",
          transactions,
          pagination: {
            currentPage: parsedPage,
            totalPages: Math.ceil(total / parsedLimit),
            totalItems: total,
          },
        });
      } catch (error) {
        console.error("[GET /transactions] Error:", {
          message: error.message,
          stack: error.stack,
        });

        res.status(500).json({
          message: "An error occurred while fetching transactions.",
          error: error.message,
        });
      }
      break;

    // ✅ Add New Transaction
    case "POST":
      try {
        const {
          accountId,
          type,
          category,
          amount,
          billDate: date,
          description,
        } = req.body;

        if (!accountId || !type || !category || !amount) {
          return res.status(400).json({ message: "Missing required fields" });
        }

        const transaction = new Transaction({
          userId,
          accountId,
          type,
          category,
          amount,
          date: date || Date.now(),
          description,
        });

        await transaction.save();
        // invalidate cache 
        await delCache({ key: userId, prefix: "accounts" });
        await delCache({
          key: userId,
          prefix: "total-expense",
        });
        await delCache({
          key: userId,
          prefix: "total-balance",
        });
        await delAllWithPrefix("expenses-income-trend");
        await delAllWithPrefix("category-spend");


        // ✅ If transaction is an expense, add it to the budget
        if (type === "expense") {
          await Budget.addExpense(
            userId,
            category,
            transaction.date,
            transaction.amount,
            transaction._id,
            transaction.description
          );
        }

        res
          .status(201)
          .json({ message: "Transaction added successfully", transaction });
      } catch (error) {
        console.error("Error adding transaction:", error);
        res.status(500).json({ message: "Server error", error: error.message });
      }
      break;

    // ✅ Edit (Update) Transaction
    case "PUT":
      try {
        const { id } = req.query;
        const { accountId, type, category, amount, date, description } =
          req.body;

        if (!id) {
          return res
            .status(400)
            .json({ message: "Transaction ID is required" });
        }

        // Fetch the existing transaction before updating
        const oldTransaction = await Transaction.findById(id);
        if (!oldTransaction) {
          return res.status(404).json({ message: "Transaction not found" });
        }

        // Check if category or amount has changed
        const categoryChanged = oldTransaction.category !== category;
        const amountChanged = oldTransaction.amount !== amount;
        const typeChanged = oldTransaction.type !== type;

        // Find the transaction and update it
        const transaction = await Transaction.findOneAndUpdate(
          { _id: id, userId },
          {
            $set: {
              accountId,
              type,
              category,
              amount,
              date,
              description,
            },
          },
          { new: true } // Return the updated transaction document
        );

        if (!transaction) {
          return res.status(404).json({ message: "Transaction not found" });
        }

        // ✅ Handle budget updates if the transaction is an expense
        if (oldTransaction.type === "expense") {
          if (typeChanged || categoryChanged) {
            // If transaction type changes to income OR category changes, remove from old budget
            await Budget.removeExpense(oldTransaction._id);

            // Only re-add if it's still an expense (i.e., type didn't change to income)
            if (type === "expense") {
              await Budget.addExpense(
                userId,
                category,
                date,
                amount,
                transaction._id,
                description
              );
            }
          } else if (amountChanged) {
            // If only the amount changed, update the existing budget entry
            await Budget.updateExpenseAmount(oldTransaction._id, amount);
          }
        } else if (type === "expense") {
          // If it's a brand-new expense (wasn't an expense before), add it
          await Budget.addExpense(
            userId,
            category,
            date,
            amount,
            transaction._id,
            description
          );
        }

        // ✅ Update account balance correctly based on old and new values
        const account = await Account.findById(transaction.accountId);
        if (!account) {
          return res.status(404).json({ message: "Account not found" });
        }

        // Reverse the effect of the OLD transaction
        if (account.type === "credit card") {
          if (oldTransaction.type === "expense") {
            account.creditUsed -= oldTransaction.amount;
            if (account.creditUsed < 0) account.creditUsed = 0;
          } else if (oldTransaction.type === "income") {
            account.creditUsed = Math.max(
              0,
              account.creditUsed - oldTransaction.amount
            );
          }

          // Apply the effect of the NEW transaction
          if (type === "expense") {
            if (account.creditUsed + amount > account.creditLimit) {
              return res.status(400).json({ message: "Credit limit exceeded" });
            }
            account.creditUsed += amount;
          } else if (type === "income") {
            account.creditUsed = Math.max(0, account.creditUsed - amount);
          }
        } else {
          // Reverse OLD transaction effect
          if (oldTransaction.type === "income") {
            account.balance -= oldTransaction.amount;
          } else if (oldTransaction.type === "expense") {
            account.balance += oldTransaction.amount;
          }

          // Apply NEW transaction effect
          if (type === "income") {
            account.balance += amount;
          } else if (type === "expense") {
            account.balance -= amount;
          }
        }

        await account.save();

        // invalidate cache 
        await delCache({ key: userId, prefix: "accounts" });
        await delCache({
          key: userId,
          prefix: "total-expense",
        });
        await delCache({
          key: userId,
          prefix: "total-balance",
        });
        await delAllWithPrefix("expenses-income-trend");
        await delAllWithPrefix("category-spend");

        res
          .status(200)
          .json({ message: "Transaction updated successfully", transaction });
      } catch (error) {
        console.error("Error updating transaction:", error);
        res.status(500).json({ message: "Server error", error: error.message });
      }
      break;

    // ✅ Delete Transaction
    case "DELETE":
      try {
        const { id } = req.query;

        if (!id) {
          return res
            .status(400)
            .json({ message: "Transaction ID is required" });
        }

        // Use findOneAndDelete instead of remove
        const deletedTransaction = await Transaction.findOneAndDelete({
          _id: id,
          userId,
        });

        if (!deletedTransaction) {
          return res.status(404).json({ message: "Transaction not found" });
        }
        // ✅ If the transaction was an expense, remove it from the budget
        if (deletedTransaction.type === "expense") {
          await Budget.removeExpense(deletedTransaction._id);
        }

        // invalidate cache 
        await delCache({ key: userId, prefix: "accounts" });
        await delCache({
          key: userId,
          prefix: "total-expense",
        });
        await delCache({
          key: userId,
          prefix: "total-balance",
        });
        await delAllWithPrefix("expenses-income-trend");
        await delAllWithPrefix("category-spend");
        res.status(200).json({ message: "Transaction deleted successfully" });
      } catch (error) {
        console.error("Error deleting transaction:", error);
        res.status(500).json({ message: "Server error", error: error.message });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
