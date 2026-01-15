//import type { ExtendedTheme } from "@react-navigation/native";
import type { ViewStyle } from "react-native";
import { StyleSheet } from "react-native";

interface Style {
  container: ViewStyle;
  textContainer: ViewStyle;
  button: ViewStyle;
}

export default (/*theme: ExtendedTheme*/) => {
  //const { colors } = theme;
  return StyleSheet.create<Style>({
    container: {
      flex: 1,
      padding: 12,
      position: "relative",
    },
    textContainer: {
      marginTop: 50,
      marginHorizontal: 24,
    },
    button: {
      marginTop: 170,
    },
  });
};
