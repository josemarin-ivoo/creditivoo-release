import { palette } from "@theme/themes";
import type { ViewStyle } from "react-native";
import { StyleSheet } from "react-native";

interface Style {
  paymentItemContainer: ViewStyle;
  paymentIconContainer: ViewStyle;
  paymentIcon: ViewStyle;
  paymentDetails: ViewStyle;
  subDetails: ViewStyle;
  amountContainer: ViewStyle;
  goToPay: ViewStyle;
  arrowIcon: ViewStyle;
}

const createStyles = (theme: any) => {
  const { colors }: { colors: typeof palette } = theme;

  return StyleSheet.create<Style>({
    paymentItemContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 12,
      marginLeft: 6,
      marginRight: 2,
    },
    paymentIconContainer: {
      width: 46,
      height: 46,
      borderRadius: 23, // Mitad del ancho/alto para hacer el contenedor circular
      backgroundColor: "#F1F0F0",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 10,
    },
    paymentIcon: {
      // marginRight: 10,
    },
    paymentDetails: {
      flex: 1,
      marginLeft: 10,
    },
    subDetails: {
      flexDirection: "row",
      gap: 28,
    },
    amountContainer: {
      gap: 2,
      // position: "relative",
      // left: 5,
      //flexDirection: "row",
    },
    goToPay: {
      flexDirection: "row",
      alignItems: "center",
      gap: 1,
      position: "relative",
      right: 8,
    },
    arrowIcon: { position: "relative", top: 2 },
  });
};

export default createStyles;
