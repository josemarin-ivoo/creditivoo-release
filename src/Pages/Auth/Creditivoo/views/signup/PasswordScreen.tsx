import React, {useState, useMemo, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Button, Input, AlertModal} from '../../components';
import RegisterLayout from '../../components/layouts/RegisterLayout';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../styles';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';
import {useIvoDispatch, useIvoSelector} from '../../../../../redux/useIvo';
import {
  registerUser,
  setPassword as setPasswordInStore,
  clearRegisterData,
  updateAuth,
} from '../../store';
import {User} from '../../store-creditivoo/slices/auth-slice';
import {
  requestNotificationPermission,
  getFCMToken,
  registerFCMToken,
  setupTokenRefreshListener,
} from '../../services/fcm';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

interface PasswordRequirement {
  label: string;
  isValid: boolean;
}

const PasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useIvoDispatch();
  const {phoneNumber, email, isLoading, error} = useIvoSelector(
    state => state.register,
  );
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'error' | 'warning' | 'info'>(
    'error',
  );

  // Validate password requirements
  const requirements: PasswordRequirement[] = useMemo(() => {
    const hasLength = password.length >= 8 && password.length <= 20;
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[$./!@#]/.test(password);

    return [
      {
        label: 'Entre 8 a 20 caracteres',
        isValid: hasLength,
      },
      {
        label: 'Al menos 1 mayuscula',
        isValid: hasUppercase,
      },
      {
        label: 'Al menos 1 número',
        isValid: hasNumber,
      },
      {
        label: 'Al menos 1 caracter especial ($./!@#)',
        isValid: hasSpecialChar,
      },
    ];
  }, [password]);

  const isPasswordValid = useMemo(() => {
    return requirements.every(req => req.isValid);
  }, [requirements]);

  // Mostrar error del store si existe
  useEffect(() => {
    if (error) {
      const errorMessage =
        typeof error === 'string'
          ? error
          : (error as any)?.message ||
            (error as any)?.toString() ||
            'Error desconocido';
      setAlertTitle('Error');
      setAlertMessage(errorMessage);
      setAlertType('error');
      setAlertVisible(true);
    }
  }, [error]);

  const handleContinue = async () => {
    if (!isPasswordValid) {
      setAlertTitle('Error');
      setAlertMessage(
        'Por favor, completa todos los requisitos de la contraseña.',
      );
      setAlertType('error');
      setAlertVisible(true);
      return;
    }

    if (!phoneNumber || !email) {
      setAlertTitle('Error');
      setAlertMessage(
        'Faltan datos del registro. Por favor, vuelve a empezar.',
      );
      setAlertType('error');
      setAlertVisible(true);
      return;
    }

    try {
      // Guardar password en el store
      dispatch(setPasswordInStore(password));

      // Validar que todos los datos estén disponibles antes de enviar
      console.log('[PasswordScreen] ===== PREPARANDO REGISTRO FINAL =====');
      console.log('[PasswordScreen] Datos recopilados:');
      console.log('[PasswordScreen] - Phone Number:', phoneNumber);
      console.log('[PasswordScreen] - Email:', email);
      console.log('[PasswordScreen] - Password:', '*** (oculto)');

      // Registrar usuario con todos los datos (phoneNumber, email, password)
      const result = await dispatch(
        registerUser({
          phoneNumber,
          email,
          password,
        }),
      ).unwrap();

      console.log('[PasswordScreen] ===== REGISTRO COMPLETADO =====');
      console.log('[PasswordScreen] Usuario registrado exitosamente:', result);

      // Actualizar estado de autenticación con token y usuario
      if (result.token && result.user) {
        console.log('[PasswordScreen] Actualizando estado de autenticación');
        const userData: User = {
          id: result.user.id,
          email: result.user.email,
          phone: result.user.phone || '',
          name: result.user.name || '',
          lastname: result.user.lastname || '',
          fullname:
            result.user.fullname ||
            `${result.user.name || ''} ${result.user.lastname || ''}`.trim() ||
            result.user.email,
          username: result.user.username || result.user.email,
          document: result.user.document || null,
          dob: result.user.dob || null,
          role: result.user.role || 'user',
          hasActiveCredit: false,
          creditLimit: 0,
          creditUsed: 0,
          creditAvailable: 0,
          creditStatus: '',
          pendingPayment: null,
          overduePayment: null,
        };
        // Actualizar estado de autenticación (esto guarda el token en AuthStorage)
        await dispatch(
          updateAuth({
            token: result.token,
            user: userData,
          }),
        ).unwrap();

        // Registrar FCM token después de que el token esté guardado en AuthStorage
        try {
          console.log(
            '[PasswordScreen] Iniciando registro de FCM token después de registro',
          );
          const hasPermission = await requestNotificationPermission();
          console.log('[PasswordScreen] Permisos concedidos:', hasPermission);
          if (hasPermission) {
            const fcmToken = await getFCMToken();
            console.log(
              '[PasswordScreen] FCM token obtenido:',
              fcmToken ? 'Sí' : 'No',
            );
            if (fcmToken) {
              await registerFCMToken(fcmToken);
              // Configurar listener para rotación de tokens
              setupTokenRefreshListener();
            } else {
              console.warn('[PasswordScreen] No se pudo obtener FCM token');
            }
          } else {
            console.warn(
              '[PasswordScreen] Permisos de notificaciones no concedidos',
            );
          }
        } catch (fcmError) {
          console.error(
            '[PasswordScreen] Error al registrar FCM token:',
            fcmError,
          );
          // No interrumpir el flujo de registro si falla FCM
        }
      } else {
        console.warn(
          '[PasswordScreen] No se recibió token o usuario en la respuesta',
        );
      }

      // Limpiar datos del store
      dispatch(clearRegisterData());

      // Navigate to registration success screen
      (navigation as any).navigate('RegistrationSuccess');
    } catch (err: any) {
      // Asegurarse de que el error sea un string
      const errorMessage =
        typeof err === 'string'
          ? err
          : err?.message ||
            err?.toString() ||
            'Error al registrar usuario. Por favor, intenta de nuevo.';
      setAlertTitle('Error');
      setAlertMessage(errorMessage);
      setAlertType('error');
      setAlertVisible(true);
      console.error('Error al registrar usuario:', err);
    }
  };

  const content = (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="always"
      showsVerticalScrollIndicator={false}
      bounces={true}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../../images/creditivo-logo-full.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.title}>Escribe tu contraseña</Text>

      <Text style={styles.subtitle}>
        Tu contraseña es muy importante, no utilices secuencia numericas o tu
        fecha de cumpleaños 🤓
      </Text>

      <View style={styles.formArea}>
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
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
            activeOpacity={0.7}>
            <Icon
              name={showPassword ? 'eye-off' : 'eye'}
              type={IconType.Feather}
              size={SCREEN_WIDTH * 0.053}
              color="#676464"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.requirementsContainer}>
          {requirements.map((req, index) => (
            <View key={index} style={styles.requirementRow}>
              <View
                style={[
                  styles.requirementCheckbox,
                  {
                    backgroundColor: req.isValid
                      ? IVOO_COLORS.primary
                      : '#DADADA',
                    borderColor: req.isValid ? IVOO_COLORS.primary : '#DADADA',
                  },
                ]}>
                {req.isValid && (
                  <Icon
                    name="check"
                    type={IconType.MaterialCommunityIcons}
                    size={SCREEN_WIDTH * 0.027}
                    color={IVOO_COLORS.white}
                  />
                )}
              </View>
              <Text style={styles.requirementText}>{req.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Spacer to push button to bottom */}
      <View style={styles.spacer} />

      {/* Button */}
      <View style={styles.buttonContainer}>
        <Button
          onPress={handleContinue}
          title={isLoading ? 'Registrando...' : 'Continuar'}
          disabled={!isPasswordValid || isLoading}
          style={styles.continueButton}
        />
      </View>
    </ScrollView>
  );

  return (
    <>
      <RegisterLayout contentPaddingTop={0} logo={null} bottomAction={null}>
        {content}
      </RegisterLayout>
      <AlertModal
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        onClose={() => setAlertVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    marginTop: 0,
    marginBottom: SCREEN_HEIGHT * 0.04,
    alignItems: 'center',
  },
  logo: {
    width: SCREEN_WIDTH * 0.72,
    height: SCREEN_WIDTH * 0.72 * 0.154,
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    width: '100%',
    paddingTop: 0,
    paddingBottom: SCREEN_HEIGHT * 0.05,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: SCREEN_WIDTH * 0.063,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.black,
    textAlign: 'center',
    marginBottom: SCREEN_HEIGHT * 0.01,
    width: SCREEN_WIDTH * 0.92,
  },
  subtitle: {
    fontSize: SCREEN_WIDTH * 0.04,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    fontWeight: '300',
    color: '#676464',
    textAlign: 'center',
    marginBottom: SCREEN_HEIGHT * 0.06,
    width: SCREEN_WIDTH * 0.85,
  },
  formArea: {
    width: SCREEN_WIDTH * 0.75,
    maxWidth: 302,
    alignItems: 'center',
    flexShrink: 1,
    alignSelf: 'center',
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

  requirementsContainer: {
    marginTop: SCREEN_HEIGHT * 0.03,
    width: '100%',
    alignItems: 'flex-start',
    flexShrink: 1,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SCREEN_HEIGHT * 0.004,
  },
  requirementCheckbox: {
    width: SCREEN_WIDTH * 0.037,
    height: SCREEN_WIDTH * 0.037,
    borderRadius: SCREEN_WIDTH * 0.008,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SCREEN_WIDTH * 0.024,
  },
  requirementText: {
    fontSize: SCREEN_WIDTH * 0.037,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    fontWeight: '300',
    lineHeight: SCREEN_HEIGHT * 0.028,
    letterSpacing: SCREEN_WIDTH * 0.0016,
    color: '#676464',
    flex: 1,
  },
  spacer: {
    minHeight: SCREEN_HEIGHT * 0.3,
    flexGrow: 1,
  },
  buttonContainer: {
    width: SCREEN_WIDTH * 0.75,
    maxWidth: 302,
    alignItems: 'center',
    alignSelf: 'center',
  },
  continueButton: {},
});

export default PasswordScreen;
