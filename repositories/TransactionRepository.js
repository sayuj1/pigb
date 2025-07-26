import Transaction from "@/models/TransactionSchema";
import { BaseRepository } from "./BaseRepository";

const transactionRepo = new BaseRepository(Transaction);

export const createTransaction = async (data) => {
  return transactionRepo.create(data);
};

export const findTransactionByAccountId = async (accountId) => {
  return transactionRepo.find({ accountId });
}

export default transactionRepo;

