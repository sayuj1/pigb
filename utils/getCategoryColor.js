const colorMap = [
  "border-blue-500",
  "border-green-500",
  "border-red-500",
  "border-yellow-500",
  "border-purple-500",
  "border-pink-500",
  "border-indigo-500",
  "border-teal-500",
];

/**
 * Get a consistent color class based on a string (like category name).
 * It handles emojis by skipping non-letter characters if needed.
 */
export function getCategoryColor(savingsType = "") {
  // console.log(savingsType);
  // Extract just the name part (assumes format: "🏦 Emergency Fund")
  const words = savingsType.split(" ");
  const base = words.length > 1 ? words.slice(1).join(" ") : savingsType;

  // Simple hashing using character codes (ignores emojis)
  const hash = Array.from(base).reduce(
    (acc, char) => acc + char.charCodeAt(0),
    0
  );

  const index = hash % colorMap.length;
  // console.log("index", index);
  return colorMap[index];
}
