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
