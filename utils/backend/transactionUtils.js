import TransactionSchema from "@/models/TransactionSchema";

export const findTransactionById = async (tId) => {
    return await TransactionSchema.findById({ _id: tId });
}

export const deleteTransactionById = async (userId, tId) => {
    return await TransactionSchema.findOneAndDelete({ _id: tId, userId });
}

export const updateTransactionById = async (userId, tId, updateData) => {
    return await TransactionSchema.findOneAndUpdate(
        { _id: tId, userId },
        { $set: updateData },
        { new: true }
    );
}

export const deleteAllTransactionsForAccount = async (accountId) => {
    // 1. Fetch all transactions first (to access their data)
    const transactions = await TransactionSchema.find({ accountId });

    if (!transactions.length) return [];

    // 2️Collect expense transaction IDs
    const expenseTransactionIds = transactions
        .filter((tx) => tx.type === "expense")
        .map((tx) => tx._id);

    // 3️ Delete all in one go
    await TransactionSchema.deleteMany({ accountId });

    // 4️ Return IDs of deleted expense transactions
    return expenseTransactionIds;
};