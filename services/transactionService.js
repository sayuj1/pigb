import { invalidateCache } from "@/lib/cache";
import { validateCreateTransaction } from "@/validations/transactionValidations";
import { updateAccountBalance, updateAccountBalanceOnEdit } from "@/utils/backend/accountUtils";
import { addExpenseToBudget, removeExpenseFromBudget, updateExpenseInBudget } from "@/utils/backend/budgetUtils";
import { createTransaction, deleteTransactionById, findTransactionById, updateTransactionById } from "@/utils/backend/transactionUtils";

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

export const handleUpdateTransaction = async (userId, transactionId, transaction) => {
  if (!transactionId) {
    const error = new Error("Transaction ID is required");
    error.status = 400;
    throw error;
  }
  const { accountId, type, category, amount, date, description, source } = transaction;

  // Fetch the existing transaction before updating
  const oldTransaction = await findTransactionById(transactionId);
  if (!oldTransaction || oldTransaction.userId.toString() !== userId.toString()) {
    const error = new Error("Transaction not found");
    error.status = 404;
    throw error;
  }

  // Check if category or amount has changed
  const categoryChanged = oldTransaction.category !== category;
  const amountChanged = oldTransaction.amount !== amount;
  const typeChanged = oldTransaction.type !== type;


  const updatedTransaction = await updateTransactionById(userId, transactionId, {
    accountId,
    type,
    category,
    amount,
    date,
    description,
    source: source || null, // Default to null if not provided
  });

  if (!updatedTransaction) {
    const error = new Error("Failed to update transaction");
    error.status = 404;
    throw error;
  }

  // Handle budget updates if the transaction is an expense
  if (oldTransaction.type === "expense") {
    if (typeChanged || categoryChanged) {
      // If transaction type changes to income OR category changes, remove from old budget
      await removeExpenseFromBudget(oldTransaction._id);
      // Only re-add if it's still an expense (i.e., type didn't change to income)
      if (type === "expense") {
        await addExpenseToBudget(
          userId,
          category,
          date,
          amount,
          updatedTransaction._id,
          description
        );
      }
    } else if (amountChanged) {
      // If only the amount changed, update the existing budget entry
      await updateExpenseInBudget(oldTransaction._id, amount);
    }
  } else if (type === "expense") {
    // If it's a brand-new expense (wasn't an expense before), add it
    await addExpenseToBudget(
      userId,
      category,
      date,
      amount,
      updatedTransaction._id,
      description
    );
  }

  await updateAccountBalanceOnEdit(oldTransaction, updatedTransaction);

  // invalidate cache 
  await invalidateCache({
    model: "transaction",
    action: "onUpdate",
    data: { userId },
  });

  return updatedTransaction;
}


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
