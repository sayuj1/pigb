import { ValidationError } from "@/utils/backend/error";

export const validateSavingsTransaction = (data) => {
    const errors = [];

    // savingsId
    if (!data.savingsId) {
        errors.push("savingsId is required");
    }

    // date
    if (!data.date || isNaN(Date.parse(data.date))) {
        errors.push("Valid date is required");
    }

    // amount
    if (typeof data.amount !== "number" || isNaN(data.amount) || data.amount < 0) {
        errors.push("amount must be a number and non-negative");
    }

    // type
    const validTypes = ["deposit", "withdrawal", "interest", "loss", "redemption"];
    if (!data.type || !validTypes.includes(data.type)) {
        errors.push(`type is required and must be one of: ${validTypes.join(", ")}`);
    }

    if (errors.length > 0) {
        throw new ValidationError(errors.join(", "));
    }

    return {
        ...data,
    };

};


