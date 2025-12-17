/**
 * Ivo Design System - Colors
 * Based on Figma design tokens
 */

export const IVOO_COLORS = {
  // Primary Colors
  primary: '#0ADD73', // Main brand green from Figma
  primaryDark: '#08B85C',
  primaryLight: '#32DD73',

  // Neutral Colors
  white: '#FFFFFF',
  black: '#000000',
  textWhite: '#FFFFFF',

  // Status Colors
  success: '#0ADD73',
  error: '#FF3B30',
  warning: '#FF9500',
  info: '#007AFF',

  // Background Colors
  background: '#FFFFFF',
  backgroundSecondary: '#F5F5F5',

  // Text Colors
  textPrimary: '#000000',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textInverse: '#FFFFFF',

  // Border Colors
  border: '#E5E5E5',
  borderLight: '#F0F0F0',

  // Gray Colors
  grayLight: '#ECECEC',
  grayMedium: '#B3B3B3',
  grayDark: '#333333',
} as const;

export type IvoColor = (typeof IVOO_COLORS)[keyof typeof IVOO_COLORS];
