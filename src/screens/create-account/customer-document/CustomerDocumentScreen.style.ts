//import type { ExtendedTheme } from "@react-navigation/native";
import { vh } from "@freakycoder/react-native-helpers";
import type { ViewStyle } from "react-native";
import { StyleSheet } from "react-native";
interface Style {
  container: ViewStyle;
  title: ViewStyle;
  input: ViewStyle;
  button: ViewStyle;
  mainTitleContainer: ViewStyle;
}

export default (/*theme: ExtendedTheme*/) => {
  //const { colors } = theme;
  return StyleSheet.create<Style>({
    container: {
      flex: 1,
      padding: 12,
      //justifyContent: "space-between",
    },
    mainTitleContainer: {
      position: "relative",
      bottom: 15,
    },
    title: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 14,
      marginLeft: 1,
      gap: 10,
    },
    input: {
      marginTop: 10,
    },
    button: {
      marginTop: 51 * vh,
    },
  });
};
