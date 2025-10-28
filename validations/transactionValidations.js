export const validateCreateTransaction = (data) => {
    const errors = [];

    // accountId
    if (!data.accountId) {
        errors.push("accountId is required");
    }

    // type
    const validTypes = ["income", "expense", "transfer"];
    if (!data.type || !validTypes.includes(data.type)) {
        errors.push("type must be one of: income, expense, transfer");
    }

    // category
    if (!data.category || typeof data.category !== "string" || !data.category.trim()) {
        errors.push("category is required");
    }

    // amount
    if (typeof data.amount !== "number" || isNaN(data.amount) || data.amount <= 0) {
        errors.push("amount must be a positive number");
    }

    // billDate (optional)
    if (data.billDate && isNaN(new Date(data.billDate).getTime())) {
        errors.push("billDate must be a valid date or ISO string");
    }

    // description (optional)
    if (data.description && typeof data.description !== "string") {
        errors.push("description must be a string");
    }

    // source (optional)
    if (data.source && typeof data.source !== "string") {
        errors.push("source must be a string");
    }

    if (errors.length > 0) {
        const error = new Error(errors.join(", "));
        error.status = 400;
        throw error;
    }

    //  Return cleaned/normalized data
    return {
        accountId: data.accountId,
        type: data.type,
        category: data.category.trim(),
        amount: Number(data.amount),
        billDate: data.billDate ? new Date(data.billDate) : undefined,
        description: data.description?.trim() || "",
        source: data.source?.trim() || null,
    };
};

