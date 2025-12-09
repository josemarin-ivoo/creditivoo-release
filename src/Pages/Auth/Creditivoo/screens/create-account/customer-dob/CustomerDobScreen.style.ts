import type { ViewStyle, TextStyle } from "react-native";
import { StyleSheet } from "react-native";
import fonts from "@fonts";
import { ExtendedTheme } from "@react-navigation/native";

interface Style {
  container: ViewStyle;
  title: ViewStyle;
  input: ViewStyle;
  button: ViewStyle;
  modalBackground: ViewStyle;
  datePickerContainer: ViewStyle;
  calendarTextStyle: TextStyle;
  headerTextContainerStyle: ViewStyle;
  headerTextStyle: TextStyle;
  headerButtonStyle: ViewStyle;
  monthContainerStyle: ViewStyle;
  weekDaysTextStyle: TextStyle;
  dayContainerStyle: ViewStyle;
}

export default (theme: ExtendedTheme) => {
  const { colors } = theme;
  return StyleSheet.create<Style>({
    container: {
      flex: 1,
      padding: 12,
      justifyContent: "space-between",
    },
    title: {
      flexDirection: "row",
      alignItems: "center",
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
    modalBackground: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    datePickerContainer: {
      backgroundColor: "#edeff6",
      padding: 20,
      marginHorizontal: 16,
      borderRadius: 25,
    },
    calendarTextStyle: {
      color: colors.text,
      fontFamily: fonts.sora.semiBold,
      fontSize: 16,
    },
    headerTextContainerStyle: {
      backgroundColor: "white",
      marginHorizontal: 2,
      paddingHorizontal: 10,
      borderRadius: 7,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 3,
    },
    headerTextStyle: {
      color: colors.text,
      fontFamily: fonts.sora.bold,
      fontSize: 20,
    },
    headerButtonStyle: {
      backgroundColor: "white",
      paddingHorizontal: 10,
      justifyContent: "center",
      alignItems: "center",
      width: 35,
      height: 35,
      borderRadius: 35 / 2,
    },
    monthContainerStyle: {
      backgroundColor: "white",
      borderRadius: 10,
    },
    weekDaysTextStyle: {
      color: colors.text,
      fontFamily: fonts.sora.regular,
      fontSize: 17,
    },
    dayContainerStyle: {
      borderRadius: 10,
      backgroundColor: "white",
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 3,
    },
  });
};
