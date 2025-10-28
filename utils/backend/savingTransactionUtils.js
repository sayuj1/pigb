import SavingsTransactionSchema from "@/models/SavingsTransactionSchema";
import { generateSavingsDescription } from "./messageUtils";
import { ValidationError } from "./error";

export const prepareSavingsTransactionPayload = async (userId, savingAccount, savingTransaction) => {
    const { date, amount, type, accountId } = savingTransaction;

    let savingsBalance = savingAccount.runningBalance;

    let transactionPayload = {
        userId,
        type: "",
        amount,
        billDate: date,
        category: savingAccount.savingsType,
        accountId: null,
    };

    if (type === "withdrawal" || type === "redemption") {
        if (!accountId) {
            throw new ValidationError("Missing accountId for withdrawal");
        }

        if (savingsBalance < amount) {
            throw new ValidationError("You cannot withdraw more than the available balance");
        }

        savingsBalance -= amount;

        transactionPayload.type = "income";
        transactionPayload.accountId = accountId;
        transactionPayload.description = generateSavingsDescription({ type, savingsName: savingAccount.accountName });

    } else if (type === "deposit") {
        if (!accountId) {

            throw new ValidationError("Missing accountId for deposit");
        }

        savingsBalance += amount;

        transactionPayload.type = "expense";
        transactionPayload.accountId = accountId;
        transactionPayload.description = generateSavingsDescription({ type, savingsName: savingAccount.accountName });

    } else if (type === "interest") {
        // Interest added to savings (by bank), use same savingsId as accountId
        savingsBalance += amount;
        transactionPayload = null; // No linked account transaction needed
    } else if (type === "loss") {
        // loss deducted from savings (market loss/charges), use same savingsId as accountId
        savingsBalance -= amount;
        transactionPayload = null; // No linked account transaction needed
    }

    return { transactionPayload, updatedSavingsBalance: savingsBalance };

}

export const createSavingsTransaction = async (savingsAccount, linkedTransaction, savingsTransaction) => {
    return await SavingsTransactionSchema.create({
        savingsId: savingsTransaction.savingsId,
        amount: savingsTransaction.amount,
        type: savingsTransaction.type,
        date: savingsTransaction.date,
        description: savingsTransaction.description || generateSavingsDescription({ type: savingsTransaction.type, savingsName: savingsAccount.accountName }),
        accountId: savingsTransaction?.accountId || null,
        transactionId: linkedTransaction?._id || null,
    })
}

export const findSavingsTransactionById = async (transactionId) => {
    return await SavingsTransactionSchema.findOne({ _id: transactionId });
}

export const deleteSavingsTransactionById = async (transactionId) => {
    return await SavingsTransactionSchema.findOneAndDelete({ _id: transactionId });
}