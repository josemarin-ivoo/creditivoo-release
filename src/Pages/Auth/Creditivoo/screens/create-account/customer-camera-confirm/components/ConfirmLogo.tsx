import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { useTheme } from "@react-navigation/native";

const ConfirmLogo: React.FC = () => {
  const theme = useTheme();
  const { colors } = theme;
  return (
    <View style={styles.container}>
      <Image
        source={
          colors.primary === "#F93B00"
            ? require("@assets/img/ConfirmLogo.png")
            : require("@assets/img/ConfirmLogo2.png")
        }
        style={styles.logo}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 80,
    //borderColor: "#000",
    //borderWidth: 0,
  },
  logo: {
    width: 187.69,
    height: 190.51,
    objectFit: "contain",
  },
});

export default ConfirmLogo;
