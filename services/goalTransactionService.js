import { createGoalTransaction, findTransactionsByGoalId } from "@/utils/backend/goalTransactionUtils";
import { updateGoalById, findGoalById } from "@/utils/backend/goalUtils";
import { ValidationError } from "@/utils/backend/error";

export const handleAddMoneyToGoal = async (userId, goalId, data) => {
    if (!goalId) {
        throw new ValidationError("Goal ID is required");
    }
    if (!data.amount || data.amount <= 0) {
        throw new ValidationError("Amount must be greater than zero");
    }

    const goal = await findGoalById(userId, goalId);
    if (!goal) {
        throw new ValidationError("Goal not found");
    }

    // Create transaction record
    const transaction = await createGoalTransaction({
        userId,
        goalId,
        amount: data.amount,
        description: data.description || `Added ₹${data.amount} to ${goal.name}`,
        date: data.date || new Date(),
    });

    // Update goal current amount
    const updatedGoal = await updateGoalById(userId, goalId, {
        currentAmount: goal.currentAmount + data.amount,
    });

    return { transaction, updatedGoal };
};

export const handleGetGoalHistory = async (userId, goalId) => {
    if (!goalId) {
        throw new ValidationError("Goal ID is required");
    }
    return await findTransactionsByGoalId(userId, goalId);
};
