import { createTransaction, findTransactionByAccountId } from "@/repositories/TransactionRepository";
import { addExpenseToBudget } from "@/repositories/BudgetRepository";
import { invalidateCache } from "@/lib/cache";
import { CreateTransactionSchema } from "@/validations/transaction.schema";
import { validateSchema } from "@/validations/validate";

export const handleCreateTransaction = async (userId, data) => {
  const validatedData = validateSchema(CreateTransactionSchema, data);

  const transaction = await createTransaction({
    userId,
    ...validatedData,
    date: validatedData.billDate || Date.now(),
  });

  await invalidateCache({
    model: "transaction",
    action: "onCreate",
    data: { userId, ...validatedData },
  });

  if (validatedData.type === "expense") {
    await addExpenseToBudget(
      userId,
      validatedData.category,
      transaction.date,
      transaction.amount,
      transaction._id,
      transaction.description
    );
  }

  return transaction;
};

export const getTransactionsByAccountId = async (accountId) => {
  return await findTransactionByAccountId(accountId);
};
