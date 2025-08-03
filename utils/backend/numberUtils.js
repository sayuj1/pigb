// Helper to safely parse amounts
export function parseAmount(value) {
    if (!value) return null;
    const cleaned = value.replace(/,/g, "").trim();
    const number = parseFloat(cleaned);
    return isNaN(number) ? null : number;
}

// Detect rows that contain only numeric-looking values (e.g., totals)
export function isNumericRow(row) {
    const nonEmpty = row.filter(cell => cell.trim() !== "");
    if (nonEmpty.length === 0) return false;

    return nonEmpty.every(cell => /^[\d,.]+$/.test(cell.trim()));
}