import type { ExtendedTheme } from "@react-navigation/native";
import { StyleSheet, ViewStyle } from "react-native";

interface Style {
  dropdownItemContainer: ViewStyle;
  paymentCutItem: ViewStyle;
}

export default (theme: ExtendedTheme) => {
  const { colors } = theme;
  return StyleSheet.create<Style>({
    dropdownItemContainer: {
      paddingVertical: 4,
    },
    paymentCutItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingBottom: 1,
      marginLeft: 12,
      marginRight: 24,
    },
  });
};
