import TextWrapper from "@shared-components/text-wrapper/TextWrapper";
import * as React from "react";
import { View, StyleSheet } from "react-native";
import Icon, { IconType } from "react-native-dynamic-vector-icons";
import { useTheme } from "@react-navigation/native";
// eslint-disable-next-line max-len
import { RegisteredLayoutType } from "@screens/create-account/customer-email/components/user-registered-layout/UserRegisteredLayout";

interface RegisteredInfoProps {
  info: RegisteredLayoutType;
  email: string;
}

const infoTexts = {
  purchase: {
    title: "Compra en curso",
    description: "Ya existe una compra en curso",
  },
  device: {
    title: "Dispositivo ya registrado",
    description: "Este dispositivo ya está registrado",
  },
  user: {
    title: "Usuario ya registrado",
    description: "Ya existe un usuario registrado",
  },
};

const RegisteredInfo: React.FC<RegisteredInfoProps> = ({
  info,
  email = "test@gmail.com",
}) => {
  const theme = useTheme();
  const { colors } = theme;

  const { title, description } = infoTexts[info] || infoTexts.user;

  return (
    <>
      <View style={styles.header}>
        <Icon
          type={IconType.MaterialIcons}
          name="error-outline"
          color={colors.error}
          size={37}
        />
        <View>
          <TextWrapper fontSize={16}>{title}</TextWrapper>
          <TextWrapper fontSize={14} color={colors.itemSubtitle}>
            {email}
          </TextWrapper>
        </View>
      </View>
      <View style={styles.description}>
        <TextWrapper fontSize={14}>{description} para el email</TextWrapper>
        <TextWrapper fontSize={14} boldSora>
          {email}:
        </TextWrapper>
      </View>
    </>
  );
};

export default RegisteredInfo;

const styles = StyleSheet.create({
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
});
