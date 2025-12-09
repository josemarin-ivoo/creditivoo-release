import React, {useMemo} from 'react';
import {
  View,
  TouchableOpacity,
  Pressable,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {useForm, Controller} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import {useToast} from 'react-native-toast-notifications';
import {useNavigation} from '@react-navigation/native';
import {Layout, Text, Icon, useTheme} from '@ui-kitten/components';
import {SCREENS} from '@shared-constants';
import createStyles from './LoginScreen.style';
import ButtonK from '@shared-components/button/ButtonK';
import InputK from '@shared-components/input/InputK';
import {loginSchema} from '@app-services/validations/authValidations';
import {AppDispatch, RootState} from 'store/store';
import {login} from 'store/slices/auth-slice';

interface LoginFormData {
  username: string;
  password: string;
}

const LoginScreen: React.FC = () => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useDispatch<AppDispatch>();
  const {isLoading} = useSelector((state: RootState) => state.auth);
  const navigation = useNavigation();
  const toast = useToast();

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    mode: 'onSubmit',
  });

  const handleLogin = async (data: LoginFormData) => {
    try {
      await dispatch(login(data)).unwrap();
      // Navigate to the main screen after successful login
    } catch (err: any) {
      toast.show(err.message || 'Error en el inicio de sesión', {
        type: 'danger',
        duration: 3000,
        placement: 'top',
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <Layout style={styles.layout}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}>
              <Icon
                name="arrow-back"
                fill={theme['color-primary-500']}
                width={24}
                height={24}
              />
            </TouchableOpacity>
          </View>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <Pressable onPress={Keyboard.dismiss} style={styles.container}>
              <View style={styles.formContainer}>
                <Text category="h2" style={styles.title}>
                  Inicia sesión
                </Text>
                <Controller
                  control={control}
                  name="username"
                  render={({field: {onChange, onBlur, value}}) => (
                    <InputK
                      containerStyle={styles.input}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="Correo electrónico"
                      status={errors.username ? 'danger' : 'basic'}
                      caption={errors.username?.message}
                      keyboardType="email-address"
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="password"
                  render={({field: {onChange, onBlur, value}}) => (
                    <InputK
                      containerStyle={styles.input}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="Contraseña"
                      isPassword
                      status={errors.password ? 'danger' : 'basic'}
                      caption={errors.password?.message}
                    />
                  )}
                />
              </View>
              <View>
                <ButtonK
                  style={styles.button}
                  onPress={handleSubmit(handleLogin)}
                  disabled={isLoading}
                  title={isLoading ? 'Cargando...' : 'Iniciar sesión'}
                />
                <ButtonK
                  style={styles.secondaryButton}
                  title="Crear una cuenta"
                  appearance="outline"
                  onPress={() => navigation.navigate(SCREENS.REGISTER as never)}
                />
              </View>
            </Pressable>
          </ScrollView>
        </Layout>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
