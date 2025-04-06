import Account from "@/models/AccountSchema";
import moment from "moment";

// Function to reset the credit usage after the due date
async function resetCreditLimit() {
  const currentDate = moment().toDate();

  const accounts = await Account.find({ type: "credit card" });

  accounts.forEach(async (account) => {
    // If the current date is past the due date, reset credit used
    if (moment(currentDate).isAfter(account.dueDate)) {
      account.creditUsed = 0; // Reset usage
      account.dueDate = moment().add(1, 'month').toDate(); // Update the due date to the next month (or whatever frequency you set)
      await account.save();
      console.log(`Credit usage for account ${account.name} has been reset.`);
    }
  });
}

export default resetCreditLimit;