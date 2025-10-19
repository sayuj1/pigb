export const validateBudget = (budget) => {
    const errors = [];

    // category
    if (!budget.category || typeof budget.category !== "string" || !budget.category.trim()) {
        errors.push("category is required");
    }
    // startDate
    if (!budget.startDate || isNaN(new Date(budget.startDate).getTime())) {
        errors.push("startDate must be a valid date or ISO string");
    }
    // endDate
    if (!budget.endDate || isNaN(new Date(budget.endDate).getTime())) {
        errors.push("endDate must be a valid date or ISO string");
    } else if (new Date(budget.endDate) < new Date(budget.startDate)) {
        errors.push("endDate must be after startDate");
    }
    // limitAmount
    if (typeof budget.limitAmount !== "number" || isNaN(budget.limitAmount) || budget.limitAmount <= 0) {
        errors.push("limitAmount must be a positive number");
    }
    // budgetName (optional)
    if (budget.budgetName && typeof budget.budgetName !== "string") {
        errors.push("budgetName must be a string");
    }

    if (errors.length > 0) {
        const error = new Error(errors.join(", "));
        error.status = 400;
        throw error;
    }

    // Return cleaned/normalized data
    return {
        category: budget.category.trim(),
        startDate: new Date(budget.startDate),
        endDate: new Date(budget.endDate),
        limitAmount: Number(budget.limitAmount),
        budgetName: budget.budgetName?.trim() || "",
    };
};