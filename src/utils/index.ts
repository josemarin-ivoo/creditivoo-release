import dayjs from 'dayjs';
import 'dayjs/locale/es';

dayjs.locale('es');

export const capitalizeFirstLetter = (str: string) => {
  return str && str.length ? str.charAt(0).toUpperCase() + str.slice(1) : str;
};

export const capitalizeWords = (str: string) => {
  if (!str) return str;
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const generateRandomNumber = (min: number, max: number) => {
  return Math.floor(min + Math.random() * (max + 1 - min));
};

// Helper function to get initials from user's name and lastname
export const getInitials = (name: string, lastname: string): string => {
  if (name && lastname) {
    return `${name.charAt(0)}${lastname.charAt(0)}`.toUpperCase();
  }
  return '';
};

//
export function truncateString(str: string, n: number) {
  return str.length > n ? str.slice(0, n - 1) + '...' : str;
}

export function truncateNumber(number: number, decimals: number) {
  const factor = Math.pow(10, decimals);
  return Math.floor(number * factor) / factor;
}

export {
  formatCurrency,
  formatCurrencyBs,
  getCurrencyFormatter,
} from './currencyFormatter';

export {useStatusBar} from './useStatusBar';

/**
 * Function to format a date in the "MMMM D" format.
 * @param {string} originalDate - Date in "YYYY-MM-DD" format.
 * @returns {string} - Formatted date in "MMMM D".
 */
export function formatDate(originalDate: string, dateFormat: string) {
  return dayjs(originalDate).format(dateFormat);
}

/**
 * Function to add days to a given date.
 * @param {string} originalDate - Date in "YYYY-MM-DD" format.
 * @param {number} daysToAdd - Number of days to add.
 * @param {string} dateFormat - Format of the resulting date.
 * @returns {string} - New date formatted as specified.
 */
export function addDays(
  originalDate: string,
  daysToAdd: number,
  dateFormat: string,
) {
  return dayjs(originalDate).add(daysToAdd, 'day').format(dateFormat);
}
