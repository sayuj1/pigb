import { invalidateCache } from "@/lib/cache";
import { removeTransactionsFromBudgets } from "@/utils/backend/budgetUtils";
import { ValidationError } from "@/utils/backend/error";
import { createSavings, deleteAllTransactionsForSavingsAccount, findSavingsById } from "@/utils/backend/savingsUtils";
import { validateCreateSavings } from "@/validations/savingsValidations";
import { handleCreateSavingsTransaction } from "./savingsTransactionService";

export const handleCreateSavings = async (userId, data) => {
    const validateSavingsData = validateCreateSavings(data);
    const savings = await createSavings({
        userId,
        ...validateSavingsData,
        runningBalance: validateSavingsData.amount, // Initial balance
    });

    return savings;

};

export const handleDeleteSavings = async (userId, savingsId) => {
    if (!savingsId) {
        throw new ValidationError("Savings ID is required");
    }

    // delete all transactions related to this account and remove transactions from budgets
    const deletedTransactionsIds = await deleteAllTransactionsForSavingsAccount(userId, savingsId);

    // delete transactions from budgets
    if (deletedTransactionsIds.length > 0) {
        await removeTransactionsFromBudgets(deletedTransactionsIds);
    }

    await invalidateCache({
        model: "account",
        action: "onDelete",
        data: { userId },
    });
    return { message: "Savings Account deleted successfully." };
}

export const handleUpdateSavings = async (userId, savingsId, saving) => {
    const validateSavingsData = validateCreateSavings(saving);
    const existingSavings = await findSavingsById(userId, savingsId);
    if (!existingSavings) {
        throw new ValidationError("Savings account not found");
    }
    // if amount is changed, adjust running balance accordingly
    const difference = validateSavingsData.amount - existingSavings.amount;
    existingSavings.amount = validateSavingsData.amount;
    existingSavings.savingsType = validateSavingsData.savingsType;
    existingSavings.accountName = validateSavingsData.accountName;
    existingSavings.runningBalance += difference;

    await existingSavings.save();

    return existingSavings;
}

export const handleCloseSavingsAccount = async (userId, query, body) => {
    const { id: savingsId, action } = query;
    if (action !== "close") {
        throw new ValidationError("This action is not allowed");
    }
    const { redeemedAmount, accountId: transferAccountId, accountCloseDate } = body;

    if (redeemedAmount < 0) {
        throw new ValidationError("Redeemed amount cannot be negative");
    }

    const savingsAccount = await findSavingsById(userId, savingsId);

    if (!savingsAccount) {
        throw new ValidationError("Savings account not found");
    }

    if (savingsAccount?.status === "closed") {
        throw new ValidationError("Savings account is already closed");
    }

    if (savingsAccount.runningBalance < 0) {
        throw new ValidationError("Cannot close a savings account with negative balance");
    }

    let redemptionTransaction = null;

    // redemption transfer logic
    if (redeemedAmount > 0) {
        if (!transferAccountId) {
            throw new ValidationError("Missing transferAccountId for redemption");
        }

        const availableBalance = savingsAccount.runningBalance - redeemedAmount;

        if (availableBalance < 0) {
            // create interest transaction for the profit amount
            const interestAmount = Math.abs(availableBalance);
            await handleCreateSavingsTransaction(userId, {
                savingsId: savingsAccount._id,
                amount: interestAmount,
                type: "interest",
                date: accountCloseDate || new Date(),
                description: `Interest credited on closing of ${savingsAccount.accountName}`,
            })
        } else if (availableBalance > 0) {
            // if redeemed amount is less than available balance then create a loss transaction in savings transaction as loss
            const lossAmount = availableBalance;
            await handleCreateSavingsTransaction(userId, {
                savingsId: savingsAccount._id,
                amount: lossAmount,
                type: "loss",
                date: accountCloseDate || new Date(),
                description: `Loss debited on closing of ${savingsAccount.accountName}`,
            })
        }

        redemptionTransaction = await handleCreateSavingsTransaction(userId, {
            savingsId: savingsAccount._id,
            amount: redeemedAmount,
            type: "redemption",
            date: accountCloseDate || new Date(),
            description: `Redeemed ₹${redeemedAmount} from ${savingsAccount.accountName}`,
        });
    } else if (redeemedAmount === 0 && savingsAccount.runningBalance > 0) {
        throw new ValidationError("Redeemed amount must be greater than zero to close account with non-zero balance");
    }
    // close the savings account
    savingsAccount.runningBalance = 0;
    savingsAccount.status = "closed";
    savingsAccount.closedAt = accountCloseDate || new Date();
    await savingsAccount.save();

    return {
        message: "Savings account closed successfully",
        savingsAccount,
        redemptionTransaction,
    };
}