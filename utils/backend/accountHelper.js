import Account from "@/models/AccountSchema";

/**
 * Updates the balance or credit used of an account based on a transaction.
 *
 * For credit card accounts:
 * - Expenses increase the credit used, respecting the credit limit.
 * - Income decreases the credit used, but not below zero.
 *
 * For other account types:
 * - Income increases the balance.
 * - Expenses decrease the balance.
 *
 * @param {Object} transaction - The transaction object
 * @param {string} transaction.accountId - The ID of the account to update
 * @param {"income"|"expense"} transaction.type - The type of the transaction
 * @param {number} transaction.amount - The amount involved in the transaction
 *
 * @returns {Promise<void>} Resolves when the account balance has been updated and saved
 *
 * @throws Will log an error if the account cannot be found or if saving fails
 */
export const updateAccountBalance = async (transaction) => {
  try {
    const account = await Account.findById(transaction.accountId);
    if (!account) return;

    if (account.type === "credit card") {
      if (transaction.type === "expense") {
        if (account.creditUsed + transaction.amount > account.creditLimit) {
          console.error("Credit limit exceeded for account:", account.name);
          return;
        }
        account.creditUsed += transaction.amount;
      } else if (transaction.type === "income") {
        account.creditUsed = Math.max(
          0,
          account.creditUsed - transaction.amount
        );
      }
    } else {
      if (transaction.type === "income") {
        account.balance += transaction.amount;
      } else if (transaction.type === "expense") {
        account.balance -= transaction.amount;
      }
    }

    await account.save();
  } catch (error) {
    console.error("Error updating account balance:", error);
  }
};
