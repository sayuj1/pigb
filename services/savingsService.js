import { createSavings } from "@/utils/backend/savingsUtils";
import { validateCreateSavings } from "@/validations/savingsValidations";

export const handleCreateSavings = async (userId, data) => {
    const validateSavingsData = validateCreateSavings(data);
    const savings = await createSavings({
        userId,
        ...validateSavingsData,
        runningBalance: validateSavingsData.amount, // Initial balance
    });

    return savings;

};