/**
 * format.js - Number formatting utilities
 * Currency and amount formatting with locale support
 */

// ============================================
// NUMBER FORMATTING
// ============================================

/**
 * Format an amount with currency symbol and locale formatting
 * @param {number} amount - The amount to format
 * @param {Object} options - Formatting options
 * @param {Object} options.currency - Currency object with symbol property
 * @param {boolean} options.useEUFormat - Use EU number format (. for thousands, , for decimal)
 * @param {boolean} options.hideDecimals - Round to whole numbers
 * @param {boolean} [options.showSymbol=true] - Include currency symbol
 * @returns {string}
 */
export const formatAmount = (amount, { currency, useEUFormat, hideDecimals, showSymbol = true }) => {
  let formatted;
  
  if (hideDecimals) {
    const rounded = Math.round(amount);
    const parts = rounded.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, useEUFormat ? '.' : ',');
    formatted = parts[0];
  } else {
    const fixed = amount.toFixed(2);
    const parts = fixed.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, useEUFormat ? '.' : ',');
    formatted = useEUFormat ? `${parts[0]},${parts[1]}` : `${parts[0]}.${parts[1]}`;
  }
  
  return showSymbol ? `${currency.symbol}${formatted}` : formatted;
};

/**
 * Format a large amount, returning separate parts for styled display
 * @param {number} amount - The amount to format
 * @param {Object} options - Formatting options
 * @param {boolean} options.useEUFormat - Use EU number format
 * @param {boolean} options.hideDecimals - Round to whole numbers
 * @returns {{ whole: string, decimal: string|null, separator: string|null }}
 */
export const formatLargeAmount = (amount, { useEUFormat, hideDecimals }) => {
  const rounded = Math.round(amount);
  const fixed = amount.toFixed(2);
  const parts = fixed.split('.');
  
  let whole = hideDecimals ? rounded.toString() : parts[0];
  whole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, useEUFormat ? '.' : ',');
  
  if (hideDecimals) {
    return { whole, decimal: null, separator: null };
  }
  
  return { whole, decimal: parts[1], separator: useEUFormat ? ',' : '.' };
};
