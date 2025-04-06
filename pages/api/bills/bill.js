import connectDB from '../../../lib/mongodb';
import Bill from '@/models/BillsSchema';
import Transaction from "../../../models/TransactionSchema";
import { authenticate } from "@/utils/backend/authMiddleware";

export default async function handler(req, res) {
    await connectDB();

    const userId = authenticate(req);

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    switch (req.method) {
        case "POST":
            try {
                const { name, amount, dueDate, isRecurring, frequency, accountId } = req.body;
        
                if (!accountId) {
                    return res.status(400).json({ message: "Account ID is required" });
                }
        
                if (isRecurring && !frequency) {
                    return res.status(400).json({ message: "Frequency is required for recurring bills." });
                }
        
                const newBill = new Bill({
                    userId,
                    accountId,
                    name,
                    amount,
                    dueDate,
                    isRecurring,
                    frequency: isRecurring ? frequency : null,
                });
        
                await newBill.save();
                res.status(201).json({ message: "Bill created successfully", bill: newBill });
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
                        status 
                    } = req.query;
            
                    // 🔍 Searching (by bill name)
                    if (search) {
                        query.name = { $regex: search, $options: "i" }; // Case-insensitive search
                    }
            
                    // 🔄 Filtering (by accountId and status)
                    if (accountId) query.accountId = accountId;
                    if (status) query.status = status;
            
                    // 📊 Sorting (default by dueDate ascending)
                    const sortQuery = {};
                    sortQuery[sortBy] = sortOrder === "desc" ? -1 : 1;
            
                    // 📌 Pagination & Query Execution (with account details populated)
                    const bills = await Bill.find(query)
                        .populate("accountId", "name balance accountType") // Populates account details (only selected fields)
                        .sort(sortQuery)
                        .skip((page - 1) * limit)
                        .limit(Number(limit));
            
                    const totalBills = await Bill.countDocuments(query);
            
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
                    const { _id: id, name, amount, dueDate, isRecurring, frequency, status, accountId } = req.body;
            
                    const bill = await Bill.findOne({ _id: id, userId });
                    if (!bill) {
                        return res.status(404).json({ message: "Bill not found" });
                    }
            
                    if (accountId) bill.accountId = accountId; // Update account if provided
                    bill.name = name || bill.name;
                    bill.amount = amount || bill.amount;
                    bill.dueDate = dueDate || bill.dueDate;
                    bill.isRecurring = isRecurring !== undefined ? isRecurring : bill.isRecurring;
                    bill.frequency = isRecurring ? frequency : null;
                    bill.status = status || bill.status;
            
                    // If status is changed to "paid", create a transaction
                    if (status === "paid") {
                        const newTransaction = new Transaction({
                            userId,
                            accountId: bill.accountId, // Ensure transaction is linked to the account
                            type: "expense",
                            category: bill.name,
                            amount: bill.amount,
                            date: new Date(),
                            description: `Payment for ${bill.name}`,
                        });
            
                        await newTransaction.save();
                        bill.transactionIds.push(newTransaction._id);
                    }
            
                    // Handle recurring bill's next due date
                    if (bill.isRecurring && status === "paid") {
                        let nextDueDate = new Date(bill.dueDate);
                        switch (bill.frequency) {
                            case "daily": nextDueDate.setDate(nextDueDate.getDate() + 1); break;
                            case "weekly": nextDueDate.setDate(nextDueDate.getDate() + 7); break;
                            case "monthly": nextDueDate.setMonth(nextDueDate.getMonth() + 1); break;
                            case "yearly": nextDueDate.setFullYear(nextDueDate.getFullYear() + 1); break;
                            default: break;
                        }
                        bill.dueDate = nextDueDate;
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