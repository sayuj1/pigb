import { isNumericRow, parseAmount } from '@/utils/backend/numberUtils'

export function parseAxis(rows) {
    const transactions = [];
    let pending = null;
    let stopAppending = false;

    for (const row of rows) {

        const isTransactionRow = /^\d{2}-\d{2}-\d{4}/.test(row[0]);

        if (isTransactionRow) {
            // Push previous transaction
            if (pending) {
                transactions.push(pending);
            }

            const [date, ...rest] = row;

            const debit = parseAmount(rest.at(-3));
            const credit = parseAmount(rest.at(-4));
            const description = rest.slice(0, 1).join(" ").trim()

            pending = {
                date,
                description,
                debit,
                credit,
                amount: debit || credit,
                type: "expense",
            };
            stopAppending = false;
        } else if (pending && !stopAppending) {
            const joined = row.join(" ").trim().toUpperCase();

            if (
                joined.includes("TRANSACTION TOTAL") ||
                isNumericRow(row)
            ) {
                stopAppending = true;
                continue;
            }

            pending.description = " " + row.join(" ").trim() + pending.description;
        }
    }

    if (pending) {
        transactions.push(pending);
    }

    return transactions
}

