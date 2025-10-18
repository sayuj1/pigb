import { createTransaction, findTransactionByAccountId } from "@/repositories/TransactionRepository";
import { invalidateCache } from "@/lib/cache";
import { validateCreateTransaction } from "@/validations/transactionValidations";

export const handleCreateTransaction = async (userId, data) => {
  const validatedData = validateCreateTransaction(data);

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

  return transaction;
};

export const getTransactionsByAccountId = async (accountId) => {
  return await findTransactionByAccountId(accountId);
};
