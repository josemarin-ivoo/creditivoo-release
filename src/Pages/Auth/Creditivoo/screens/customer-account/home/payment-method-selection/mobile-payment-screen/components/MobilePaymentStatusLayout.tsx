import { StyleSheet, View } from "react-native";
import BigCheckSVG from "assets/svgs/home-screen/BigCheckSVG.svg";
import { useNavigation, useTheme } from "@react-navigation/native";
import React from "react";
import TextWrapper from "@shared-components/text-wrapper/TextWrapper";
import Button from "@shared-components/button/Button";
import Icon, { IconType } from "react-native-dynamic-vector-icons";
import { SCREENS } from "@shared-constants";

interface Props {
  successful: boolean;
  onClose: () => void;
}

const MobilePaymentStatusLayout: React.FC<Props> = ({
  successful = false,
  onClose,
}) => {
  const theme = useTheme();
  const { colors } = theme;
  const navigation = useNavigation();

  const handlePress = () => {
    if (successful) {
      navigation.navigate(SCREENS.HOME as never);
    } else {
      onClose();
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.infoLogo}>
        {successful ? (
          <BigCheckSVG width={88} height={88} />
        ) : (
          <Icon
            type={IconType.MaterialIcons}
            name="error-outline"
            color={colors.error}
            size={80}
          />
        )}
      </View>
      <TextWrapper fontSize={22} boldSora color={colors.totalBlack}>
        {successful ? "Pago exitoso" : "Pago  no verificado"}
      </TextWrapper>
      <View style={styles.infoContainer}>
        <TextWrapper fontSize={14} color="#666161" center>
          {successful
            ? "Su pago ha sido validado exitosamente!"
            : "Su pago no ha podido ser verificado con el banco emisor, intente nuevamente"}
        </TextWrapper>
      </View>
      <View style={styles.button}>
        <Button
          title={successful ? "Ir al inicio" : "Intentar nuevamente"}
          onPress={() => handlePress()}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 12,
  },
  infoLogo: {
    marginTop: 14,
    marginBottom: 4,
  },
  infoContainer: { marginTop: 16, marginBottom: 50, width: "70%" },
  button: {
    width: "100%",
  },
});

export default MobilePaymentStatusLayout;
