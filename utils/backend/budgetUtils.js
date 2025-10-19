import BudgetSchema from "@/models/BudgetSchema";

export const addExpenseToBudget = async (
    userId,
    category,
    date,
    amount,
    transactionId,
    description
) => {
    return BudgetSchema.addExpense(userId, category, date, amount, transactionId, description);
};

export const removeExpenseFromBudget = async (transactionId) => {
    return BudgetSchema.removeExpense(transactionId);
}

export const updateExpenseInBudget = async (
    transactionId,
    newAmount
) => {
    BudgetSchema.updateExpenseAmount(transactionId, newAmount);
};

export const removeTransactionsFromBudgets = async (transactionIds) => {
    for (const tId of transactionIds) {
        await removeExpenseFromBudget(tId);
    }
}

export const createBudget = async (userId, budgetData) => {
    return BudgetSchema.createBudget(
        userId,
        budgetData.category,
        budgetData.startDate,
        budgetData.endDate,
        budgetData.limitAmount,
        budgetData.budgetName || ""
    );
};

export const deleteBudgetById = async (userId, budgetId) => {
    return BudgetSchema.findOneAndDelete({ _id: budgetId, userId });
}
