/**
 * Generates a default description based on savings transaction type.
 * @param {Object} params
 * @param {string} params.type - Type of transaction: deposit, withdrawal, interest
 * @param {string} params.savingsName - Name of the savings account
 * @returns {string}
 */
export function generateSavingsDescription({ type, savingsName }) {
    switch (type) {
        case "withdrawal":
            return `Withdrawal from savings (${savingsName})`;
        case "deposit":
            return `Deposit to savings (${savingsName})`;
        case "interest":
            return `Interest credited to savings (${savingsName})`;
        default:
            return `Savings transaction (${savingsName})`;
    }
}


