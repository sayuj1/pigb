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
export const updateAccountBalance = async (transaction) => {
  try {
    const account = await accountRepository.findById(transaction.accountId);
    if (!account) {
      console.error("Account not found for ID:", transaction.accountId);
      return;
    }

    const { type, amount } = transaction;

    if (type === "income") {
      account.balance += amount;
    } else if (type === "expense") {
      account.balance -= amount;
    }


    await accountRepository.save(account);
  } catch (error) {
    console.error("Error updating account balance:", error);
  }
};
