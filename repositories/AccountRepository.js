import Account from "../models/AccountSchema";
import { BaseRepository } from "./BaseRepository.js";
// import mongoose from "mongoose";

class AccountRepository extends BaseRepository {
  constructor() {
    super(Account);
  }

  async findByUserId(userId) {
    return this.find({ userId });
  }

  async findByNameAndUser(userId, name) {
    return this.findOne({ userId, name });
  }

  async findByIdAndUser(id, userId) {
    return this.findOne({ _id: id, userId });
  }

  async deleteByIdAndUser(id, userId) {
    return this.findOneAndDelete({ _id: id, userId });
  }
}

export const accountRepository = new AccountRepository();
