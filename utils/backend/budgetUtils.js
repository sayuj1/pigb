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