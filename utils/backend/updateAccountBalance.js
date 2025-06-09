import Account from "@/models/AccountSchema";

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
