import { ValidationError } from "@/utils/backend/error";

export const validateGoalData = (data) => {
    const errors = [];

    if (!data.name || typeof data.name !== "string" || !data.name.trim()) {
        errors.push("Name is required");
    }

    if (typeof data.targetAmount !== "number" || isNaN(data.targetAmount) || data.targetAmount <= 0) {
        errors.push("Target amount must be a positive number");
    }

    if (data.currentAmount !== undefined && (typeof data.currentAmount !== "number" || isNaN(data.currentAmount) || data.currentAmount < 0)) {
        errors.push("Current amount must be a non-negative number");
    }

    if (!data.deadline || isNaN(Date.parse(data.deadline))) {
        errors.push("A valid deadline date is required");
    } else if (new Date(data.deadline) < new Date().setHours(0, 0, 0, 0)) {
        errors.push("Deadline cannot be in the past");
    }

    if (data.status && !["pending", "completed"].includes(data.status)) {
        errors.push("Invalid status");
    }

    if (errors.length > 0) {
        throw new ValidationError(errors.join(", "));
    }

    return {
        ...data,
        name: data.name ? data.name.trim() : undefined,
        category: data.category ? data.category.trim() : "General",
    };
};
