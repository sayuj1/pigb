import { ValidationError } from "@/utils/backend/error";
import { findSavingsById } from "@/utils/backend/savingsUtils";
import { createSavingsTransaction, prepareSavingsTransactionPayload } from "@/utils/backend/savingTransactionUtils";
import { validateCreateSavingsTransaction } from "@/validations/savingTransactionValidations";
import { handleCreateTransaction } from "./transactionService";



export const handleCreateSavingsTransaction = async (userId, savingTransaction) => {
    const validateSavingsTransactionData = validateCreateSavingsTransaction(savingTransaction);

    const savingsAccount = await findSavingsById(userId, savingTransaction.savingsId);
    if (!savingsAccount) {
        throw new ValidationError("Savings account not found");
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

