//import type { ExtendedTheme } from "@react-navigation/native";
import type {ViewStyle} from 'react-native';
import {StyleSheet} from 'react-native';

interface Style {
  container: ViewStyle;
  accesoContainer: ViewStyle;
  textContainer: ViewStyle;
  errorContainer: ViewStyle;
  safeArea: ViewStyle;
  clickText: ViewStyle;
  registerText: ViewStyle;
  button: ViewStyle;
}

export default (/*theme: ExtendedTheme*/) => {
  //const { colors } = theme;
  return StyleSheet.create<Style>({
    container: {
      flex: 1,
    },
    safeArea: {
      flex: 1,
    },
    accesoContainer: {
      flex: 1,
      padding: 12,
    },
    textContainer: {
      marginTop: 30,
      marginBottom: 50,
      position: 'relative',
    },
    errorContainer: {
      position: 'relative',
      left: 4,
      bottom: 10,
    },
    clickText: {
      marginTop: 3,
    },
    registerText: {
      marginTop: 3,
      alignItems: 'flex-end',
    },
    button: {
      marginTop: 40,
    },
  });
};

