import { createTransaction, findTransactionByAccountId } from "@/repositories/TransactionRepository";
import { invalidateCache } from "@/lib/cache";
import { validateCreateTransaction } from "@/validations/transactionValidations";
import { updateAccountBalance } from "@/utils/backend/accountUtils";
import { addExpenseToBudget, removeExpenseFromBudget } from "@/utils/backend/budgetUtils";
import { deleteTransactionById, findTransactionById } from "@/utils/backend/transactionUtils";

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

export const handleDeleteTransaction = async (userId, transactionId) => {
  if (!transactionId) {
    const error = new Error("Transaction ID is required");
    error.status = 400;
    throw error;
  }

  // Find the transaction to know how to rollback its effects
  const existingTransaction = await findTransactionById(transactionId);
  console.log("Existing Transaction:", existingTransaction, existingTransaction.userId);

  if (!existingTransaction || existingTransaction.userId.toString() !== userId.toString()) {
    const error = new Error("Transaction not found");
    error.status = 404;
    throw error;
  }

  // Delete the transaction
  const deletedTransaction = await deleteTransactionById(userId, transactionId);

  if (!deletedTransaction) {
    const error = new Error("Transaction not found");
    error.status = 404;
    throw error;
  }

  await updateAccountBalance(existingTransaction, "deleteTransaction");
  if (existingTransaction.type === "expense") {
    await removeExpenseFromBudget(existingTransaction._id);
  }

  // Invalidate cache after deletion
  await invalidateCache({
    model: "transaction",
    action: "onDelete",
    data: { userId },
  });

  return {
    message: "Transaction deleted successfully",
    deletedTransaction,
  };


}
