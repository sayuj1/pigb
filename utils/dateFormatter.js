import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export function formatTransactionDates(transactions, fromDateFormat, toDateFormat) {
    return new Promise((resolve, reject) => {
        try {
            const formatted = transactions.map(txn => ({
                ...txn,
                date: dayjs(txn.date, fromDateFormat).format(toDateFormat),
            }));
            resolve(formatted);
        } catch (error) {
            reject(error);
        }
    });
}


export function formatTransactionsToUTC(transactions) {
    return new Promise((resolve, reject) => {
        try {
            const formatted = transactions.map(txn => ({
                ...txn,
                date: dayjs(txn.date).startOf("day").utc().format(),
            }));
            resolve(formatted);
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Converts a date string from "dd/mm/yy" to "dd-mm-yyyy".
 * Example: "07/08/25" → "07-08-2025"
 */
export function ddmmyyToDDMMYYYY(dateStr) {
    if (!dateStr || typeof dateStr !== "string") return "";

    const [day, month, year] = dateStr.split("/");
    if (!day || !month || !year) return "";

    // Ensure full 4-digit year (e.g., "24" -> "2024")
    const fullYear = parseInt(year, 10) < 50 ? `20${year}` : `19${year}`;

    return `${day}-${month}-${fullYear}`;
}