import { invalidateCache } from "@/lib/cache";
import { removeTransactionsFromBudgets } from "@/utils/backend/budgetUtils";
import { ValidationError } from "@/utils/backend/error";
import { createSavings, deleteAllTransactionsForSavingsAccount } from "@/utils/backend/savingsUtils";
import { validateCreateSavings } from "@/validations/savingsValidations";

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