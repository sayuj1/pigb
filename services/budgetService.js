import { createBudget, deleteBudgetById } from "@/utils/backend/budgetUtils";
import { ValidationError } from "@/utils/backend/error";
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
