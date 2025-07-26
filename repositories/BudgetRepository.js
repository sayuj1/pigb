import Budget from "@/models/BudgetSchema";
import { BaseRepository } from "./BaseRepository";

const budgetRepo = new BaseRepository(Budget);

export const addExpenseToBudget = async (
    userId,
    category,
    date,
    amount,
    transactionId,
    description
) => {
    return Budget.addExpense(userId, category, date, amount, transactionId, description);
};

export default budgetRepo;
