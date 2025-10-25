import SavingsSchema from "@/models/SavingsSchema";

export const createSavings = async (data) => {
    return await SavingsSchema.create(data);
};