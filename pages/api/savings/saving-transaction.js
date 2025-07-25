import connectDB from "../../../lib/mongodb";
import SavingsTransaction from "@/models/SavingsTransactionSchema";
import Savings from "@/models/SavingsSchema";
import { authenticate } from "@/utils/backend/authMiddleware";
import { generateSavingsDescription } from "@/utils/backend/messageUtils";

export default async function handler(req, res) {
  await connectDB();

  const userId = authenticate(req);

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  switch (req.method) {
    case "GET":
      try {
        const {
          savingsId,
          page = 1,
          limit = 10,
          type,
          search = "",
          start,
          end,
          sortBy = "date", // "date" or "amount"
          sortOrder = "desc", // "asc" or "desc"
        } = req.query;

        if (!savingsId) {
          return res.status(400).json({ message: "savingsId is required" });
        }

        // Verify savings account ownership
        const savings = await Savings.findOne({ _id: savingsId, userId });
        if (!savings) {
          return res.status(403).json({
            message: "Forbidden: You cannot access these transactions",
          });
        }

        // Build query
        const query = { savingsId };
        if (type) query.type = type;
        if (search) query.description = { $regex: search, $options: "i" };
        if (start && end) {
          query.date = {
            $gte: new Date(start),
            $lte: new Date(end),
          };
        }

        // Sort setup
        const sortOptions = {};
        if (["amount", "date"].includes(sortBy)) {
          sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;
        }

        // Pagination metadata
        const parsedLimit = parseInt(limit);
        const parsedPage = parseInt(page);
        const skip = (parsedPage - 1) * parsedLimit;

        const totalTransactions = await SavingsTransaction.countDocuments(query);

        // Fetch paginated results
        const transactions = await SavingsTransaction.find(query)
          .sort(sortOptions)
          .skip(skip)
          .limit(parsedLimit)
          .populate("accountId", "name balance icon color") // Optional field
          .select("-__v"); // Optional: clean response

        return res.status(200).json({
          savings,
          transactions,
          pagination: {
            totalTransactions,
            totalPages: Math.ceil(totalTransactions / parsedLimit),
            currentPage: parsedPage,
            limit: parsedLimit,
          },
        });
      } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ message: "Server error", error: error.message });
      }
      break;


    case "POST":
      try {
        const { savingsId, date, amount, type, description, accountId } = req.body;

        if (!savingsId || !date || !amount || !type) {
          return res.status(400).json({ message: "Missing required fields" });
        }

        const savings = await Savings.findOne({ _id: savingsId, userId });
        if (!savings) {
          return res.status(403).json({
            message: "Forbidden: You cannot modify this savings account",
          });
        }

        let savingsBalance = savings.runningBalance;
        let transactionPayload = {
          userId,
          type: "",
          amount,
          date,
          category: savings.savingsType,
          accountId: null,
        };

        if (type === "withdrawal") {
          if (!accountId) {
            return res.status(400).json({ message: "Missing accountId for withdrawal" });
          }

          savingsBalance -= amount;

          transactionPayload.type = "income";
          transactionPayload.accountId = accountId;
          transactionPayload.description = generateSavingsDescription({ type, savingsName: savings.accountName });

        } else if (type === "deposit") {
          if (!accountId) {
            return res.status(400).json({ message: "Missing accountId for deposit" });
          }

          savingsBalance += amount;

          transactionPayload.type = "expense";
          transactionPayload.accountId = accountId;
          transactionPayload.description = generateSavingsDescription({ type, savingsName: savings.accountName });

        } else if (type === "interest") {
          // Interest added to savings (by bank), use same savingsId as accountId
          savingsBalance += amount;
          transactionPayload = null; // No linked account transaction needed
        } else {
          return res.status(400).json({ message: "Invalid transaction type" });
        }

        // Create linked transaction if applicable
        let linkedTransaction = null;
        if (transactionPayload) {
          transactionPayload.source = "savings";
          const transactionRes = await fetch(
            `${process.env.API_BASE_URL || "http://localhost:3000"
            }/api/transactions/transaction`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                cookie: req.headers.cookie || "",
              },
              body: JSON.stringify(transactionPayload),
            }
          );

          const transactionData = await transactionRes.json();

          if (!transactionRes.ok || !transactionData.transaction) {
            console.error("Transaction creation failed:", transactionData);
            return res.status(500).json({
              message: "Failed to create transaction for paid bill",
              error: transactionData.message || "Unknown error",
            });
          }

          linkedTransaction = transactionData.transaction;

        }

        // Create savings transaction
        const savingsTransaction = await SavingsTransaction.create({
          savingsId,
          amount,
          date,
          type,
          description: description || generateSavingsDescription({ type, savingsName: savings.accountName }),
          accountId: transactionPayload?.accountId || null, // default to savings for interest
          transactionId: linkedTransaction?._id || null, // Link to transaction if applicable
        });

        // Update savings balance
        savings.runningBalance = savingsBalance;
        await savings.save();

        return res.status(201).json({
          transaction: savingsTransaction,
          updatedBalance: savings.runningBalance,
        });

      } catch (error) {
        console.error("Error creating transaction:", error);
        res.status(500).json({ message: "Server error", error: error.message });
      }
      break;

    case "PUT":
      try {
        const { _id: id, amount, date, type, description, accountId } = req.body;

        if (!amount || !date || !type) {
          return res.status(400).json({ message: "Missing required fields" });
        }

        const transaction = await SavingsTransaction.findById(id);
        console.log("Transaction to update:", transaction);
        if (!transaction) {
          return res.status(404).json({ message: "Transaction not found" });
        }

        const savings = await Savings.findOne({
          _id: transaction.savingsId,
          userId,
        });
        if (!savings) {
          return res.status(403).json({
            message: "Forbidden: You do not own this savings account",
          });
        }

        let savingsBalance = savings.runningBalance;

        // Reverse old effect
        if (transaction.type === "deposit" || transaction.type === "interest") {
          savingsBalance -= transaction.amount;
        } else if (transaction.type === "withdrawal") {
          savingsBalance += transaction.amount;
        }

        // Apply new effect
        if (type === "deposit" || type === "interest") {
          savingsBalance += amount;
        } else if (type === "withdrawal") {
          savingsBalance -= amount;
        }

        const generatedDescription = generateSavingsDescription({
          type,
          savingsName: savings.accountName,
        });

        // Track new values
        let updatedAccountId = accountId || transaction.accountId;
        let updatedTransactionId = transaction.transactionId;

        const typeChanged = transaction.type !== type;
        const wasInterest = transaction.type === "interest";
        const isNowInterest = type === "interest";

        if (typeChanged) {
          // --- Handle type transition cases ---
          if (!wasInterest && isNowInterest) {
            // From deposit/withdrawal → interest: delete linked transaction
            if (transaction.transactionId) {
              await fetch(
                `${process.env.API_BASE_URL || "http://localhost:3000"}/api/transactions/transaction`,
                {
                  method: "DELETE",
                  headers: {
                    "Content-Type": "application/json",
                    cookie: req.headers.cookie || "",
                  },
                  body: JSON.stringify({ _id: transaction.transactionId }),
                }
              );
            }

            updatedAccountId = null;
            updatedTransactionId = null;

          } else if (wasInterest && !isNowInterest) {
            // From interest → deposit/withdrawal: create a new linked transaction
            if (!accountId) {
              return res.status(400).json({ message: "accountId is required when switching from interest" });
            }

            const newPayload = {
              userId,
              type: type === "withdrawal" ? "income" : "expense",
              amount,
              date,
              accountId,
              category: savings.savingsType,
              description: generatedDescription,
              source: "savings",
            };

            const createRes = await fetch(
              `${process.env.API_BASE_URL || "http://localhost:3000"}/api/transactions/transaction`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  cookie: req.headers.cookie || "",
                },
                body: JSON.stringify(newPayload),
              }
            );

            const createData = await createRes.json();
            if (!createRes.ok || !createData.transaction) {
              return res.status(500).json({
                message: "Failed to create linked transaction",
                error: createData.message || "Unknown error",
              });
            }

            updatedAccountId = accountId;
            updatedTransactionId = createData.transaction._id;

          }

        } else if (!isNowInterest && transaction.transactionId) {
          // Update existing transaction
          const updatePayload = {
            _id: transaction.transactionId,
            amount,
            date,
            type: type === "withdrawal" ? "income" : "expense",
            accountId: updatedAccountId,
            description: generatedDescription,
            source: "savings",
          };

          const updateRes = await fetch(
            `${process.env.API_BASE_URL || "http://localhost:3000"}/api/transactions/transaction?id=${transaction.transactionId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                cookie: req.headers.cookie || "",
              },
              body: JSON.stringify(updatePayload),
            }
          );

          const updateData = await updateRes.json();
          if (!updateRes.ok) {
            return res.status(500).json({
              message: "Failed to update linked transaction",
              error: updateData.message || "Unknown error",
            });
          }
        }

        // Update savings transaction
        transaction.amount = amount;
        transaction.date = date;
        transaction.type = type;
        transaction.description = description || generatedDescription;
        transaction.accountId = updatedAccountId;
        transaction.transactionId = updatedTransactionId;
        await transaction.save();

        // Save new balance
        savings.runningBalance = savingsBalance;
        await savings.save();

        return res.status(200).json({
          transaction,
          updatedBalance: savingsBalance,
        });

      } catch (error) {
        console.error("Error updating transaction:", error);
        res.status(500).json({ message: "Server error", error: error.message });
      }
      break;

    case "DELETE":
      try {
        const { id } = req.query;

        // Find the savings transaction
        const transaction = await SavingsTransaction.findById(id);
        if (!transaction) {
          return res.status(404).json({ message: "Transaction not found" });
        }

        // Find the associated savings account
        const savings = await Savings.findOne({
          _id: transaction.savingsId,
          userId,
        });
        if (!savings) {
          return res.status(403).json({
            message: "Forbidden: You do not own this savings account",
          });
        }

        // Reverse transaction effect on savings balance
        let updatedBalance = savings.runningBalance;
        if (transaction.type === "deposit" || transaction.type === "interest") {
          updatedBalance -= transaction.amount;
        } else if (transaction.type === "withdrawal") {
          updatedBalance += transaction.amount;
        }

        // Delete linked transaction if it exists
        if (transaction.transactionId) {
          const deleteRes = await fetch(
            `${process.env.API_BASE_URL || "http://localhost:3000"}/api/transactions/transaction?id=${transaction.transactionId}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                cookie: req.headers.cookie || "",
              },
            }
          );

          const deleteData = await deleteRes.json();
          if (!deleteRes.ok) {
            return res.status(500).json({
              message: "Failed to delete linked transaction",
              error: deleteData.message || "Unknown error",
            });
          }
        }

        // Delete the savings transaction
        await SavingsTransaction.findByIdAndDelete(id);

        // Update the savings account balance
        savings.runningBalance = updatedBalance;
        await savings.save();

        return res.status(200).json({
          message: "Transaction deleted",
          updatedBalance,
        });

      } catch (error) {
        console.error("Error deleting transaction:", error);
        res.status(500).json({ message: "Server error", error: error.message });
      }
      break;


    default:
      res.setHeader("Allow", ["GET", "POST", "DELETE", "PUT"]);
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
