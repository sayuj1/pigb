export function formatCurrency(
    amount,
    options = {}
) {
    const {
        currency = "INR",
        locale = "en-IN",
        minimumFractionDigits = 2,
        maximumFractionDigits = 2,
    } = options;

    const value = Number(amount ?? 0);
    if (isNaN(value)) return "₹0.00";

    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        minimumFractionDigits,
        maximumFractionDigits,
    }).format(value);
}
