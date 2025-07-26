import { z } from "zod";

export const CreateTransactionSchema = z.object({
    accountId: z.string().min(1, "accountId is required"),
    type: z.enum(["income", "expense", "transfer"], {
        required_error: "type is required",
    }),
    category: z.string().min(1, "category is required"),
    amount: z.number().positive("amount must be a positive number"),
    billDate: z.union([z.string(), z.date()]).optional(), // support ISO string or Date
    description: z.string().optional(),
    source: z.string().nullable().optional(),
});
