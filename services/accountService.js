import { formatAccountPayload } from "@/utils/backend/dataFormatter";
import { validateAccountData } from "@/utils/backend/validations";
import { NotFoundError } from "../utils/backend/error";
import { accountRepository } from "../repositories/AccountRepository";
import {
  applyAccountUpdates,
  recalculateAccountBalance,
} from "@/utils/backend/accountUtils";
import { getTransactionsByAccountId } from "@/services/transactionService";

export const getAccountById = async (id, userId) => {
  const account = await accountRepository.findByIdAndUser(id, userId);
  if (!account) {
    throw new NotFoundError("Account not found");
  }
  return account;
};

export const fetchAccountsByUserId = async (userId) => {
  return await accountRepository.findByUserId(userId);
};

export const checkAccountExists = async (userId, name) => {
  const IS_ACCOUNT_FOUND = await accountRepository.findByNameAndUser(
    userId,
    name
  );
  if (IS_ACCOUNT_FOUND) {
    throw new Error("Account with this name already exists.");
  }
};

/**
 * Creates a new account after validations and formatting.
 * @param {string} userId - The ID of the user.
 * @param {Object} data - The account data to create.
 * @returns {Promise<Object>} The created account.
 */
export const createAccount = async (userId, data) => {
  validateAccountData(data?.type, data);
  await checkAccountExists(userId, data.name);

  const payload = formatAccountPayload(userId, data);
  const account = await accountRepository.create(payload);

  return account;
};

export const deleteAccountById = async (id, userId) => {
  await getAccountById(id, userId);
  await accountRepository.deleteByIdAndUser(id, userId);
  return { message: "Account deleted successfully." };
};

/**
 * Updates an account by ID for the given user.
 * Validates name conflicts, updates fields, and recalculates balance if needed.
 */
export const updateAccount = async (id, userId, updates) => {
  const account = await getAccountById(id, userId);

  if (updates.name && updates.name !== account.name) {
    await checkAccountExists(userId, updates.name);
  }

  applyAccountUpdates(account, updates);

  if (
    updates.initialBalance !== undefined &&
    updates.initialBalance !== account.initialBalance
  ) {
    const transactions = await getTransactionsByAccountId(account._id);
    recalculateAccountBalance(account, updates.initialBalance, transactions);
  }

  await accountRepository.save(account);

  return account;
};
