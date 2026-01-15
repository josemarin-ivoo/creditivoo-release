import React, { useMemo } from 'react';
import { Alert, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { useNavigation, useTheme } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { updateUser } from 'store/slices/users-slice';
import { SCREENS } from '@shared-constants';

// Components
import Button from '@shared-components/button/Button';
import Input from '@shared-components/input/Input';
import TextWrapper from '@shared-components/text-wrapper/TextWrapper';
import createStyles from './CustomerContractNumber.style'; // Reuse the same style file
import { AppDispatch } from 'store/store';

const CustomerContractNumberScreen: React.FC = () => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { contractNumber: '' },
  });

  const onSubmit = async (data: { contractNumber: string }) => {
    try {
      const { contractNumber } = data;
      dispatch(updateUser({ contractNumber }));
      navigation.navigate(SCREENS.SELLER.CUSTOMER_NAME as never);
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'No se pudo guardar el contrato.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <View style={styles.title}>
          <TextWrapper fontSize={32} center>
            📜
          </TextWrapper>
          <TextWrapper semiBoldSora fontSize={21} center>
            Número de Contrato
          </TextWrapper>
        </View>
        <View style={styles.input}>
          <Controller
            control={control}
            name="contractNumber"
            rules={{
              required: 'El número de contrato es obligatorio',
              pattern: {
                value: /^[0-9]+$/,
                message: 'El número de contrato debe ser numérico',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <>
                <Input
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="e.g. 123456"
                  keyboardType="default"
                  borderColor={errors.contractNumber && colors.error}
                />
                {errors.contractNumber && (
                  <View style={styles.errorContainer}>
                    <TextWrapper fontSize={12} color={colors.error}>
                      {errors.contractNumber.message}
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
      </View>
    </SafeAreaView>
  );
};

export default CustomerContractNumberScreen;
