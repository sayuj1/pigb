import { transactionRepository } from "../repositories/TransactionRepository";

export const getTransactionsByAccountId = async (accountId) => {
  return await transactionRepository.findByAccountId(accountId);
};
