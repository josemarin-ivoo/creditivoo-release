import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {SCREENS} from '@shared-constants';
import {Button, Input, AlertModal} from '../../components';
import {
  IVOO_COLORS,
  IVOO_SPACING,
  IVOO_TEXT_STYLES,
  IVOO_TYPOGRAPHY,
} from '../../styles';
import {useIvoSelector, useIvoDispatch} from '../../store/hooks';
import {login} from '../../store/slices/auth-slice';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';
import ReactNativeBiometrics from 'react-native-biometrics';
import {AuthStorage} from '@app-services/AuthStorage';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useIvoDispatch();
  const {isLoading} = useIvoSelector(state => state.auth);

  // Verificar si hay credenciales guardadas para login biométrico
  const checkBiometricAvailability = React.useCallback(async () => {
    try {
      // Solo verificamos si hay credenciales guardadas
      // No necesitamos verificar el usuario porque puede haber cerrado sesión
      const credentials = await AuthStorage.getCredentials();

      if (!credentials) {
        setHasBiometricEnabled(false);
        return;
      }

      const rnBiometrics = new ReactNativeBiometrics();
      const {available} = await rnBiometrics.isSensorAvailable();

      // Mostrar botón si hay credenciales y biometría disponible
      setHasBiometricEnabled(credentials !== null && available);
    } catch (error) {
      console.error('[LoginScreen] Error checking biometric:', error);
      setHasBiometricEnabled(false);
    }
  }, []);

  // Verificar al montar el componente
  useEffect(() => {
    checkBiometricAvailability();
  }, [checkBiometricAvailability]);

  // Verificar cuando la pantalla recibe foco (por si el usuario vuelve después de hacer login)
  useFocusEffect(
    React.useCallback(() => {
      checkBiometricAvailability();
    }, [checkBiometricAvailability]),
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [hasBiometricEnabled, setHasBiometricEnabled] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setAlertMessage('Por favor, completa todos los campos');
      setAlertVisible(true);
      return;
    }

    try {
      const result = await dispatch(
        login({email: email.trim(), password}),
      ).unwrap();

      if (result.token && result.user) {
        // Login exitoso, limpiar campos y navegar
        setEmail('');
        setPassword('');
        // Verificar nuevamente las credenciales después del login exitoso
        // para actualizar el estado del botón biométrico
        setTimeout(() => {
          checkBiometricAvailability();
        }, 500);
        navigation.reset({
          index: 0,
          routes: [{name: 'MainTabs' as never}],
        });
      }
    } catch (err: any) {
      const errorMessage =
        err?.message || 'Error al iniciar sesión. Por favor, intenta de nuevo.';

      // Detectar errores que indican que el usuario fue eliminado de la BD
      const isUserDeletedError =
        err?.response?.status === 401 ||
        errorMessage.includes('No hay refresh token disponible') ||
        errorMessage.includes('Credenciales inválidas') ||
        errorMessage.includes('Unauthorized') ||
        err?.response?.status === 404;

      if (isUserDeletedError) {
        // Limpiar credenciales y ocultar botón de biometría
        try {
          await AuthStorage.deleteCredentials();
          setHasBiometricEnabled(false);
          console.log(
            '[LoginScreen] Credenciales eliminadas debido a error de autenticación',
          );
        } catch (clearError) {
          console.error(
            '[LoginScreen] Error al limpiar credenciales:',
            clearError,
          );
        }
      }

      setAlertMessage(errorMessage);
      setAlertVisible(true);
    }
  };

  const handleRegister = () => {
    (navigation as any).navigate(SCREENS.REGISTER);
  };

  const handleForgotPassword = () => {
    (navigation as any).navigate(SCREENS.FORGOT_PASSWORD);
  };

  const handleBiometricLogin = async () => {
    try {
      setIsBiometricLoading(true);
      const rnBiometrics = new ReactNativeBiometrics();

      // Verificar si la biometría está disponible
      const {available} = await rnBiometrics.isSensorAvailable();
      if (!available) {
        setAlertMessage('La biometría no está disponible en este dispositivo.');
        setAlertVisible(true);
        setIsBiometricLoading(false);
        return;
      }

      // Verificar si existen las claves criptográficas
      const {keysExist} = await rnBiometrics.biometricKeysExist();
      if (!keysExist) {
        try {
          await rnBiometrics.createKeys();
        } catch (createError) {
          console.error('[LoginScreen] Error creating keys:', createError);
          setAlertMessage(
            'No se pudieron crear las claves de seguridad. Por favor, inicia sesión manualmente.',
          );
          setAlertVisible(true);
          setIsBiometricLoading(false);
          return;
        }
      }

      // Solicitar autenticación biométrica
      const result = await rnBiometrics.simplePrompt({
        promptMessage: 'Confirma tu identidad para iniciar sesión',
      });

      if (!result.success) {
        console.log('[LoginScreen] Autenticación biométrica cancelada');
        setIsBiometricLoading(false);
        return;
      }

      // Obtener credenciales guardadas
      const credentials = await AuthStorage.getCredentials();
      if (!credentials) {
        setAlertMessage(
          'No se encontraron credenciales guardadas. Por favor, inicia sesión manualmente.',
        );
        setAlertVisible(true);
        setIsBiometricLoading(false);
        return;
      }

      // Hacer login con las credenciales guardadas
      const loginResult = await dispatch(
        login({email: credentials.email, password: credentials.password}),
      ).unwrap();

      if (loginResult.token && loginResult.user) {
        // Login exitoso
        // Verificar nuevamente las credenciales después del login exitoso
        setTimeout(() => {
          checkBiometricAvailability();
        }, 500);
        navigation.reset({
          index: 0,
          routes: [{name: 'MainTabs' as never}],
        });
      }
    } catch (err: any) {
      console.error('[LoginScreen] Error en login biométrico:', err);
      const errorMessage =
        err?.message ||
        'Error al iniciar sesión con biometría. Por favor, intenta de nuevo.';

      // Detectar errores que indican que el usuario fue eliminado de la BD
      const isUserDeletedError =
        err?.response?.status === 401 ||
        errorMessage.includes('No hay refresh token disponible') ||
        errorMessage.includes('Credenciales inválidas') ||
        errorMessage.includes('Unauthorized') ||
        err?.response?.status === 404;

      if (isUserDeletedError) {
        // Limpiar credenciales y ocultar botón de biometría
        try {
          await AuthStorage.deleteCredentials();
          setHasBiometricEnabled(false);
          console.log(
            '[LoginScreen] Credenciales eliminadas debido a error de autenticación biométrica',
          );
        } catch (clearError) {
          console.error(
            '[LoginScreen] Error al limpiar credenciales:',
            clearError,
          );
        }
      }

      setAlertMessage(errorMessage);
      setAlertVisible(true);
    } finally {
      setIsBiometricLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          bounces={true}
          overScrollMode="always"
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}>
          <Text style={styles.welcomeText}>Bienvenido a</Text>

          <View style={styles.logoContainer}>
            <Image
              source={require('../../images/creditivo-logo-full.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Ivitoo Illustration */}
          <View style={styles.illustrationContainer}>
            <Image
              source={require('../../images/onboarding/ivitoo-register.png')}
              style={styles.illustration}
              resizeMode="contain"
            />
          </View>

          {/* Login Form */}
          <View style={styles.loginFormContainer}>
            {/* Usuario Input */}
            <View style={styles.inputLabelContainer}>
              <View style={styles.userInputWrapper}>
                <Input
                  borderRadius="full"
                  placeholder="Usuario"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  containerStyle={styles.inputContainer}
                  style={styles.input}
                  editable={!isLoading}
                />
                {hasBiometricEnabled && (
                  <TouchableOpacity
                    style={styles.biometricIcon}
                    onPress={handleBiometricLogin}
                    activeOpacity={0.7}
                    disabled={isLoading || isBiometricLoading}>
                    {isBiometricLoading ? (
                      <ActivityIndicator
                        size="small"
                        color={IVOO_COLORS.primary}
                      />
                    ) : (
                      <Icon
                        name={
                          Platform.OS === 'ios'
                            ? 'face-recognition'
                            : 'finger-print-sharp'
                        }
                        type={
                          Platform.OS === 'ios'
                            ? IconType.MaterialCommunityIcons
                            : IconType.Ionicons
                        }
                        size={SCREEN_WIDTH * 0.09}
                        color={isLoading ? '#DADADA' : IVOO_COLORS.primary}
                      />
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Contraseña Input */}
            <View style={styles.inputLabelContainer}>
              <View style={styles.passwordInputWrapper}>
                <Input
                  borderRadius="full"
                  placeholder="Contraseña"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  containerStyle={styles.passwordInputContainer}
                  style={styles.passwordInput}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => !isLoading && setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                  disabled={isLoading}>
                  <Icon
                    name={showPassword ? 'eye-off' : 'eye'}
                    type={IconType.Feather}
                    size={SCREEN_WIDTH * 0.053}
                    color={isLoading ? '#DADADA' : '#676464'}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Biometric and Login Buttons Row */}
            <View
              style={[
                styles.buttonsRow,
                hasBiometricEnabled && styles.buttonsRowWithBiometric,
              ]}>
              {/* Login Button */}
              <View style={[styles.loginButtonContainer]}>
                {isLoading && (
                  <ActivityIndicator
                    size="small"
                    color={IVOO_COLORS.white}
                    style={styles.buttonLoader}
                  />
                )}
                <Button
                  title={isLoading ? 'Iniciando...' : 'Iniciar sesión'}
                  onPress={handleLogin}
                  disabled={isLoading || !email.trim() || !password.trim()}
                  style={StyleSheet.flatten([
                    styles.loginButton,
                    isLoading && styles.loginButtonLoading,
                  ])}
                  textStyle={styles.loginButtonText}
                  width="100%"
                />
              </View>
            </View>

            {/* Forgot Password Link */}
            <TouchableOpacity
              onPress={handleForgotPassword}
              style={styles.forgotPasswordLink}>
              <Text style={styles.forgotPasswordText}>
                Olvidé mi contraseña
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer Links */}
          <View style={styles.footerLinks}>
            <TouchableOpacity
              onPress={handleRegister}
              style={styles.footerLink}>
              <Text style={styles.footerLinkText}>Registrarse</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Alert Modal */}
      <AlertModal
        visible={alertVisible}
        title="Error"
        message={alertMessage}
        type="error"
        onClose={() => setAlertVisible(false)}
        buttonText="OK"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: IVOO_COLORS.white,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: IVOO_COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  welcomeText: {
    fontSize: IVOO_TEXT_STYLES.welcomeText.fontSize,
    fontFamily: IVOO_TEXT_STYLES.welcomeText.fontFamily,
    fontWeight: IVOO_TEXT_STYLES.welcomeText.fontWeight,
    lineHeight: IVOO_TEXT_STYLES.welcomeText.lineHeight,
    color: IVOO_COLORS.primary,
    textAlign: 'center',
    marginTop: 0,
  },
  logoContainer: {
    width: SCREEN_WIDTH * 0.75,
    height: SCREEN_WIDTH * 0.75 * 0.154,
    marginTop: SCREEN_HEIGHT * 0.015,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  illustrationContainer: {
    width: IVOO_SPACING.illustrationWidth,
    height: IVOO_SPACING.illustrationHeight,
    marginTop: SCREEN_HEIGHT * 0.05,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  loginFormContainer: {
    width: '100%',
    paddingHorizontal: SCREEN_WIDTH * 0.08,
    alignItems: 'center',
  },
  inputLabelContainer: {
    width: '100%',
    marginBottom: 8,
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: SCREEN_WIDTH * 0.038,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.regular,
    color: '#676464',
    marginBottom: 8,
    paddingLeft: 4,
  },
  inputContainer: {
    width: '100%',
    maxWidth: 302,
    marginBottom: 0,
    height: 53,
    alignSelf: 'center',
  },
  input: {
    borderWidth: 2,
    borderColor: IVOO_COLORS.primary,
  },
  userInputWrapper: {
    position: 'relative',
    width: '100%',
    alignItems: 'center',
  },
  passwordInputWrapper: {
    position: 'relative',
    width: '100%',
    alignItems: 'center',
  },
  passwordInputContainer: {
    width: '100%',
    maxWidth: 302,
    height: 53,
    alignSelf: 'center',
  },
  passwordInput: {
    // fontSize: SCREEN_WIDTH * 0.05342343,
    borderWidth: 2,
    borderColor: IVOO_COLORS.primary,
  },
  biometricIcon: {
    position: 'absolute',
    right: Platform.select({
      ios: SCREEN_WIDTH * 0.08,
      android: SCREEN_WIDTH * 0.042,
    }),
    top: '50%',
    transform: [{translateY: -(SCREEN_WIDTH * 0.09) / 2}],
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: SCREEN_WIDTH * 0.09,
    width: SCREEN_WIDTH * 0.09,
  },
  eyeIcon: {
    position: 'absolute',
    right: Platform.select({
      ios: SCREEN_WIDTH * 0.08,
      android: SCREEN_WIDTH * 0.042,
    }),
    top: '50%',
    transform: [{translateY: -(SCREEN_WIDTH * 0.053) / 2}],
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonsRow: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 302,
    marginTop: SCREEN_HEIGHT * 0.025,
    gap: 12,
    alignItems: 'center',
    alignSelf: 'center',
  },
  buttonsRowWithBiometric: {
    gap: 6,
  },
  biometricButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: IVOO_SPACING.buttonBorderRadius,
    borderWidth: 1,
    borderColor: IVOO_COLORS.primary,
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
    minWidth: 120,
    marginRight: 6,
  },
  biometricButtonWithBiometric: {
    width: '50%',
    flex: 0,
    marginRight: 3,
    minWidth: 0,
  },
  biometricText: {
    marginLeft: 8,
    fontSize: SCREEN_WIDTH * 0.032,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.primary,
    flexShrink: 1,
  },
  loginButtonContainer: {
    flex: 1,
    position: 'relative',
  },
  loginButtonContainerWithBiometric: {
    width: '50%',
    flex: 0,
    marginLeft: 3,
  },
  buttonLoader: {
    position: 'absolute',
    left: 20,
    top: '50%',
    transform: [{translateY: -10}],
    zIndex: 1,
  },
  loginButton: {
    shadowColor: 'transparent',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  loginButtonText: {
    fontSize: SCREEN_WIDTH * 0.048, // Tamaño normal cuando NO hay biometría
  },
  loginButtonTextWithBiometric: {
    fontSize: SCREEN_WIDTH * 0.032, // Tamaño pequeño cuando SÍ hay biometría (igual al de biometría)
  },
  loginButtonLoading: {
    opacity: 0.8,
  },
  forgotPasswordLink: {
    marginTop: SCREEN_HEIGHT * 0.02,
    paddingVertical: 8,
    alignSelf: 'center',
  },
  forgotPasswordText: {
    fontSize: SCREEN_WIDTH * 0.038,
    fontFamily: IVOO_TEXT_STYLES.linkText.fontFamily,
    fontWeight: IVOO_TEXT_STYLES.linkText.fontWeight,
    lineHeight: IVOO_TEXT_STYLES.linkText.lineHeight,
    color: IVOO_COLORS.primary,
    textAlign: 'center',
    includeFontPadding: false,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SCREEN_HEIGHT * 0.04,
    gap: 20,
    flexWrap: 'wrap',
  },
  footerLink: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  footerLinkText: {
    fontSize: SCREEN_WIDTH * 0.042,
    fontFamily: IVOO_TEXT_STYLES.linkText.fontFamily,
    fontWeight: IVOO_TEXT_STYLES.linkText.fontWeight,
    lineHeight: IVOO_TEXT_STYLES.linkText.lineHeight,
    color: IVOO_COLORS.primary,
    textAlign: 'center',
    includeFontPadding: false,
  },
});

export default LoginScreen;