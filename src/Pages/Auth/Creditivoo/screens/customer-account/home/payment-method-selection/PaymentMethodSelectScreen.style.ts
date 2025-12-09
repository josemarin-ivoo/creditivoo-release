import { StyleSheet, ViewStyle } from "react-native";
import { ExtendedTheme } from "@react-navigation/native";

interface Style {
  container: ViewStyle;
  deviceContainer: ViewStyle;
  detailTitle: ViewStyle;
  feeContainer: ViewStyle;
  totalContainer: ViewStyle;
  methodTitle: ViewStyle;
  button: ViewStyle;
}

export default (theme: ExtendedTheme) => {
  const { colors } = theme;
  return StyleSheet.create<Style>({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 12,
      justifyContent: "space-between",
    },
    deviceContainer: {
      marginTop: 15,
    },
    detailTitle: {
      marginVertical: 12,
    },
    feeContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    totalContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 3,
    },
    methodTitle: {
      marginTop: 24,
      marginBottom: 18,
    },
    button: {
      marginBottom: 36,
    },
  });
};
