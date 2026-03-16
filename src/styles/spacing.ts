/**
 * Ivo Design System - Spacing
 * Based on Figma design tokens and common spacing scale
 */

export const IVOO_SPACING = {
  // Base spacing unit (4px)
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,

  // Specific spacing from Figma
  statusBarPadding: 24,
  statusBarTop: 8,
  homeIndicatorBottom: 8,
  homeIndicatorWidth: 134,
  homeIndicatorHeight: 5,
  homeIndicatorMargin: -67, // Half of width for centering

  // Component specific spacing
  buttonPadding: 12,
  buttonBorderRadius: 20,
  cardBorderRadius: 8,
  homeIndicatorBorderRadius: 100,

  // Screen specific measurements
  statusBarHeight: 44,
  connectionsWidth: 68,
  connectionsHeight: 16,
  logoWidth: 300,
  logoHeight: 46,
  illustrationWidth: 217,
  illustrationHeight: 179,
  buttonWidth: 316,
} as const;

