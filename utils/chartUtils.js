import { formatUSCurrencyWithSuffix } from "./formatCurrency";


/**
 * Calculates a negative horizontal offset (`dx`) value for positioning
 * a Y-axis label on the left side of a chart, based on the maximum
 * value in the data and its formatted string length.
 *
 * This helps avoid label collision with Y-axis tick values.
 *
 * @param {Array<Object>} data - The dataset used in the chart.
 * @param {string} field - The field name within each data object to extract numeric values from.
 * @returns {number} A negative offset value for left-side Y-axis label placement.
 *
 * @example
 * const dx = getDynamicDx(chartData, 'income'); // e.g., -37
 */
export const getDynamicDx = (data, field) => {
  const maxVal = Math.max(...data.map((item) => item[field] || 0));

  const digitCount = formatUSCurrencyWithSuffix(maxVal).toString().length;
  const offset = -12 - digitCount * 5;
  return offset;
};

/**
 * Calculates a positive horizontal offset (`dx`) value for positioning
 * a Y-axis label on the right side of a chart, based on the maximum
 * value in the data and its formatted string length.
 *
 * This helps maintain spacing between the label and tick values.
 *
 * @param {Array<Object>} data - The dataset used in the chart.
 * @param {string} field - The field name within each data object to extract numeric values from.
 * @returns {number} A positive offset value for right-side Y-axis label placement.
 *
 * @example
 * const dx = getSecondaryDynamicDx(chartData, 'expense'); // e.g., 34
 */
export const getSecondaryDynamicDx = (data, field) => {
  const maxSecondary = Math.max(...data.map((item) => item[field] || 0));

  const digitCount = formatUSCurrencyWithSuffix(maxSecondary).toString().length;
  const offset = 12 + digitCount * 4;
  return offset;
};
