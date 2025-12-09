import type { ExtendedTheme } from "@react-navigation/native";
import { StyleSheet } from "react-native";

export default (theme: ExtendedTheme) => {
  const { colors } = theme;
  return StyleSheet.create({
    separator: {
      height: 1,
      backgroundColor: colors.separator,
    },
  });
};
