/**
 * Validates required fields for special account types like credit cards.
 * @throws Will throw an error if validation fails.
 */
export const validateAccountData = (type, data) => {
  if (type === "credit card") {
    if (!data.creditLimit || !data.dueDate) {
      throw new Error(
        "Credit limit and due date are required for credit card accounts."
      );
    }
  }
};
