import TransactionSchema from "@/models/TransactionSchema";

export const findTransactionById = async (tId) => {
    return await TransactionSchema.findById({ _id: tId });
}

export const deleteTransactionById = async (userId, tId) => {
    return await TransactionSchema.findOneAndDelete({ _id: tId, userId });
}