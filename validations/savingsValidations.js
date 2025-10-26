import { ValidationError } from "@/utils/backend/error";

export const validateCreateSavings = (data) => {
    const errors = [];

    // accountName
    if (!data.accountName || typeof data.accountName !== "string" || !data.accountName.trim()) {
        errors.push("accountName is required");
    }

    // savingsType
    if (!data.savingsType || typeof data.savingsType !== "string" || !data.savingsType.trim()) {
        errors.push("savingsType is required");
    }

    // amount
    if (typeof data.amount !== "number" || isNaN(data.amount) || data.amount < 0) {
        errors.push("amount must be a number and non-negative");
    }
    if (errors.length > 0) {
        throw new ValidationError(errors.join(", "));
    }

    return {
        accountName: data.accountName.trim(),
        savingsType: data.savingsType.trim(),
        amount: Number(data.amount),
        ...data,
    };

};


