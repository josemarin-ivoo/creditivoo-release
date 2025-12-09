import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { useTheme } from "@react-navigation/native";

const SingUpSuccessLogo: React.FC = () => {
  const theme = useTheme();
  const { colors } = theme;
  return (
    <View style={styles.container}>
      <Image
        source={
          colors.primary === "#F93B00"
            ? require("@assets/img/SingUpSuccessLogo.png")
            : require("@assets/img/SingUpSuccessLogo2.png")
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
    width: 274,
    height: 200.55,
    objectFit: "contain",
  },
});

export default SingUpSuccessLogo;
