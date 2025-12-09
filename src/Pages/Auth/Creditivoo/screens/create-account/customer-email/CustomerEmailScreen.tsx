import React, { useMemo, useState } from 'react';
import { Alert, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { useNavigation, useTheme } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import {
  clearUser,
  getUserByEmail,
  updateUser,
} from 'store/slices/users-slice';
import { SCREENS } from '@shared-constants';

// Components
import Button from '@shared-components/button/Button';
import Input from '@shared-components/input/Input';
import TextWrapper from '@shared-components/text-wrapper/TextWrapper';
import createStyles from './CustomerEmailScreen.style';
import CustomBottomSheetModal from '@shared-components/bottom-sheet/CustomBottomSheetModal';
import UserRegisteredLayout from './components/user-registered-layout/UserRegisteredLayout';
import { AppDispatch } from 'store/store';

const emailSuggestions = ['@gmail.com', '@hotmail.com', '@yahoo.com'];

const CustomerEmailScreen: React.FC = () => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const {
    control,
    setValue,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm({
    defaultValues: { email: '' },
  });

  const [modalVisible, setModalVisible] = useState(false);

  const handleEmailSuggestion = (suggestion: string) => {
    const currentValue = getValues('email');
    const newValue = currentValue.trim() + suggestion;
    setValue('email', newValue, { shouldValidate: true });
  };

  const onSubmit = async (data: { email: string }) => {
    try {
      const response = await dispatch(getUserByEmail(data.email)).unwrap();
      if (response.user.role === 'CUSTOMER') {
        setModalVisible(true);
      } else {
        Alert.alert('Error', `El ROL de este usuario es ${response.user.role}`);
        dispatch(clearUser());
      }
    } catch (error: any) {
      console.log(error.message);
      if (error.message === 'User not found') {
        handleContinue();
      } else {
        Alert.alert('Error', error || 'No se pudo verificar el usuario.');
      }
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    dispatch(clearUser());
  };

  const handleContinue = () => {
    const email = getValues('email');
    dispatch(updateUser({ email }));
    navigation.navigate(SCREENS.SELLER.CUSTOMER_CONTRACT_NUMBER as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <View style={styles.title}>
          <TextWrapper fontSize={32} center>
            ✉️
          </TextWrapper>
          <TextWrapper semiBoldSora fontSize={21} center>
            Email del cliente
          </TextWrapper>
        </View>
        <View style={styles.input}>
          <Controller
            control={control}
            name="email"
            rules={{
              required: 'El correo electrónico es obligatorio',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'El correo electrónico no es válido',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <>
                <Input
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="e.g. email@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  borderColor={errors.email && colors.error}
                />
                {errors.email && (
                  <View style={styles.errorContainer}>
                    <TextWrapper fontSize={12} color={colors.error}>
                      {errors.email.message}
                    </TextWrapper>
                  </View>
                )}
              </>
            )}
          />
        </View>
      </View>
      <View>
        <View style={styles.button}>
          <Button title="Continuar" onPress={handleSubmit(onSubmit)} />
        </View>
        <View style={styles.suggestionsContainer}>
          {emailSuggestions.map((suggestion) => (
            <TouchableOpacity
              key={suggestion}
              style={styles.suggestionTag}
              onPress={() => handleEmailSuggestion(suggestion)}
            >
              <TextWrapper center fontSize={11}>
                {suggestion}
              </TextWrapper>
            </TouchableOpacity>
          ))}
        </View>
        <CustomBottomSheetModal
          isVisible={modalVisible}
          onClose={handleCloseModal}
          accessibilityLabel="Bottom Sheet Modal"
          bottomSheetScrollView
        >
          <UserRegisteredLayout onClose={handleCloseModal} />
        </CustomBottomSheetModal>
      </View>
    </SafeAreaView>
  );
};

export default CustomerEmailScreen;
