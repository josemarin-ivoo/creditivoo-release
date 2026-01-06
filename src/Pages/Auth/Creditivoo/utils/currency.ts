import {ExchangeRate} from '../services/exchangeRate';

/**
 * Formatea un monto en USD
 */
export const formatCurrencyUsd = (amount: number): string => {
  return `$${Math.abs(amount).toFixed(2)}`;
};

/**
 * Formatea un monto en Bolívares (BS)
 */
export const formatCurrencyBs = (amount: number): string => {
  const formatter = new Intl.NumberFormat('es-VE', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `Bs. ${formatter.format(Math.abs(amount))}`;
};

/**
 * Convierte un monto de USD a BS usando la tasa de cambio
 *
 * @param usdAmount - Monto en USD
 * @param exchangeRate - Tasa de cambio (objeto ExchangeRate o número)
 * @returns Monto convertido a BS
 */
export const convertUsdToBs = (
  usdAmount: number,
  exchangeRate: ExchangeRate | number | null,
): number => {
  if (!exchangeRate) {
    return 0;
  }

  // La API devuelve rate como string, necesitamos parsearlo
  const rate =
    typeof exchangeRate === 'number'
      ? exchangeRate
      : parseFloat(exchangeRate.rate);

  if (isNaN(rate)) {
    console.warn('[convertUsdToBs] Tasa de cambio inválida:', exchangeRate);
    return 0;
  }

  return Math.abs(usdAmount) * rate;
};

/**
 * Formatea un monto según la moneda seleccionada
 *
 * @param amount - Monto en USD
 * @param currency - Moneda seleccionada ('USD' | 'BS')
 * @param exchangeRate - Tasa de cambio (opcional, solo necesario para BS)
 * @returns Monto formateado según la moneda
 */
export const formatAmountByCurrency = (
  amount: number,
  currency: 'USD' | 'BS',
  exchangeRate?: ExchangeRate | number | null,
): string => {
  if (currency === 'BS' && exchangeRate) {
    const bsAmount = convertUsdToBs(amount, exchangeRate);
    return formatCurrencyBs(bsAmount);
  }
  return formatCurrencyUsd(amount);
};

/**
 * Obtiene el monto convertido según la moneda seleccionada
 *
 * @param usdAmount - Monto en USD
 * @param currency - Moneda seleccionada ('USD' | 'BS')
 * @param exchangeRate - Tasa de cambio (opcional, solo necesario para BS)
 * @returns Monto convertido o el monto original en USD
 */
export const getAmountByCurrency = (
  usdAmount: number,
  currency: 'USD' | 'BS',
  exchangeRate?: ExchangeRate | number | null,
): number => {
  if (currency === 'BS' && exchangeRate) {
    return convertUsdToBs(usdAmount, exchangeRate);
  }
  return Math.abs(usdAmount);
};
