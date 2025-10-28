import { isNumericRow, parseAmount } from '@/utils/backend/numberUtils'

export function parseIcici(rows) {
    const transactions = [];
    let pending = null;
    let stopAppending = false;

    for (const row of rows) {
        const isTransactionRow = /^\d{2}-\d{2}-\d{4}/.test(row[0]);

        if (isTransactionRow) {
            // Push previous if exists
            if (pending) {
                transactions.push(pending);
            }

            const [date, descPart, drCr] = row;
            pending = {
                date,
                description: descPart || '',
                amount: null,
                type: drCr?.toUpperCase() === 'CR' ? 'income' : 'expense',
            };
            stopAppending = false;
        } else if (pending && !stopAppending) {
            console.log("joined ", row)
            const joined = row.join(" ").trim();

            if (
                joined.includes("This is a system-generated statement.") ||
                isNumericRow(row)
            ) {
                stopAppending = true;
                continue;
            }

            // Detect amount in this row
            const maybeAmount = row.find((v) => /^[\d,]+\.\d{2}$/.test(v));
            if (maybeAmount && !pending.amount) {
                pending.amount = parseAmount(maybeAmount);
                pending.description += row[0];
            } else {
                // Append to description
                pending.description += " " + joined;
            }



        }
    }

    if (pending) {
        transactions.push(pending);
    }

    return transactions;
}


