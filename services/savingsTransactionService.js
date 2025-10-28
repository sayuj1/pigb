import { ValidationError } from "@/utils/backend/error";
import { findSavingsById } from "@/utils/backend/savingsUtils";
import { createSavingsTransaction, deleteSavingsTransactionById, findSavingsTransactionById, prepareSavingsTransactionPayload } from "@/utils/backend/savingTransactionUtils";
import { validateSavingsTransaction } from "@/validations/savingTransactionValidations";
import { handleCreateTransaction, handleDeleteTransaction, handleUpdateTransaction } from "./transactionService";
import { generateSavingsDescription } from "@/utils/backend/messageUtils";



export const handleCreateSavingsTransaction = async (userId, savingTransaction) => {
    const validateSavingsTransactionData = validateSavingsTransaction(savingTransaction);

    const savingsAccount = await findSavingsById(userId, savingTransaction.savingsId);
    if (!savingsAccount) {
        throw new ValidationError("Savings account not found");
    }
    if (savingsAccount?.status === "closed") {
        throw new ValidationError("Cannot add transactions to a closed savings account");
    }

    const { transactionPayload, updatedSavingsBalance } = await prepareSavingsTransactionPayload(userId, savingsAccount, validateSavingsTransactionData);


    let linkedTransaction = null;
    if (transactionPayload) {
        transactionPayload.source = "savings";
        linkedTransaction = await handleCreateTransaction(userId, transactionPayload);
    }

    // Create savings transaction
    const newSavingsTransaction = await createSavingsTransaction(savingsAccount, linkedTransaction, validateSavingsTransactionData);

    // Update savings balance
    savingsAccount.runningBalance = updatedSavingsBalance;
    await savingsAccount.save();

    return {
        transaction: newSavingsTransaction,
        updatedBalance: savingsAccount.runningBalance,
    };

}

export const handleUpdateSavingsTransaction = async (userId, savingTransaction) => {
    const validateSavingsTransactionData = validateSavingsTransaction(savingTransaction);

    const existingSavingsTransaction = await findSavingsTransactionById(validateSavingsTransactionData._id);

    if (!existingSavingsTransaction) {
        throw new ValidationError("Savings transaction not found");
    }

    const savingsAccount = await findSavingsById(userId, existingSavingsTransaction.savingsId);
    if (!savingsAccount) {
        throw new ValidationError("Savings account not found");
    }

    if (savingsAccount?.status === "closed") {
        throw new ValidationError("Cannot update transaction of a closed savings account");
    }

    let savingsBalance = savingsAccount.runningBalance;

    // Reverse old effect
    if (existingSavingsTransaction.type === "deposit" || existingSavingsTransaction.type === "interest") {
        savingsBalance -= existingSavingsTransaction.amount;
    } else if (existingSavingsTransaction.type === "withdrawal" || existingSavingsTransaction.type === "loss") {
        savingsBalance += existingSavingsTransaction.amount;
    }

    // apply new effect
    if (validateSavingsTransactionData.type === "deposit" || validateSavingsTransactionData.type === "interest") {
        savingsBalance += validateSavingsTransactionData.amount;
    } else if (validateSavingsTransactionData.type === "withdrawal" || validateSavingsTransactionData.type === "loss") {
        savingsBalance -= validateSavingsTransactionData.amount;
    }

    if (savingsBalance < 0 && existingSavingsTransaction.type === "withdrawal") {
        throw new ValidationError("You cannot withdraw more than the available balance");
    }

    const generatedDescription = generateSavingsDescription({
        type: validateSavingsTransactionData.type,
        savingsName: savingsAccount.accountName,
    });

    if (String(validateSavingsTransactionData.accountId) !== String(existingSavingsTransaction.accountId)) {
        // throw error account change not allowed
        throw new ValidationError("Changing linked account is not allowed");
    }

    if (existingSavingsTransaction.type !== validateSavingsTransactionData.type) {
        // throw error type change not allowed
        throw new ValidationError("Changing transaction type is not allowed");
    }


    let updatedTransactionId = existingSavingsTransaction.transactionId;

    const isTransactionExists = existingSavingsTransaction.type === "deposit" || existingSavingsTransaction.type === "withdrawal";

    if (isTransactionExists && existingSavingsTransaction.transactionId) {
        // Update existing transaction
        const updatePayload = {
            _id: existingSavingsTransaction.transactionId,
            amount: validateSavingsTransactionData.amount,
            date: validateSavingsTransactionData.date,
            type: validateSavingsTransactionData.type === "withdrawal" ? "income" : "expense",
            accountId: existingSavingsTransaction.accountId,
            description: generatedDescription,
            source: "savings",
        };

        const updatedTransaction = await handleUpdateTransaction(userId, existingSavingsTransaction.transactionId, updatePayload);
        if (!updatedTransaction) {
            throw new ValidationError("Failed to update linked transaction");
        }
    }


    // Update savings transaction
    existingSavingsTransaction.amount = validateSavingsTransactionData.amount;
    existingSavingsTransaction.date = validateSavingsTransactionData.date;
    existingSavingsTransaction.type = validateSavingsTransactionData.type;
    existingSavingsTransaction.description = validateSavingsTransactionData.description || generatedDescription;
    existingSavingsTransaction.accountId = existingSavingsTransaction.accountId;
    existingSavingsTransaction.transactionId = updatedTransactionId;
    await existingSavingsTransaction.save();

    // Save new balance
    savingsAccount.runningBalance = savingsBalance;
    await savingsAccount.save();

    return {
        transaction: existingSavingsTransaction,
        updatedBalance: savingsAccount.runningBalance,
    };

}

export const handleDeleteSavingsTransaction = async (userId, savingsTransactionId) => {
    const existingTransaction = await findSavingsTransactionById(savingsTransactionId);
    if (!existingTransaction) {
        throw new ValidationError("Savings transaction not found");
    }
    const savingsAccount = await findSavingsById(userId, existingTransaction.savingsId);
    if (!savingsAccount) {
        throw new ValidationError("Savings account not found");
    }
    if (savingsAccount?.status === "closed") {
        throw new ValidationError("Cannot delete transactions from a closed savings account");
    }

    let updatedBalance = savingsAccount.runningBalance;

    // Reverse transaction effect on savings balance
    if (existingTransaction.type === "deposit" || existingTransaction.type === "interest") {
        updatedBalance -= existingTransaction.amount;
    } else if (existingTransaction.type === "withdrawal" || existingTransaction.type === "loss") {
        updatedBalance += existingTransaction.amount;
    }

    // Delete linked transaction if it exists
    if (existingTransaction.transactionId) {
        await handleDeleteTransaction(userId, existingTransaction.transactionId);
    }
    // Delete the savings transaction
    await deleteSavingsTransactionById(existingTransaction._id);

    // Update the savings account balance
    savingsAccount.runningBalance = updatedBalance;
    await savingsAccount.save();

    return {
        message: "Transaction deleted successfully",
        updatedBalance: savingsAccount.runningBalance,
    };
}