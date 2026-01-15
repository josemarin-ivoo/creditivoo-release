import Button from "@shared-components/button/Button";
import React, { useMemo } from "react";
import { View } from "react-native";
import { useTheme } from "@react-navigation/native";
import createStyles from "./DocuConfirmLayout.style";
import TextWrapper from "@shared-components/text-wrapper/TextWrapper";
import { TouchableOpacity } from "@gorhom/bottom-sheet";

interface Props {
  handleCloseModal: () => void;
  handleContinue: () => void;
}

const DocuConfirmLayout: React.FC<Props> = ({
  handleCloseModal,
  handleContinue,
}) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(), []);

  return (
    <>
      <TextWrapper fontSize={16} semiBoldSora>
        Confirmación de documento
      </TextWrapper>
      <View style={styles.textContainer}>
        <TextWrapper fontSize={16}>
          Verificaremos que los datos ingresados sean validos con un scan, en
          caso de no coincidir los datos serán invalidados
        </TextWrapper>
      </View>
      <View style={styles.continueButton}>
        <Button title="Continuar" borderRadius={4} onPress={handleContinue} />
      </View>
      <TouchableOpacity style={styles.goBackText} onPress={handleCloseModal}>
        <TextWrapper
          semiBoldSora
          color={colors.dynamicText}
          fontSize={14}
          center
        >
          Volver
        </TextWrapper>
      </TouchableOpacity>
    </>
  );
};

export default DocuConfirmLayout;
