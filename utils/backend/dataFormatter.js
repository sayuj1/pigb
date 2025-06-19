/**
 * Returns properly shaped payload for account creation based on type.
 */
export const formatAccountPayload = (userId, data) => {
  const {
    name,
    type,
    balance,
    creditLimit,
    creditUsed,
    dueDate,
    iconColor,
    icon,
  } = data;

  return {
    userId,
    name,
    type,
    balance: type === "credit card" ? 0 : balance,
    initialBalance: type === "credit card" ? 0 : balance,
    creditLimit: type === "credit card" ? creditLimit || 5000 : undefined,
    creditUsed: type === "credit card" ? creditUsed : undefined,
    dueDate: type === "credit card" ? dueDate : undefined,
    icon,
    color: iconColor,
  };
};
