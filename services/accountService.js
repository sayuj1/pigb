// import Account from "@/models/AccountSchema";
import { formatAccountPayload } from "@/utils/backend/dataFormatter";
import { validateAccountData } from "@/utils/backend/validations";
import { NotFoundError } from "../utils/backend/error";
import { accountRepository } from "../repositories/AccountRepository";
import { transactionRepository } from "../repositories/TransactionRepository"; // assume you have one

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

export const checkDuplicateAccount = async (userId, name) => {
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
  await checkDuplicateAccount(userId, data.name);

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
  const {
    name,
    type,
    initialBalance: newInitialBalance,
    creditLimit,
    dueDate,
    icon,
    iconColor,
  } = updates;

  const account = await accountRepository.findByIdAndUser(id, userId);
  if (!account) {
    throw new Error("Account not found");
  }

  // Check for name conflict if name is changing
  if (name && name !== account.name) {
    const existing = await accountRepository.findByNameAndUser(userId, name);
    if (existing) {
      const err = new Error("Account with this name already exists.");
      err.statusCode = 400;
      throw err;
    }
  }

  // Apply updates
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

  // Balance update logic
  if (
    newInitialBalance !== undefined &&
    newInitialBalance !== account.initialBalance
  ) {
    const transactions = await transactionRepository.findByAccountId(
      account._id
    );

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
  }

  await accountRepository.save(account);

  return account;
};
