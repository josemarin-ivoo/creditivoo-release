/**
 * Ivo Design System - Theme
 * Centralized theme configuration combining all design tokens
 */

import {IVOO_COLORS} from './colors';
import {IVOO_TYPOGRAPHY} from './typography';
import {IVOO_SPACING} from './spacing';
import {IVOO_SHADOWS} from './shadows';

/**
 * Complete Ivo theme object
 * This is the main export for all design system tokens
 */
export const IVOO_THEME = {
  colors: IVOO_COLORS,
  typography: IVOO_TYPOGRAPHY,
  spacing: IVOO_SPACING,
  shadows: IVOO_SHADOWS,
} as const;

/**
 * Type for the Ivo theme
 */
export type IvoTheme = typeof IVOO_THEME;

// Re-export individual modules for convenience
export {IVOO_COLORS} from './colors';
export {IVOO_TYPOGRAPHY, IVOO_TEXT_STYLES} from './typography';
export {IVOO_SPACING} from './spacing';
export {IVOO_SHADOWS, getShadowStyle} from './shadows';

