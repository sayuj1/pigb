import connectDB from "../../../lib/mongodb";
import Bill from "@/models/BillsSchema";
import Transaction from "../../../models/TransactionSchema";
import { authenticate } from "@/utils/backend/authMiddleware";
import { delCache, delAllWithPrefix } from "@/lib/useCache";

export default async function handler(req, res) {
  await connectDB();

  const userId = authenticate(req);

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  switch (req.method) {
    case "POST":
      try {
        let {
          name,
          amount,
          dueDate,
          isRecurring,
          frequency,
          accountId,
          status,
        } = req.body;

        if (!accountId) {
          return res.status(400).json({ message: "Account ID is required" });
        }

        if (isRecurring && !frequency) {
          return res
            .status(400)
            .json({ message: "Frequency is required for recurring bills." });
        }

        let transactionId = null;
        if (status === "paid") {
          const transactionRes = await fetch(
            `${process.env.API_BASE_URL || "http://localhost:3000"
            }/api/transactions/transaction`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                cookie: req.headers.cookie || "",
              },
              body: JSON.stringify({
                userId,
                accountId,
                type: "expense",
                category: "💸 Bills",
                amount,
                billDate: dueDate,
                description: `Auto-added from bill: ${name}`,
                source: "bills",
              }),
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

          transactionId = transactionData.transaction._id;
        }

        // Handle recurring bill's next due date
        if (isRecurring && status === "paid") {
          let nextDueDate = new Date(dueDate);
          status = "unpaid"; // Reset status for recurring bills
          switch (frequency) {
            case "daily":
              nextDueDate.setDate(nextDueDate.getDate() + 1);
              break;
            case "weekly":
              nextDueDate.setDate(nextDueDate.getDate() + 7);
              break;
            case "monthly":
              nextDueDate.setMonth(nextDueDate.getMonth() + 1);
              break;
            case "yearly":
              nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
              break;
            default:
              nextDueDate.setMonth(nextDueDate.getMonth() + frequency); //custom value
              break;
          }
          dueDate = nextDueDate;
        }

        // ✅ Create the bill (include transaction ID only if available)
        const newBill = new Bill({
          userId,
          accountId,
          name,
          amount,
          dueDate,
          isRecurring,
          frequency: isRecurring ? frequency : null,
          status: status || "unpaid",
          transactionIds: transactionId ? [transactionId] : [],
        });

        await newBill.save();

        res.status(201).json({
          message: "Bill created successfully",
          bill: newBill,
          ...(transactionId && { transactionId }),
        });
      } catch (error) {
        console.error("Error creating bill:", error);
        res.status(500).json({ message: "Server error", error: error.message });
      }

      break;
    case "GET":
      try {
        const {
          page = 1,
          limit = 10,
          accountId,
          search,
          sortBy = "dueDate",
          sortOrder = "asc",
          status,
        } = req.query;

        // 🧹 Clean filter object
        const filter = { userId }; // ✅ Only fetch bills belonging to the authenticated user

        // 🔍 Searching (by bill name)
        if (search) {
          filter.name = { $regex: search, $options: "i" }; // Case-insensitive search
        }

        // 🔄 Filtering (by accountId and status)
        if (accountId) filter.accountId = accountId;
        if (status === "inactive") {
          filter.status = { $in: ["paid", "cancelled"] };
        } else if (status) {
          filter.status = status;
        }

        // 📊 Sorting
        const sortQuery = {};
        sortQuery[sortBy] = sortOrder === "desc" ? -1 : 1;

        // 📌 Pagination & Query Execution
        const bills = await Bill.find(filter)
          .populate("accountId", "name balance icon color")
          .sort(sortQuery)
          .skip((page - 1) * limit)
          .limit(Number(limit));

        const totalBills = await Bill.countDocuments(filter);

        res.status(200).json({
          bills,
          pagination: {
            totalPages: Math.ceil(totalBills / limit),
            currentPage: Number(page),
            totalBills,
          },
        });
      } catch (error) {
        console.error("Error fetching bills:", error);
        res.status(500).json({ message: "Server error", error: error.message });
      }
      break;
    case "PUT":
      try {
        const {
          _id: id,
          name,
          amount,
          dueDate,
          isRecurring,
          frequency,
          status,
          accountId,
        } = req.body;
        // console.log("reach2", req.body);

        const bill = await Bill.findOne({ _id: id, userId });
        if (!bill) {
          return res.status(404).json({ message: "Bill not found" });
        }

        if (accountId) bill.accountId = accountId; // Update account if provided
        bill.name = name || bill.name;
        bill.amount = amount || bill.amount;
        bill.dueDate = dueDate || bill.dueDate;
        bill.status = status || bill.status;

        // If status is changed to "paid", create a transaction
        let transactionId = null;

        if (status === "paid") {
          const transactionRes = await fetch(
            `${process.env.API_BASE_URL || "http://localhost:3000"
            }/api/transactions/transaction`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                cookie: req.headers.cookie || "",
              },
              body: JSON.stringify({
                userId,
                accountId,
                type: "expense",
                category: "💸 Bills",
                amount: bill.amount,
                billDate: bill.dueDate,
                description: `Auto-added from bill: ${bill.name}`,
                source: "bills",
              }),
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

          transactionId = transactionData.transaction._id;
          bill.transactionIds.push(transactionId);
        }

        // Handle recurring bill's next due date
        if (bill.isRecurring && status === "paid") {
          const currentDueDate = new Date(bill.dueDate);

          // Extract UTC components to preserve the exact time
          let nextDueDate = new Date(
            Date.UTC(
              currentDueDate.getUTCFullYear(),
              currentDueDate.getUTCMonth(),
              currentDueDate.getUTCDate(),
              currentDueDate.getUTCHours(),
              currentDueDate.getUTCMinutes(),
              currentDueDate.getUTCSeconds()
            )
          );

          // console.log("current due date (UTC)", nextDueDate.toISOString());

          switch (bill.frequency) {
            case "daily":
              nextDueDate.setUTCDate(nextDueDate.getUTCDate() + 1);
              break;
            case "weekly":
              nextDueDate.setUTCDate(nextDueDate.getUTCDate() + 7);
              break;
            case "monthly":
              nextDueDate.setUTCMonth(nextDueDate.getUTCMonth() + 1);
              break;
            case "quarterly":
              nextDueDate.setUTCMonth(nextDueDate.getUTCMonth() + 3);
              break;
            case "yearly":
              nextDueDate.setUTCFullYear(nextDueDate.getUTCFullYear() + 1);
              break;
            default:
              // If `frequency` is a number (e.g., custom months like 3 for quarterly)
              const customMonths = Number(bill.frequency);
              if (!isNaN(customMonths)) {
                nextDueDate.setUTCMonth(
                  nextDueDate.getUTCMonth() + customMonths
                );
              } else {
                console.warn("Invalid frequency value:", bill.frequency);
              }
              break;
          }

          bill.dueDate = nextDueDate.toISOString(); // Store as ISO string
          bill.status = "unpaid";
        }

        await bill.save();
        res.status(200).json({ message: "Bill updated successfully", bill });
      } catch (error) {
        console.error("Error updating bill:", error);
        res.status(500).json({ message: "Server error", error: error.message });
      }
      break;
    case "DELETE":
      try {
        const { _id: id } = req.query;
        const bill = await Bill.findOne({ _id: id, userId });
        if (!bill) {
          return res.status(404).json({ message: "Bill not found" });
        }

        // Delete associated transactions
        await Transaction.deleteMany({ _id: { $in: bill.transactionIds } });

        // Remove the bill
        await Bill.findByIdAndDelete(id);

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

        res.status(200).json({ message: "Bill deleted successfully" });
      } catch (error) {
        console.error("Error deleting bill:", error);
        res.status(500).json({ message: "Server error", error: error.message });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
