import { ExtendedTheme } from "@react-navigation/native";
import type { ViewStyle } from "react-native";
import { StyleSheet } from "react-native";

interface Style {
  container: ViewStyle;
  header: ViewStyle;
  description: ViewStyle;
  listContainer: ViewStyle;
  fieldContainer: ViewStyle;
  dataContainer: ViewStyle;
  detailContainer: ViewStyle;
  button: ViewStyle;
}

export default (theme: ExtendedTheme) => {
  const { colors } = theme;
  return StyleSheet.create<Style>({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginHorizontal: 6,
      marginTop: 4,
      marginBottom: 18,
      gap: 8,
    },
    description: {
      marginTop: 8,
      marginBottom: 16,
    },
    listContainer: {
      marginBottom: 18,
    },
    fieldContainer: {
      //marginVertical: 10,
      marginHorizontal: 6,
    },
    dataContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 16,
    },
    detailContainer: {
      marginLeft: 6,
    },
    button: {
      marginBottom: 12,
    },
  });
};
