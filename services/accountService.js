import { formatAccountPayload } from "@/utils/backend/dataFormatter";
import { NotFoundError } from "../utils/backend/error";
import {
  applyAccountUpdates,
  checkAccountExists,
  createAccount,
  deleteAccountById,
  findAccountById,
  getAccountsByUserId,
  recalculateAccountBalance,
} from "@/utils/backend/accountUtils";
import { invalidateCache } from "@/lib/cache";
import { deleteAllTransactionsForAccount, findTransactionsByAccountId } from "@/utils/backend/transactionUtils";
import { removeTransactionsFromBudgets } from "@/utils/backend/budgetUtils";


export const handleFetchAccounts = async (userId) => {
  return await getAccountsByUserId(userId);
};


/**
 * Creates a new account after validations and formatting.
 * @param {string} userId - The ID of the user.
 * @param {Object} data - The account data to create.
 * @returns {Promise<Object>} The created account.
 */
export const handleCreateAccount = async (userId, data) => {
  await checkAccountExists(userId, data.name);

  const payload = formatAccountPayload(userId, data);
  const account = await createAccount(payload);

  await invalidateCache({
    model: "account",
    action: "onCreate",
    data: { userId },
  });

  return account;
};

export const handleDeleteAccount = async (id, userId) => {
  try {

    const account = await findAccountById(id, userId);
    if (!account) {
      throw new NotFoundError("Account not found");
    }

    await deleteAccountById(id, userId);

    // delete all transactions related to this account and remove transactions from budgets
    const deletedTransactions = await deleteAllTransactionsForAccount(id);

    if (deletedTransactions.length > 0) {
      await removeTransactionsFromBudgets(deletedTransactions);
    }

    await invalidateCache({
      model: "account",
      action: "onDelete",
      data: { userId },
    });
    return { message: "Account deleted successfully." };
  } catch (error) {
    console.log("Error in handleDeleteAccount: ", error);
    throw error;
  }

};

/**
 * Updates an account by ID for the given user.
 * Validates name conflicts, updates fields, and recalculates balance if needed.
 */
export const updateAccount = async (id, userId, updates) => {
  const account = await findAccountById(id, userId);

  if (updates.name && updates.name !== account.name) {
    await checkAccountExists(userId, updates.name);
  }

  applyAccountUpdates(account, updates);

  if (
    updates.initialBalance !== undefined &&
    updates.initialBalance !== account.initialBalance
  ) {
    const transactions = await findTransactionsByAccountId(account._id);
    recalculateAccountBalance(account, updates.initialBalance, transactions);
  }

  await account.save(account);

  await invalidateCache({
    model: "account",
    action: "onUpdate",
    data: { userId },
  });

  return account;
};
