import React, { useMemo } from "react";
import { SafeAreaView, View, Text } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useNavigation, useTheme } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { SCREENS } from "@shared-constants";

// Components
import Button from "@shared-components/button/Button";
import Input from "@shared-components/input/Input";
import TextWrapper from "@shared-components/text-wrapper/TextWrapper";
import createStyles from "./CustomerNameScreen.style";
import { updateUser } from "store/slices/users-slice";
import { AppDispatch } from "store/store";
import ErrorMessage from "@shared-components/error-message/ErrorMessage";

const CustomerNameScreen: React.FC = () => {
  const styles = useMemo(() => createStyles(), []);
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const { colors } = theme;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      lastname: "",
    },
  });

  const onSubmit = (data: { name: string; lastname: string }) => {
    dispatch(updateUser(data));
    navigation.navigate(SCREENS.SELLER.CUSTOMER_DOB as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <View style={styles.title}>
          <Text style={{ fontSize: 32 }}>👤</Text>
          <TextWrapper semiBoldSora fontSize={21}>
            Nombre del cliente
          </TextWrapper>
        </View>
        <View style={styles.input}>
          <Controller
            control={control}
            name="name"
            rules={{
              required: "El nombre es obligatorio",
              minLength: {
                value: 2,
                message: "El nombre debe tener al menos 2 caracteres",
              },
              maxLength: {
                value: 50,
                message: "El nombre no puede tener más de 50 caracteres",
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <>
                <Input
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Nombres"
                  keyboardType="default"
                  borderColor={errors.name && colors.error}
                />
                {errors.name && (
                  <ErrorMessage message={errors.name.message || "Error"} />
                )}
              </>
            )}
          />
        </View>
        <View style={styles.input}>
          <Controller
            control={control}
            name="lastname"
            rules={{
              required: "El apellido es obligatorio",
              minLength: {
                value: 2,
                message: "El apellido debe tener al menos 2 caracteres",
              },
              maxLength: {
                value: 50,
                message: "El apellido no puede tener más de 50 caracteres",
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <>
                <Input
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Apellidos"
                  keyboardType="default"
                  borderColor={errors.name && colors.error}
                />
                {errors.lastname && (
                  <ErrorMessage message={errors.lastname.message || "Error"} />
                )}
              </>
            )}
          />
        </View>
      </View>
      <View style={styles.button}>
        <Button title="Continuar" onPress={handleSubmit(onSubmit)} />
      </View>
    </SafeAreaView>
  );
};

export default CustomerNameScreen;
