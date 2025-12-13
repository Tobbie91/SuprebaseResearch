// lib/currencyUtils.js - Centralized currency utilities

export const CURRENCY_SYMBOLS = {
  NGN: "₦",
  USD: "$",
  EUR: "€",
  GBP: "£"
};

export const TOKEN_AMOUNTS = {
  NGN: 100000,
  USD: 500,
  EUR: 450,
  GBP: 400
};

export const getCurrencySymbol = (currencyCode) => {
  return CURRENCY_SYMBOLS[currencyCode] || CURRENCY_SYMBOLS.NGN;
};

export const getTokenAmount = (currencyCode) => {
  return TOKEN_AMOUNTS[currencyCode] || TOKEN_AMOUNTS.NGN;
};

export const formatCurrency = (amount, currencyCode) => {
  const symbol = getCurrencySymbol(currencyCode);
  return `${symbol}${amount.toLocaleString()}`;
};

export const getCurrencyConfig = (currencyCode) => {
  return {
    code: currencyCode,
    symbol: getCurrencySymbol(currencyCode),
    tokenAmount: getTokenAmount(currencyCode)
  };
};
