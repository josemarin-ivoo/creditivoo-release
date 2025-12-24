import React, {useState, useEffect, useMemo} from 'react';
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
import {useNavigation} from '@react-navigation/native';
import {SCREENS} from '@shared-constants';
import {Button, Input, AlertModal} from './components';
import {
  IVOO_COLORS,
  IVOO_SPACING,
  IVOO_TEXT_STYLES,
  IVOO_TYPOGRAPHY,
} from './styles';
import {useIvoSelector, useIvoDispatch} from '../../../redux/useIvo';
import {login} from './store-creditivoo/slices/auth-slice';
import CustomBottomSheetModal from './shared/components/bottom-sheet/CustomBottomSheetModal';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';
import ReactNativeBiometrics from 'react-native-biometrics';
import {AuthStorage} from './app/services/AuthStorage';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useIvoDispatch();
  const {isLoggedIn, isLoading} = useIvoSelector(state => state.creditivoo.auth);

  // Verificar si hay credenciales guardadas para login biométrico
  useEffect(() => {
    const checkBiometricAvailability = async () => {
      try {
        // Solo verificamos si hay credenciales guardadas
        // No necesitamos verificar el usuario porque puede haber cerrado sesión
        const credentials = await AuthStorage.getCredentials();
        const rnBiometrics = new ReactNativeBiometrics();
        const {available} = await rnBiometrics.isSensorAvailable();

        // Mostrar botón si hay credenciales y biometría disponible
        setHasBiometricEnabled(credentials !== null && available);
      } catch (error) {
        console.error('[LoginScreen] Error checking biometric:', error);
        setHasBiometricEnabled(false);
      }
    };

    checkBiometricAvailability();
  }, []);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  // const [focusedInputs, setFocusedInputs] = useState<Set<string>>(new Set());
  const [hasBiometricEnabled, setHasBiometricEnabled] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  const snapPoints = useMemo(() => ['50%', '85%'], []);


  const handleContinue = () => {
    // Si ya está autenticado, navegar directamente
    if (isLoggedIn) {
      navigation.reset({
        index: 0,
        routes: [{name: 'MainTabs' as never}],
      });
      return;
    }

    // Mostrar modal de login
    // Usar setTimeout para asegurar que el estado se actualice correctamente
    // y el BottomSheetModal pueda presentarse
    console.log('[LoginScreen] Abriendo modal de login');
    setShowLoginModal(true);
  };

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
        // Login exitoso, cerrar modal y navegar
        setShowLoginModal(false);
        setEmail('');
        setPassword('');
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

  const handleCloseModal = () => {
    setShowLoginModal(false);
    setEmail('');
    setPassword('');

    // setFocusedInputs(new Set());
  };

  const handleRegister = () => {
    (navigation as any).navigate(SCREENS.REGISTER);
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
        setShowLoginModal(false);
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
            source={require('./images/creditivo-logo-full.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Ivitoo Illustration */}
        <View style={styles.illustrationContainer}>
          <Image
            source={require('./images/onboarding/ivitoo-register.png')}
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>

        {/* Continue Button */}
        <View style={styles.buttonContainer}>

        
          <Button
            onPress={handleContinue}
            title="Continuar"
            style={styles.continueButton}
          />

          {/* Biometric Login Button */}
          {hasBiometricEnabled && (
            <TouchableOpacity
              onPress={handleBiometricLogin}
              style={styles.biometricButton}
              disabled={isBiometricLoading || isLoading}
              activeOpacity={0.7}>
              {isBiometricLoading ? (
                <ActivityIndicator
                  size="small"
                  color={IVOO_COLORS.primary}
                  style={styles.biometricLoader}
                />
              ) : (
                <Icon
                  name="fingerprint"
                  type={IconType.MaterialIcons}
                  size={30}
                  color={IVOO_COLORS.primary}
                />
              )}
              {/* <Text style={styles.biometricText}>
                {isBiometricLoading
                  ? 'Autenticando...'
                  : 'Iniciar sesión con biometría'}
              </Text> */}
            </TouchableOpacity>
          )}
        </View>

        {/* Register Link */}
        <TouchableOpacity onPress={handleRegister} style={styles.registerLink}>
          <Text style={styles.registerText}>Registrarse</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Login Bottom Sheet */}
      <CustomBottomSheetModal
        isVisible={showLoginModal}
        onClose={handleCloseModal}
        snapPoints={snapPoints}
        scrollEnabled={true}
        accessibilityLabel="Login Bottom Sheet">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
          <View style={styles.bottomSheetContent}>
            <View style={styles.bottomSheetHeader}>
              <Text style={styles.bottomSheetTitle}>Iniciar Sesión</Text>
              <TouchableOpacity
                onPress={handleCloseModal}
                style={styles.closeButtonContainer}>
                <Text style={styles.bottomSheetCloseButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.bottomSheetBody}>
              <Input
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                containerStyle={styles.inputContainer}
                editable={!isLoading}
                // onFocus={() => {
                //   if (!isLoading) {
                //     setFocusedInputs(prev => new Set(prev).add('email'));
                //   }
                // }}
                // onBlur={() => {
                //   setFocusedInputs(prev => {
                //     const newSet = new Set(prev);
                //     newSet.delete('email');
                //     return newSet;
                //   });
                // }}
              />

              <View style={styles.passwordInputWrapper}>
                <Input
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  containerStyle={styles.inputWrapper}
                  style={styles.passwordInput}
                  editable={!isLoading}
                  // onFocus={() => {
                  //   if (!isLoading) {
                  //     setFocusedInputs(prev => new Set(prev).add('password'));
                  //   }
                  // }}
                  // onBlur={() => {
                  //   setFocusedInputs(prev => {
                  //     const newSet = new Set(prev);
                  //     newSet.delete('password');
                  //     return newSet;
                  //   });
                  // }}
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

              <View style={styles.buttonContainer}>
                {isLoading && (
                  <ActivityIndicator
                    size="small"
                    color={IVOO_COLORS.white}
                    style={styles.buttonLoader}
                  />
                )}
                <Button
                  title={isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                  onPress={handleLogin}
                  disabled={isLoading || !email.trim() || !password.trim()}
                  style={StyleSheet.flatten([
                    styles.loginButton,
                    isLoading && styles.loginButtonLoading,
                  ])}
                  width="100%"
                />
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </CustomBottomSheetModal>

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
  scrollView: {
    flex: 1,
    backgroundColor: IVOO_COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 10,
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
    width: IVOO_SPACING.logoWidth,
    height: IVOO_SPACING.logoHeight,
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
    marginTop: SCREEN_HEIGHT * 0.09,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  continueButton: {
    flex:1,
    height: 54,
    marginTop: SCREEN_HEIGHT * 0.025,
    shadowColor: 'transparent',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  registerLink: {
    marginTop: SCREEN_HEIGHT * 0.015,
    paddingVertical: 8,
  },
  registerText: {
    fontSize: SCREEN_WIDTH * 0.038,
    fontFamily: IVOO_TEXT_STYLES.linkText.fontFamily,
    fontWeight: IVOO_TEXT_STYLES.linkText.fontWeight,
    lineHeight: IVOO_TEXT_STYLES.linkText.lineHeight,
    color: IVOO_COLORS.primary,
    textAlign: 'center',
    includeFontPadding: false,
    marginTop: SCREEN_HEIGHT * 0.015,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  bottomSheetContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    flex: 1,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 8,
  },
  bottomSheetTitle: {
    fontSize: 22,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.black,
  },
  closeButtonContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: IVOO_COLORS.grayLight,
  },
  bottomSheetCloseButton: {
    fontSize: 18,
    color: IVOO_COLORS.grayMedium,
    fontWeight: '400',
    lineHeight: 20,
  },
  bottomSheetBody: {
    gap: 16,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 0,
  },
  passwordInputWrapper: {
    position: 'relative',
    width: '100%',
  },
  inputWrapper: {
    width: '100%',
  },
  passwordInput: {
    fontSize: SCREEN_WIDTH * 0.05342343,
  },
  eyeIcon: {
    position: 'absolute',
    right: SCREEN_WIDTH * 0.042,
    top: SCREEN_HEIGHT * 0.02,
    zIndex: 1,
  },
  buttonContainer: {
    // flexDirection: 'row',
    position: 'relative',
    width: '100%',
    marginTop: 8,
    flexDirection: 'row',     // Los pone uno al lado del otro
    alignItems: 'center',     // Los centra verticalmente entre sí
    // width: '100%',            // Ocupa todo el ancho
    paddingHorizontal: 20,    // Espacio a los lados
    // marginTop: 20,
    gap: 10,
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
  loginButtonLoading: {
    opacity: 0.8,
  },
  biometricButton: {
    width: 55,                // Ancho fijo para que sea un círculo/cuadrado
    height: 55,               // Igual al alto del botón de continuar
    borderRadius: 18,
    borderWidth: 1,
    borderColor: IVOO_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginTop: 17
  },
  biometricLoader: {
    marginRight: SCREEN_WIDTH * 0.02,
  },
  biometricText: {
    marginLeft: SCREEN_WIDTH * 0.03,
    fontSize: SCREEN_WIDTH * 0.038,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.primary,
  },
});

export default LoginScreen;
