import { validateGoalData } from "@/validations/goalValidations";
import {
    createGoal,
    deleteGoalById,
    findGoalById,
    findGoalsByUserId,
    updateGoalById,
} from "@/utils/backend/goalUtils";
import { deleteTransactionsByGoalId } from "@/utils/backend/goalTransactionUtils";
import { ValidationError } from "@/utils/backend/error";

export const handleCreateGoal = async (userId, data) => {
    const validatedData = validateGoalData(data);
    return await createGoal({ userId, ...validatedData });
};

export const handleGetGoals = async (userId, options) => {
    return await findGoalsByUserId(userId, options);
};

export const handleUpdateGoal = async (userId, goalId, data) => {
    if (!goalId) {
        throw new ValidationError("Goal ID is required");
    }
    const validatedData = validateGoalData(data);
    const updatedGoal = await updateGoalById(userId, goalId, validatedData);
    if (!updatedGoal) {
        throw new ValidationError("Goal not found");
    }
    return updatedGoal;
};

export const handleDeleteGoal = async (userId, goalId) => {
    if (!goalId) {
        throw new ValidationError("Goal ID is required");
    }
    // Delete related transactions first
    await deleteTransactionsByGoalId(userId, goalId);

    const deletedGoal = await deleteGoalById(userId, goalId);
    if (!deletedGoal) {
        throw new ValidationError("Goal not found");
    }
    return { message: "Goal deleted successfully" };
};
