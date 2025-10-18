import { createTransaction, findTransactionByAccountId } from "@/repositories/TransactionRepository";
import { invalidateCache } from "@/lib/cache";
import { validateCreateTransaction } from "@/validations/transactionValidations";
import { updateAccountBalance } from "@/utils/backend/accountUtils";
import { addExpenseToBudget } from "@/utils/backend/budgetUtils";

export const handleCreateTransaction = async (userId, data) => {
  const validatedData = validateCreateTransaction(data);

  const transaction = await createTransaction({
    userId,
    ...validatedData,
    date: validatedData.billDate || Date.now(),
  });

  await updateAccountBalance(transaction, "addTransaction");

  if (transaction.type === "expense") {
    await addExpenseToBudget(
      transaction.userId,
      transaction.category,
      transaction.date,
      transaction.amount,
      transaction._id,
      transaction.description
    );
  }

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
