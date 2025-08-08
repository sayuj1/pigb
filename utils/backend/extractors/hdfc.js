import { isNumericRow, parseAmount } from '@/utils/backend/numberUtils'
import { ddmmyyToDDMMYYYY } from '@/utils/dateFormatter';

export function parseHdfc(rows) {
    // console.log("reach ", rows)
    const transactions = [];
    let pending = null;
    let stopAppending = false;

    for (const row of rows) {

        const isTransactionRow = /^\d{2}[/]\d{2}[/]\d{2}/.test(row[0]);

        if (isTransactionRow) {
            // Push previous transaction
            if (pending) {
                transactions.push(pending);
            }
            const rowSize = row?.length;
            const date = row[0];
            const debit = parseAmount(row[rowSize - 2])
            const description = row.slice(1, rowSize - 4).join(" ").trim()

            pending = {
                date: ddmmyyToDDMMYYYY(date),
                description,
                amount: debit,
                type: "expense",
            };

            stopAppending = false;
        }
        else if (pending && !stopAppending) {
            const joined = row.join(" ").trim().toUpperCase();

            if (
                joined.includes("STATEMENT SUMMARY") ||
                isNumericRow(row)
            ) {
                stopAppending = true;
                continue;
            }

            pending.description += " " + row.join(" ").trim();
        }
    }
    if (pending) {
        transactions.push(pending);
    }

    return transactions
}
