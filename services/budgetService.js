import { createBudget } from "@/utils/backend/budgetUtils";
import { validateBudget } from "@/validations/budgetValidations";

export const handleCreateBudget = async (userId, budget) => {

    const validatedBudget = validateBudget(budget);

    const newBudget = await createBudget(userId, validatedBudget);
    return newBudget;
}