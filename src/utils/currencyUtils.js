// Exchange rate (simplified version - in a production app, this would be fetched from an API)
const EXCHANGE_RATES = {
  COP_TO_USD: 0.00025, // 1 COP = 0.00025 USD (example rate)
  USD_TO_COP: 4000     // 1 USD = 4000 COP (example rate)
};

/**
 * Converts an amount from one currency to another
 * @param {number} amount - The amount to convert
 * @param {string} fromCurrency - The source currency code (COP or USD)
 * @param {string} toCurrency - The target currency code (COP or USD)
 * @returns {number} - The converted amount
 */
export const convertCurrency = (amount, fromCurrency, toCurrency) => {
  // If currencies are the same, no conversion needed
  if (fromCurrency === toCurrency) {
    return amount;
  }
  
  // Convert from COP to USD
  if (fromCurrency === 'COP' && toCurrency === 'USD') {
    return amount * EXCHANGE_RATES.COP_TO_USD;
  }
  
  // Convert from USD to COP
  if (fromCurrency === 'USD' && toCurrency === 'COP') {
    return amount * EXCHANGE_RATES.USD_TO_COP;
  }
  
  // Return original amount if currencies are not supported
  return amount;
};

/**
 * Formats a number as currency
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency code (COP or USD)
 * @param {number} decimals - Number of decimal places (default based on currency)
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount, currency = 'COP', decimals = null) => {
  if (amount === undefined || amount === null) {
    return '-';
  }
  
  // Default decimals based on currency
  const defaultDecimals = currency === 'COP' ? 0 : 2;
  const fractionDigits = decimals !== null ? decimals : defaultDecimals;
  
  return amount.toLocaleString('es-CO', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  });
};
