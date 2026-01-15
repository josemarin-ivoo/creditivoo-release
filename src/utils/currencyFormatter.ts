/**
 * Centralized currency formatter utility
 * Formats amounts to show "Ref" instead of dollar signs
 */

export const formatCurrency = (amount: string | number): string => {
  const numericAmount =
    typeof amount === 'string'
      ? parseFloat(amount.replace(/[^0-9.-]/g, ''))
      : amount;

  return `Ref ${new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount || 0)}`;
};

/**
 * Format currency for Bs (Bolivares)
 */
export const formatCurrencyBs = (amount: string | number): string => {
  const numericAmount =
    typeof amount === 'string'
      ? parseFloat(amount.replace(/[^0-9.-]/g, ''))
      : amount;

  const formatter = new Intl.NumberFormat('es-VE', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `Bs. ${formatter.format(numericAmount || 0)}`;
};

/**
 * Get the appropriate currency formatter based on currency type
 */
export const getCurrencyFormatter = (currency: 'USD' | 'VES' = 'USD') => {
  return currency === 'VES' ? formatCurrencyBs : formatCurrency;
};
