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