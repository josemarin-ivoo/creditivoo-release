/**
 * Ivo Design System - Shadows
 * Based on Figma design tokens
 */

import {Platform} from 'react-native';

/**
 * Shadow styles based on Figma design
 * React Native requires separate shadow styles for iOS and Android
 */
export const IVOO_SHADOWS = {
  // Button shadow from Figma: 0px 3.938px 3.938px 0px rgba(0,0,0,0.25)
  button: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3.938,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.938,
    elevation: 4, // Android
  },

  // Card shadow
  card: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Android
  },

  // Small shadow
  small: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2, // Android
  },

  // Large shadow
  large: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8, // Android
  },
} as const;

/**
 * Helper function to get shadow style based on platform
 */
export const getShadowStyle = (shadowType: keyof typeof IVOO_SHADOWS) => {
  if (Platform.OS === 'android') {
    return {
      elevation: IVOO_SHADOWS[shadowType].elevation,
    };
  }
  return {
    shadowColor: IVOO_SHADOWS[shadowType].shadowColor,
    shadowOffset: IVOO_SHADOWS[shadowType].shadowOffset,
    shadowOpacity: IVOO_SHADOWS[shadowType].shadowOpacity,
    shadowRadius: IVOO_SHADOWS[shadowType].shadowRadius,
  };
};

