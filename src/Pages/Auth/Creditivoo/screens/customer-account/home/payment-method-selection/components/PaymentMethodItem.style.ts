import { StyleSheet, ViewStyle } from "react-native";

interface Style {
  card: ViewStyle;
  leftSide: ViewStyle;
  //   iconContainer: ViewStyle;
  //   textContainer: ViewStyle;
  button: ViewStyle;
  buttonInner: ViewStyle;
}

const createStyles = () => {
  return StyleSheet.create<Style>({
    card: {
      height: 61,
      width: "100%",
      borderWidth: 1,
      borderColor: "#E4E4E4",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 10,
      marginBottom: 10,
      borderRadius: 8,
    },
    leftSide: {
      flexDirection: "row",
      gap: 8,
    },
    // iconContainer: {
    //   alignItems: "center",
    //   justifyContent: "center",
    // },
    // textContainer: {
    //   justifyContent: "center",
    // },
    button: {
      width: 16,
      height: 16,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 8,
    },
    buttonInner: {
      width: 14,
      height: 14,
      borderRadius: 7,
      borderColor: "#fff",
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    },
  });
};

export default createStyles;
