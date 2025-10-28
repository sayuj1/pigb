/**
 * Truncate a string by words or characters.
 *
 * @param {string} text - The input string
 * @param {number} limit - Max words/characters before truncation  (default: 9)
 * @param {"words" | "chars"} by - Truncate by words or characters (default: "chars")
 * @returns {string} Truncated string with "..." if needed
 */
export const truncateText = (text, limit = 9, by = "chars") => {
    if (!text) return "";

    if (by === "chars") {
        return text.length > limit ? text.slice(0, limit) + "..." : text;
    }

    const words = text.split(" ");
    return words.length > limit ? words.slice(0, limit).join(" ") + "..." : text;
};

/**
 * Capitalize only the first letter of a string
 * @param {string} str
 * @returns {string}
 */
export function capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Capitalize the first letter of every word in a string
 * @param {string} str
 * @returns {string}
 */
export function capitalizeWords(str) {
    if (!str) return "";
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

export const shortenText = (text, len = 3) =>
    text && text.length > len ? text.slice(0, len) : text;

/**
 * Calculate a reasonable minWidth for a DataGrid column
 * based on character count.
 *
 * @param {number} charCount - Number of characters in the longest value/header.
 * @param {number} [charWidth=8] - Average pixel width per character.
 * @param {number} [padding=24] - Extra padding (cell padding, sort icon, etc).
 * @returns {number} minWidth in pixels
 */
export function calculateMinWidth(charCount, charWidth = 8, padding = 64) {
    return charCount * charWidth + padding;
}

/**
 * Converts an object key into a human-readable label.
 *
 * - Replaces underscores with spaces → `creative_format` → `creative format`
 * - Splits camelCase words → `startDate` → `start Date`
 * - Capitalizes each word → `creative format` → `Creative Format`
 *
 * Example:
 *   formatLabel("creative_format") → "Creative Format"
 *   formatLabel("startDate")       → "Start Date"
 *   formatLabel("delivery_budget") → "Delivery Budget"
 *
 * @param {string} key - The raw object key (snake_case or camelCase).
 * @returns {string} - A formatted label string.
 */
export const formatLabel = (key) => {
    if (!key) return "";
    return key
        .replace(/_/g, " ") // underscores → spaces
        .replace(/([a-z])([A-Z])/g, "$1 $2") // camelCase → space
        .replace(/\b\w/g, (c) => c.toUpperCase()); // capitalize each word
};
