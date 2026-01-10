import GoalTransaction from "@/models/GoalTransactionSchema";

export const createGoalTransaction = async (data) => {
    return await GoalTransaction.create(data);
};

export const findTransactionsByGoalId = async (userId, goalId) => {
    return await GoalTransaction.find({ userId, goalId }).sort({ date: -1 });
};

export const deleteTransactionsByGoalId = async (userId, goalId) => {
    return await GoalTransaction.deleteMany({ userId, goalId });
};
