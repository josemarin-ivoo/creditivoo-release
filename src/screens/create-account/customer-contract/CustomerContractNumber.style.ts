//import type { ExtendedTheme } from "@react-navigation/native";
import { ExtendedTheme } from '@react-navigation/native';
import type { ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

interface Style {
  container: ViewStyle;
  title: ViewStyle;
  input: ViewStyle;
  errorContainer: ViewStyle;
  button: ViewStyle;
  suggestionsContainer: ViewStyle;
  suggestionTag: ViewStyle;
}

export default (theme: ExtendedTheme) => {
  const { colors } = theme;
  return StyleSheet.create<Style>({
    container: {
      flex: 1,
      padding: 12,
      //alignItems: "center",
      justifyContent: 'space-between',
    },
    title: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
      marginLeft: 1,
      gap: 10,
    },
    input: {
      marginTop: 10,
    },
    errorContainer: {
      position: 'relative',
      left: 4,
      bottom: 10,
    },
    button: {
      marginBottom: 5,
    },
    suggestionsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    suggestionTag: {
      padding: 8,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: colors.borderColor,
      marginVertical: 4,
      height: 37,
      minWidth: 107,
    },
  });
};
