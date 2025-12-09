/**
 * Ivo Design System - Typography
 * Based on Figma design tokens
 */

export const IVOO_TYPOGRAPHY = {
  // Font Families
  fonts: {
    inter: 'Inter',
    helvetica: 'Helvetica',
    inriaSans: 'Inria Sans',
    // Fallback to system fonts if custom fonts not loaded
    interBold: 'Inter-Bold',
    interSemiBold: 'Inter-SemiBold',
    interRegular: 'Inter-Regular',
    helveticaBold: 'Helvetica-Bold',
    inriaSansLight: 'Inria Sans-Light',
    inriaSansRegular: 'Inria Sans-Regular',
    inriaSansBold: 'Inria Sans-Bold',
  },

  // Font Sizes (in pixels, converted to numbers for React Native)
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17.72,
    lg: 20,
    xl: 26,
    '2xl': 32,
    '3xl': 40,
  },

  // Font Weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Letter Spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.23,
    wider: 0.5,
  },
} as const;

/**
 * Typography presets for common text styles
 */
export const IVOO_TEXT_STYLES = {
  // Status Bar Time
  statusBarTime: {
    fontSize: IVOO_TYPOGRAPHY.fontSize.base,
    fontFamily: IVOO_TYPOGRAPHY.fonts.helveticaBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    letterSpacing: IVOO_TYPOGRAPHY.letterSpacing.wide,
  },

  // Welcome Text
  welcomeText: {
    fontSize: IVOO_TYPOGRAPHY.fontSize.xl,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interSemiBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.semibold,
    lineHeight: 26,
  },

  // Button Text
  buttonText: {
    fontSize: IVOO_TYPOGRAPHY.fontSize.md,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    letterSpacing: 0.0591,
  },

  // Link Text
  linkText: {
    fontSize: IVOO_TYPOGRAPHY.fontSize.sm,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    lineHeight: 24,
  },
} as const;
