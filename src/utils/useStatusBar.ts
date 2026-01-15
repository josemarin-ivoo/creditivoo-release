import React from 'react';
import {StatusBar, StatusBarStyle} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';

interface UseStatusBarOptions {
  backgroundColor?: string;
  barStyle?: StatusBarStyle;
  translucent?: boolean;
}

/**
 * Hook para configurar la status bar que se adapta al color de fondo de la pantalla
 * @param options - Opciones de configuración de la status bar
 * @example
 * useStatusBar({
 *   backgroundColor: COLORS.white,
 * });
 */
export const useStatusBar = ({
  backgroundColor = '#FFFFFF',
  translucent = false,
}: UseStatusBarOptions = {}) => {
  useFocusEffect(
    React.useCallback(() => {
      StatusBar.setBackgroundColor(backgroundColor, true);
      if (translucent) {
        StatusBar.setTranslucent(true);
      }
    }, [backgroundColor, translucent]),
  );
};
