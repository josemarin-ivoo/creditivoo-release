import React, { useMemo } from "react";
import { SafeAreaView, View, Text, ScrollView } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useNavigation, useTheme } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import createStyles from "./CustomerDocumentScreen.style";

// Components
import TextWrapper from "@shared-components/text-wrapper/TextWrapper";
import Button from "@shared-components/button/Button";
import Input from "@shared-components/input/Input";
import CustomBottomSheetModal from "@shared-components/bottom-sheet/CustomBottomSheetModal";
import DocuConfirmLayout from "./components/DocuConfirmLayout";
import { SCREENS } from "@shared-constants";
import { updateUser } from "store/slices/users-slice";
import { AppDispatch } from "store/store";
import ErrorMessage from "@shared-components/error-message/ErrorMessage";

const CustomerDocumentScreen: React.FC = () => {
  const styles = useMemo(() => createStyles(), []);
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const { colors } = theme;

  const {
    getValues,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      document: "",
    },
  });

  const onSubmit = () => {
    setModalVisible(true);
  };

  const [isModalVisible, setModalVisible] = React.useState(false);

  const handleContinue = () => {
    setModalVisible(false);
    const documentData = getValues("document");
    dispatch(updateUser({ document: documentData }));
    navigation.navigate(SCREENS.SELLER.CUSTOMER_CAM_CONFIRM as never);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  return (
    <SafeAreaView>
      <ScrollView>
        <View style={styles.container}>
          <View style={styles.mainTitleContainer}>
            <View style={styles.title}>
              <Text style={{ fontSize: 32 }}>🪪</Text>
              <TextWrapper boldSora fontSize={21}>
                Cédula
              </TextWrapper>
            </View>
            <View style={styles.input}>
              <Controller
                control={control}
                name="document"
                rules={{
                  required: "El número de cédula es obligatorio",
                  minLength: {
                    value: 7,
                    message: "La cédula debe tener al menos 6 caracteres",
                  },
                  maxLength: {
                    value: 10,
                    message: "La cédula no puede tener más de 16 caracteres",
                  },
                  // pattern: {
                  //   value: /^[0-9]+$/,
                  //   message: "El número de cédula solo puede contener números",
                  // },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <Input
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="20142754"
                      keyboardType="numeric"
                      borderColor={errors.document && colors.error}
                    />
                    {errors.document && (
                      <ErrorMessage
                        message={errors.document.message || "Error"}
                      />
                    )}
                  </>
                )}
              />
            </View>
          </View>
          <View style={styles.button}>
            <Button title="Continuar" onPress={handleSubmit(onSubmit)} />
          </View>
          <CustomBottomSheetModal
            isVisible={isModalVisible}
            onClose={handleCloseModal}
            accessibilityLabel="Bottom Sheet Modal"
            bottomSheetScrollView
          >
            <DocuConfirmLayout
              handleCloseModal={handleCloseModal}
              handleContinue={handleContinue}
            />
          </CustomBottomSheetModal>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CustomerDocumentScreen;
