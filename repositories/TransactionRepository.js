import Transaction from "../models/TransactionSchema";
import { BaseRepository } from "./BaseRepository.js";

class TransactionRepository extends BaseRepository {
  constructor() {
    super(Transaction);
  }

  async findByAccountId(accountId) {
    return this.find({ accountId });
  }
}

export const transactionRepository = new TransactionRepository();
