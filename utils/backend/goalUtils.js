import Goal from "@/models/GoalSchema";

export const createGoal = async (data) => {
    return await Goal.create(data);
};

export const findGoalsByUserId = async (userId, options = {}) => {
    const { search, category, status, page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const query = { userId };
    if (search) {
        query.name = { $regex: search, $options: "i" };
    }
    if (category && category !== "All") {
        query.category = category;
    }
    if (status && status !== "All") {
        query.status = status;
    }

    const [goals, total] = await Promise.all([
        Goal.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
        Goal.countDocuments(query),
    ]);

    return { goals, total };
};

export const findGoalById = async (userId, goalId) => {
    return await Goal.findOne({ userId, _id: goalId });
};

export const deleteGoalById = async (userId, goalId) => {
    return await Goal.findOneAndDelete({ userId, _id: goalId });
};

export const updateGoalById = async (userId, goalId, updateData) => {
    return await Goal.findOneAndUpdate(
        { userId, _id: goalId },
        { $set: updateData },
        { new: true, runValidators: true }
    );
};
