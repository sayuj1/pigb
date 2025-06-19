import { accountRepository } from "@/repositories/AccountRepository";

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

    if (account.type === "credit card") {
      if (type === "expense") {
        if (account.creditUsed + amount > account.creditLimit) {
          console.error("Credit limit exceeded for account:", account.name);
          return;
        }
        account.creditUsed += amount;
      } else if (type === "income") {
        account.creditUsed = Math.max(0, account.creditUsed - amount);
      }
    } else {
      if (type === "income") {
        account.balance += amount;
      } else if (type === "expense") {
        account.balance -= amount;
      }
    }

    await accountRepository.save(account);
  } catch (error) {
    console.error("Error updating account balance:", error);
  }
};
