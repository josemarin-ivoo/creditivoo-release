import type { ExtendedTheme } from '@react-navigation/native';
import type { ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

interface Style {
  inputContainer: ViewStyle;
  label: ViewStyle;
  inputWrapper: ViewStyle;
  input: ViewStyle;
  iconContainer: ViewStyle;
}

export default (theme: ExtendedTheme) => {
  const { colors } = theme;
  return StyleSheet.create<Style>({
    inputContainer: {
      marginBottom: 15,
      width: '100%',
    },
    label: {
      marginBottom: 5,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.borderColor,
      borderRadius: 4,
    },
    input: {
      flex: 1,
      padding: 10,
      color: colors.text,
    },
    iconContainer: {
      padding: 10,
    },
  });
};
