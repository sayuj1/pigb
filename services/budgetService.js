import { addExpenseToBudget, createBudget, deleteBudgetById, findBudgetById, removeExpenseFromBudget } from "@/utils/backend/budgetUtils";
import { ValidationError } from "@/utils/backend/error";
import { findTransactionById, findTransactionsByCategoryAndDateRange } from "@/utils/backend/transactionUtils";
import { validateBudget } from "@/validations/budgetValidations";

export const handleCreateBudget = async (userId, budget) => {

    const validatedBudget = validateBudget(budget);

    const newBudget = await createBudget(userId, validatedBudget);
    return newBudget;
}

export const handleDeleteBudget = async (userId, budgetId) => {
    if (!budgetId) {
        throw new ValidationError("Budget ID is required");
    }
    const deletedBudget = await deleteBudgetById(userId, budgetId);

    if (!deletedBudget) {
        throw new ValidationError("Budget not found or unauthorized");
    }

    return {
        message: "Budget deleted successfully",
        deletedBudget,
    };
}

export const handleUpdateBudget = async (userId, budgetId, budgetData) => {
    if (!budgetId) {
        throw new ValidationError("Budget ID is required");
    }

    if (!userId) {
        throw new ValidationError("User ID is required");
    }

    const validatedBudget = validateBudget(budgetData);

    const existingBudget = await findBudgetById(userId, budgetId);

    if (!existingBudget) {
        throw new ValidationError("Budget not found or unauthorized");
    }

    const oldStartDate = existingBudget.startDate;
    const oldEndDate = existingBudget.endDate;
    const oldCategory = existingBudget.category;

    // Check if startDate, endDate, or category is being changed
    const startDateChanged =
        new Date(validatedBudget.startDate).getTime() !== new Date(oldStartDate).getTime();
    const endDateChanged =
        new Date(validatedBudget.endDate).getTime() !== new Date(oldEndDate).getTime();
    const categoryChanged = validatedBudget.category !== oldCategory;

    // 1. Remove transactions from the old budget if date range or category changes
    if (startDateChanged || endDateChanged || categoryChanged) {
        // Remove affected transactions from the old budget
        for (const transaction of existingBudget.transactions) {
            const transactionDetails = await findTransactionById(transaction.transactionId);

            // If transaction falls within the old budget's date range or category, remove it from the budget
            if (
                transactionDetails &&
                transactionDetails.date >= oldStartDate &&
                transactionDetails.date <= oldEndDate &&
                transactionDetails.category === oldCategory
            ) {
                await removeExpenseFromBudget(transaction.transactionId);
            }
        }
    }

    //2. Update the budget fields
    existingBudget.category = validatedBudget.category;
    existingBudget.limitAmount = validatedBudget.limitAmount;
    existingBudget.startDate = validatedBudget.startDate;
    existingBudget.endDate = validatedBudget.endDate;
    existingBudget.budgetName = validatedBudget.budgetName;

    //3. Save the updated budget
    await existingBudget.save();

    // 4. Add transactions back to the new budget
    if (startDateChanged || endDateChanged || categoryChanged) {
        // Find all transactions that match the new date range and category, and add them back
        const transactionsToAdd = await findTransactionsByCategoryAndDateRange(existingBudget.userId, existingBudget.category, existingBudget.startDate, existingBudget.endDate);

        for (const transaction of transactionsToAdd) {

            await addExpenseToBudget(
                existingBudget.userId,
                existingBudget.category,
                transaction.date,
                transaction.amount,
                transaction._id,
                transaction.description
            );
        }

    }



    return existingBudget;
}

