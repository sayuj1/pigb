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

// Format currency values for display (US Version)
export const formatUSCurrencyWithSuffix = (val) => {
    if (val < 1000) return val.toString();

    if (val < 999500) {
        return `${(val / 1000).toFixed(0)}k`;
    }

    if (val < 999500000) {
        return `${(val / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
    }

    return `${(val / 1000000000).toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1")}B`;
};

// Format currency values for display (Indian Version)
export const formatIndiaCurrencyWithSuffix = (val) => {
    if (val < 1000) return val.toString();
    if (val < 100000) return `${(val / 1000).toFixed(0)}k`;
    if (val < 10000000) return `${(val / 100000).toFixed(1).replace(/\.0$/, "")}L`; // Lakh
    if (val < 10000000000) return `${(val / 10000000).toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1")}Cr`; // Crore
    return `${(val / 10000000000).toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1")}Kharab`; // Very large values
};