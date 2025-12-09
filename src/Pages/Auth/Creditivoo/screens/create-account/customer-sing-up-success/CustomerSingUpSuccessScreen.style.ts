//import type { ExtendedTheme } from "@react-navigation/native";
import type { ViewStyle } from "react-native";
import { StyleSheet } from "react-native";

interface Style {
  container: ViewStyle;
  textTitle: ViewStyle;
  textSubtitle: ViewStyle;
  button: ViewStyle;
}

export default (/*theme: ExtendedTheme*/) => {
  //const { colors } = theme;
  return StyleSheet.create<Style>({
    container: {
      flex: 1,
      padding: 12,
      marginTop: 84,
    },
    textTitle: {
      marginTop: 25,
    },
    textSubtitle: {
      marginTop: 5,
      marginHorizontal: 60,
    },
    button: {
      marginTop: 155,
    },
  });
};
