import * as eva from '@eva-design/eva';
import { ThemeType } from '@ui-kitten/components';

/**
 * customTheme
 * Sobrescribe los tokens de color primarios de eva.light para usar la paleta verde de la app.
 *  - color-primary-500  → color normal del botón
 *  - color-primary-600  → color cuando el botón está presionado (active)
 */
export const customTheme: ThemeType = {
  ...eva.light,
  'color-primary-100': '#E9FBF0',
  'color-primary-200': '#BFF5D8',
  'color-primary-300': '#94EFC0',
  'color-primary-400': '#6AE8A8',
  'color-primary-500': '#32DD73', // Verde principal
  'color-primary-600': '#26BF64', // Verde para estado hover
  'color-primary-700': '#1CA155', // Verde para estado presionado
  'color-primary-800': '#158346',
  'color-primary-900': '#0F6537',
};
