export function parseSbi(text) {
    const lines = text.split('\n');
    const transactions = [];

    const regex = /^(\d{2}\/\d{2}\/\d{4})\s+(.*?)\s+(-?[\d,]+\.\d{2})$/;

    for (const line of lines) {
        const match = line.match(regex);
        if (match) {
            const [, date, description, amountStr] = match;
            const amount = parseFloat(amountStr.replace(/,/g, ''));
            transactions.push({
                date,
                description: description.trim(),
                amount,
                type: amount < 0 ? 'expense' : 'income',
                category: '',
            });
        }
    }

    return transactions;
}
