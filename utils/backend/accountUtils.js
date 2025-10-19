import { accountRepository } from "@/repositories/AccountRepository";
/**
 * Applies the updates to the account instance
 */
export const applyAccountUpdates = (account, updates) => {
  const { name, type, creditLimit, dueDate, icon, iconColor } = updates;

  if (name) account.name = name;
  if (type) account.type = type;
  if (icon) account.icon = icon;
  if (iconColor) account.color = iconColor;

  if (creditLimit !== undefined && account.type === "credit card") {
    account.creditLimit = creditLimit;
  }

  if (dueDate !== undefined && account.type === "credit card") {
    account.dueDate = dueDate;
  }
};

/**
 * Recalculates account balance based on updated initial balance and existing transactions
 */
export const recalculateAccountBalance = (
  account,
  newInitialBalance,
  transactions
) => {
  account.initialBalance = newInitialBalance;

  if (transactions.length > 0) {
    const totalIncome = transactions
      .filter((txn) => txn.type === "income")
      .reduce((sum, txn) => sum + txn.amount, 0);

    const totalExpense = transactions
      .filter((txn) => txn.type === "expense")
      .reduce((sum, txn) => sum + txn.amount, 0);

    account.balance = newInitialBalance + totalIncome - totalExpense;
  } else {
    account.balance = newInitialBalance;
  }
};

/**
 * Updates the balance or credit used of an account based on a transaction.
 *
 * @param {Object} transaction - The transaction object
 * @param {string} transaction.accountId - The ID of the account to update
 * @param {"income"|"expense"} transaction.type - The type of the transaction
 * @param {number} transaction.amount - The amount involved in the transaction
 *
 * @returns {Promise<void>}
 */
export const updateAccountBalance = async (transaction, operation) => {
  try {
    const account = await accountRepository.findById(transaction.accountId);
    if (!account) {
      console.error("Account not found for ID:", transaction.accountId);
      return;
    }

    const { type, amount } = transaction;

    if (operation === "addTransaction") {
      if (type === "income") {
        account.balance += amount;
      } else if (type === "expense") {
        account.balance -= amount;
      }
    } else if (operation === "deleteTransaction") {
      if (type === "income") {
        account.balance -= amount;
      } else if (type === "expense") {
        account.balance += amount;
      }
    }

    await accountRepository.save(account);
  } catch (error) {
    console.error("Error updating account balance:", error);
  }
};

/**
 *  Reverses an old transaction’s balance effect and applies a new one.
 *
 * Useful for PUT/update handlers to ensure account balance stays accurate.
 *
 * @param {Object} oldTransaction - The previous transaction data
 * @param {Object} updatedTransaction - The new transaction data
 * @returns {Promise<void>}
 */
export const updateAccountBalanceOnEdit = async (oldTransaction, updatedTransaction) => {
  try {
    const account = await accountRepository.findById(updatedTransaction.accountId);
    if (!account) {
      const error = new Error("Account not found");
      error.status = 404;
      throw error;
    }

    // Reverse old transaction
    if (oldTransaction.type === "income") account.balance -= oldTransaction.amount;
    else if (oldTransaction.type === "expense") account.balance += oldTransaction.amount;

    // Apply new transaction
    if (updatedTransaction.type === "income") account.balance += updatedTransaction.amount;
    else if (updatedTransaction.type === "expense") account.balance -= updatedTransaction.amount;

    await accountRepository.save(account);
  } catch (error) {
    console.error("Error updating account balance on edit:", error);
    throw error;
  }
};