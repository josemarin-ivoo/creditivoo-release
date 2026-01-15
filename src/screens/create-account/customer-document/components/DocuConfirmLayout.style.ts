import type { ViewStyle } from "react-native";
import { StyleSheet } from "react-native";

interface Style {
  textContainer: ViewStyle;
  continueButton: ViewStyle;
  goBackText: ViewStyle;
}

export default (/*theme: ExtendedTheme*/) => {
  //const { colors } = theme;
  return StyleSheet.create<Style>({
    textContainer: {
      marginTop: 35,
    },
    continueButton: {
      marginTop: 25,
    },
    goBackText: {
      marginTop: 12,
      marginBottom: 36,
    },
  });
};
