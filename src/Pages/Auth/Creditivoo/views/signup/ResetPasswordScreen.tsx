import React, {useState, useMemo} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {SCREENS} from '@shared-constants';
import {Input, AlertModal} from '../../components';
import RegisterLayout from '../../components/layouts/RegisterLayout';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../styles';
import {resetPasswordOtp} from '../../services/auth';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';
import {useIvoDispatch} from '../../store/hooks';
import {updateAuth} from '../../store';
import {User} from '../../store/slices/auth-slice';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

interface PasswordRequirement {
  label: string;
  isValid: boolean;
}

type ResetPasswordRouteParams = {
  email: string;
  otpCode: string;
};

type ResetPasswordRouteProp = RouteProp<
  {ResetPassword: ResetPasswordRouteParams},
  'ResetPassword'
>;

const ResetPasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<ResetPasswordRouteProp>();
  const dispatch = useIvoDispatch();
  const email = route.params?.email || '';
  const otpCode = route.params?.otpCode || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'error' | 'warning' | 'info'>(
    'error',
  );

  // Validate password requirements (same as PasswordScreen.tsx + password match)
  const requirements: PasswordRequirement[] = useMemo(() => {
    const hasLength = password.length >= 8 && password.length <= 20;
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[$./!@#]/.test(password);
    const passwordsMatch = password === confirmPassword && password.length > 0;

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
      {
        label: 'Las contraseñas deben coincidir',
        isValid: passwordsMatch,
      },
    ];
  }, [password, confirmPassword]);

  const isPasswordValid = useMemo(() => {
    return requirements.every(req => req.isValid);
  }, [requirements]);

  const isValid = useMemo(() => {
    return (
      isPasswordValid && password === confirmPassword && password.length > 0
    );
  }, [isPasswordValid, password, confirmPassword]);

  const handleConfirm = async () => {
    if (!isValid || !email || !otpCode) {
      setAlertTitle('Error de validación');
      setAlertMessage(
        'Por favor, completa todos los requisitos de la contraseña y verifica que las contraseñas coincidan.',
      );
      setAlertType('error');
      setAlertVisible(true);
      return;
    }

    setIsResetting(true);

    try {
      const response = await resetPasswordOtp({
        email,
        otpCode,
        newPassword: password,
      });

      // Actualizar estado de autenticación con token y usuario
      if (response.token && response.user) {
        console.log(
          '[ResetPasswordScreen] Actualizando estado de autenticación',
        );
        const userData: User = {
          id: response.user.id,
          email: response.user.email,
          phone: response.user.phone || '',
          name: response.user.name || '',
          lastname: response.user.lastname || '',
          fullname:
            response.user.fullname ||
            `${response.user.name || ''} ${
              response.user.lastname || ''
            }`.trim() ||
            response.user.email,
          username: response.user.username || response.user.email,
          document: response.user.document || null,
          dob: response.user.dob || null,
          role: response.user.role || 'user',
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
            token: response.token,
            user: userData,
          }),
        ).unwrap();

        setAlertTitle('Contraseña restablecida');
        setAlertMessage(
          'Tu contraseña ha sido restablecida exitosamente. Serás redirigido al inicio.',
        );
        setAlertType('info');
        setAlertVisible(true);

        // Navegar a la pantalla principal después de un breve delay
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{name: 'MainTabs' as never}],
          });
        }, 2000);
      }
    } catch (err: any) {
      const errorMessage =
        err.message ||
        'Error al restablecer la contraseña. Por favor, intenta de nuevo.';
      setAlertTitle('Error');
      setAlertMessage(errorMessage);
      setAlertType('error');
      setAlertVisible(true);
      console.error('Error al restablecer contraseña:', err);
    } finally {
      setIsResetting(false);
    }
  };

  const handleCancel = () => {
    // Limpiar todos los campos
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);

    // Navegar a la pantalla de login y limpiar el stack de navegación
    navigation.reset({
      index: 0,
      routes: [{name: SCREENS.LOGIN as never}],
    });
  };

  const logo = (
    <Image
      source={require('../../images/creditivo-logo-full.png')}
      style={styles.logo}
      resizeMode="contain"
    />
  );

  const content = (
    <>
      <Text style={styles.title}>Cambiar contraseña</Text>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.formArea}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Nueva contraseña:</Text>
          <View style={styles.passwordInputWrapper}>
            <Input
              placeholder="Nueva contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              containerStyle={styles.passwordInputContainer}
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
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Repite la contraseña:</Text>
          <View style={styles.passwordInputWrapper}>
            <Input
              placeholder="Repite la contraseña"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
              containerStyle={styles.passwordInputContainer}
              style={styles.passwordInput}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              activeOpacity={0.7}>
              <Icon
                name={showConfirmPassword ? 'eye-off' : 'eye'}
                type={IconType.Feather}
                size={SCREEN_WIDTH * 0.053}
                color="#676464"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Password requirements */}
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

        {/* Buttons below inputs */}
        <View style={styles.buttonsContainer}>
          <View style={styles.unifiedButton}>
            <TouchableOpacity
              onPress={handleCancel}
              style={styles.cancelButton}
              disabled={isResetting}
              activeOpacity={0.7}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleConfirm}
              style={[
                styles.confirmButton,
                (!isValid || isResetting) && styles.confirmButtonDisabled,
              ]}
              disabled={!isValid || isResetting}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.confirmButtonText,
                  (!isValid || isResetting) && styles.confirmButtonTextDisabled,
                ]}>
                {isResetting ? 'Confirmando...' : 'Confirmar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  );

  return (
    <>
      <RegisterLayout
        contentPaddingTop={SCREEN_HEIGHT * 0.09}
        logo={logo}
        bottomAction={null}>
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
  logo: {
    width: SCREEN_WIDTH * 0.72,
    height: SCREEN_WIDTH * 0.72 * 0.154,
  },
  title: {
    fontSize: SCREEN_WIDTH * 0.063,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.black,
    textAlign: 'center',
    marginBottom: SCREEN_HEIGHT * 0.04,
    width: SCREEN_WIDTH * 0.92,
  },
  formArea: {
    width: SCREEN_WIDTH * 0.82,
    alignItems: 'center',
    flexShrink: 1,
  },
  inputContainer: {
    width: '100%',
    marginBottom: SCREEN_HEIGHT * 0.02,
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: SCREEN_WIDTH * 0.038,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.regular,
    color: '#676464',
    marginBottom: 8,
    paddingLeft: 4,
    alignSelf: 'flex-start',
  },
  passwordInputWrapper: {
    position: 'relative',
    width: '100%',
    alignItems: 'center',
  },
  passwordInputContainer: {
    width: '100%',
    height: 53,
    alignSelf: 'center',
  },
  passwordInput: {
    // fontSize: SCREEN_WIDTH * 0.05342343,
  },
  eyeIcon: {
    position: 'absolute',
    right: SCREEN_WIDTH * 0.042,
    top: SCREEN_HEIGHT * 0.025,
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
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: SCREEN_HEIGHT * 0.05,
  },
  unifiedButton: {
    flexDirection: 'row',
    width: SCREEN_WIDTH * 0.82,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: IVOO_COLORS.white,
    borderWidth: 1,
    borderColor: IVOO_COLORS.primary,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cancelButton: {
    flex: 1,
    height: '100%',
    backgroundColor: IVOO_COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: IVOO_COLORS.primary,
  },
  cancelButtonText: {
    fontSize: SCREEN_WIDTH * 0.038,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.primary,
  },
  confirmButton: {
    flex: 1,
    height: '100%',
    backgroundColor: IVOO_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    fontSize: SCREEN_WIDTH * 0.038,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.white,
  },
  confirmButtonTextDisabled: {
    opacity: 0.8,
  },
});

export default ResetPasswordScreen;
