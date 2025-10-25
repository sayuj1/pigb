import SavingsSchema from "@/models/SavingsSchema";
import { deleteAllTransactionsByIds } from "./transactionUtils";
import SavingsTransactionSchema from "@/models/SavingsTransactionSchema";

export const createSavings = async (data) => {
    return await SavingsSchema.create(data);
};

export const deleteAllTransactionsForSavingsAccount = async (userId, savingsId) => {

    // 1. Fetch linked transaction IDs (excluding "interest" and "loss")
    const transactions = await SavingsTransactionSchema.find({
        savingsId,
        type: { $nin: ["interest", "loss"] },
    }).select("transactionId");

    const transactionIds = transactions.map((t) => t.transactionId);

    if (transactionIds.length > 0) {

        // 2. Delete associated main transactions
        await deleteAllTransactionsByIds(userId, transactionIds);
    }

    // 3. Delete all related savings transactions for this savings account
    await SavingsTransactionSchema.deleteMany({ savingsId, userId });

    // 4. Delete the savings account itself
    await SavingsSchema.findByIdAndDelete(savingsId);

    return transactionIds;
};
