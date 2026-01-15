//import type { ExtendedTheme } from "@react-navigation/native";
import type { ViewStyle } from "react-native";
import { StyleSheet } from "react-native";

interface Style {
  container: ViewStyle;
  title: ViewStyle;
  input: ViewStyle;
  button: ViewStyle;
}

export default (/*theme: ExtendedTheme*/) => {
  //const { colors } = theme;
  return StyleSheet.create<Style>({
    container: {
      flex: 1,
      paddingHorizontal: 12,
      //alignItems: "center",
      justifyContent: "space-between",
    },
    title: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 12,
      marginBottom: 15,
      marginLeft: 1,
      gap: 10,
    },
    input: {
      marginTop: 10,
    },
    button: {
      marginBottom: 40,
    },
  });
};
