import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {OtpInput} from 'react-native-otp-entry';
import * as yup from 'yup';
import RegisterLayout from '../../components/layouts/RegisterLayout';
import {IVOO_COLORS, IVOO_SPACING, IVOO_TYPOGRAPHY} from '../../styles';
import {forgotPasswordOtp} from '../../services/auth';
import {AlertModal} from '../../components';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const OTP_LENGTH = 6;

// Yup validation schema for OTP
const otpSchema = yup.object().shape({
  code: yup
    .string()
    .required('El código es obligatorio')
    .length(OTP_LENGTH, `El código debe tener ${OTP_LENGTH} dígitos`)
    .matches(/^\d+$/, 'El código debe contener solo números'),
});

type ForgotPasswordOTPRouteParams = {
  email: string;
  expiresInSeconds?: number;
  cooldownSeconds?: number;
};

type ForgotPasswordOTPRouteProp = RouteProp<
  {ForgotPasswordOTP: ForgotPasswordOTPRouteParams},
  'ForgotPasswordOTP'
>;

const ForgotPasswordOTPScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<ForgotPasswordOTPRouteProp>();
  const email = route.params?.email || '';
  const initialExpiresIn = route.params?.expiresInSeconds || 600;
  const initialCooldown = route.params?.cooldownSeconds || 60;

  const [otpCode, setOtpCode] = useState<string>('');
  const [isOtpValid, setIsOtpValid] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'error' | 'warning' | 'info'>(
    'error',
  );
  const [countdown, setCountdown] = useState<number>(initialCooldown);
  const [expiresCountdown, setExpiresCountdown] =
    useState<number>(initialExpiresIn);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const expiresCountdownRef = useRef<NodeJS.Timeout | null>(null);

  // Iniciar cuenta regresiva cuando la pantalla se monta
  useEffect(() => {
    // Countdown para reenvío
    if (countdown > 0) {
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            if (countdownRef.current) {
              clearInterval(countdownRef.current);
              countdownRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    // Countdown para expiración
    if (expiresCountdown > 0) {
      expiresCountdownRef.current = setInterval(() => {
        setExpiresCountdown(prev => {
          if (prev <= 1) {
            if (expiresCountdownRef.current) {
              clearInterval(expiresCountdownRef.current);
              expiresCountdownRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    // Limpiar intervalos al desmontar
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
      if (expiresCountdownRef.current) {
        clearInterval(expiresCountdownRef.current);
        expiresCountdownRef.current = null;
      }
    };
  }, []);

  const validateOtpCode = async (code: string) => {
    try {
      await otpSchema.validate({code}, {abortEarly: false});
      setIsOtpValid(true);
      setError(null);
      return true;
    } catch (err: any) {
      setIsOtpValid(false);
      if (code.length === OTP_LENGTH) {
        if (err.errors && err.errors.length > 0) {
          setError(err.errors[0]);
        } else {
          setError('Código inválido');
        }
      } else {
        setError(null);
      }
      return false;
    }
  };

  const handleOtpChange = async (code: string) => {
    setOtpCode(code);
    await validateOtpCode(code);
  };

  const handleVerify = async () => {
    const isValidOtp = await validateOtpCode(otpCode);

    if (!isValidOtp || !email) {
      return;
    }

    setIsVerifying(true);
    setError(null);

    // Navegar a la pantalla de reset password con el código OTP
    (navigation as any).navigate('ResetPassword', {
      email,
      otpCode,
    });
    setIsVerifying(false);
  };

  const handleResend = async () => {
    if (!email) {
      setAlertTitle('Error');
      setAlertMessage('No se encontró el correo electrónico.');
      setAlertType('error');
      setAlertVisible(true);
      return;
    }

    setIsResending(true);
    setError(null);

    try {
      const response = await forgotPasswordOtp(email);
      setOtpCode('');
      setIsOtpValid(false);

      setAlertTitle('Código reenviado');
      setAlertMessage(
        'Se ha enviado un nuevo código OTP a tu correo electrónico.',
      );
      setAlertType('info');
      setAlertVisible(true);

      // Reiniciar cuenta regresiva
      setCountdown(response.cooldownSeconds || 60);
      setExpiresCountdown(response.expiresInSeconds || 600);

      // Limpiar intervalos anteriores
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
      if (expiresCountdownRef.current) {
        clearInterval(expiresCountdownRef.current);
      }

      // Reiniciar countdown de cooldown
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            if (countdownRef.current) {
              clearInterval(countdownRef.current);
              countdownRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Reiniciar countdown de expiración
      expiresCountdownRef.current = setInterval(() => {
        setExpiresCountdown(prev => {
          if (prev <= 1) {
            if (expiresCountdownRef.current) {
              clearInterval(expiresCountdownRef.current);
              expiresCountdownRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      console.log('OTP reenviado exitosamente a:', email);
    } catch (err: any) {
      const errorMessage =
        err.message ||
        'Error al reenviar el código. Por favor, intenta de nuevo.';

      // Título diferente para cooldown
      const title =
        errorMessage.includes('espera') ||
        errorMessage.includes('cooldown') ||
        errorMessage.includes('Cooldown')
          ? 'Espera requerida'
          : 'Error';

      const type: 'error' | 'warning' =
        errorMessage.includes('espera') ||
        errorMessage.includes('cooldown') ||
        errorMessage.includes('Cooldown')
          ? 'warning'
          : 'error';

      setAlertTitle(title);
      setAlertMessage(errorMessage);
      setAlertType(type);
      setAlertVisible(true);
      console.error('Error al reenviar OTP:', err);
    } finally {
      setIsResending(false);
    }
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
      <Text style={styles.title}>Escribe el código</Text>

      <Text style={styles.subtitle}>
        Ingresa el código de 6 dígitos para cambiar tu contraseña
      </Text>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.formArea}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        <View style={styles.otpContainer}>
          <OtpInput
            numberOfDigits={OTP_LENGTH}
            onTextChange={handleOtpChange}
            autoFocus
            theme={{
              containerStyle: styles.otpInputContainer,
              pinCodeContainerStyle: styles.otpInputBox,
              pinCodeTextStyle: styles.otpInputText,
              focusedPinCodeContainerStyle: styles.otpInputBoxFocused,
            }}
          />
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>

        {/* Resend Code */}
        <View style={styles.resendContainer}>
          {countdown === 0 && (
            <Text style={styles.resendQuestion}>¿No recibiste el código?</Text>
          )}
          <TouchableOpacity
            onPress={handleResend}
            disabled={isResending || countdown > 0}
            style={[
              styles.resendButton,
              (isResending || countdown > 0) && styles.resendButtonDisabled,
            ]}>
            {isResending ? (
              <ActivityIndicator size="small" color={IVOO_COLORS.primary} />
            ) : countdown > 0 ? (
              <Text style={[styles.resendLink, styles.resendLinkDisabled]}>
                Reenviar código ({countdown}s)
              </Text>
            ) : (
              <Text style={styles.resendLink}>Reenviar código</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );

  const bottomAction = (
    <TouchableOpacity
      style={[styles.verifyButton, !isOtpValid && styles.verifyButtonDisabled]}
      onPress={handleVerify}
      disabled={!isOtpValid || isVerifying}
      activeOpacity={0.8}>
      {isVerifying ? (
        <ActivityIndicator size="small" color={IVOO_COLORS.white} />
      ) : (
        <Text
          style={[
            styles.verifyButtonText,
            !isOtpValid && styles.verifyButtonTextDisabled,
          ]}>
          Verificar
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <>
      <RegisterLayout
        contentPaddingTop={SCREEN_HEIGHT * 0.09}
        logo={logo}
        bottomAction={bottomAction}>
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
    marginBottom: SCREEN_HEIGHT * 0.01,
    width: SCREEN_WIDTH * 0.92,
  },
  subtitle: {
    fontSize: SCREEN_WIDTH * 0.042,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    fontWeight: '300',
    color: '#676464',
    textAlign: 'center',
    marginBottom: SCREEN_HEIGHT * 0.04,
    width: SCREEN_WIDTH * 0.85,
  },
  formArea: {
    width: SCREEN_WIDTH * 0.82,
    alignItems: 'center',
    flexShrink: 1,
  },
  otpContainer: {
    marginTop: SCREEN_HEIGHT * 0.02,
    alignItems: 'center',
    width: '100%',
    marginBottom: SCREEN_HEIGHT * 0.04,
  },
  otpInputContainer: {
    gap: 14.7,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  otpInputBox: {
    width: 35,
    height: 35,
    backgroundColor: '#F2F2F2',
    borderWidth: 1,
    borderColor: 'rgba(31, 31, 31, 0.4)',
    borderRadius: 4.438,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpInputBoxFocused: {
    borderColor: 'rgba(31, 31, 31, 0.4)',
    borderWidth: 1,
  },
  otpInputText: {
    fontSize: 24,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.black,
    lineHeight: 35,
    includeFontPadding: false,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  resendContainer: {
    marginTop: SCREEN_HEIGHT * 0.02,
    marginBottom: SCREEN_HEIGHT * 0.04,
    alignItems: 'center',
    width: '100%',
  },
  resendQuestion: {
    fontSize: 16,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.regular,
    lineHeight: 21.657,
    letterSpacing: 0.0591,
    color: IVOO_COLORS.black,
    textAlign: 'center',
    marginBottom: 8,
  },
  resendButton: {
    minHeight: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendLink: {
    fontSize: 16,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    lineHeight: 21.657,
    letterSpacing: 0.0591,
    color: '#1F1F1F',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  resendLinkDisabled: {
    color: IVOO_COLORS.grayMedium,
    textDecorationLine: 'none',
  },
  resendButtonDisabled: {
    opacity: 0.6,
  },
  errorText: {
    fontSize: 12,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: IVOO_COLORS.error,
    textAlign: 'center',
    marginTop: 8,
  },
  verifyButton: {
    backgroundColor: IVOO_COLORS.primary,
    borderRadius: IVOO_SPACING.buttonBorderRadius,
    paddingVertical: SCREEN_HEIGHT * 0.018,
    paddingHorizontal: SCREEN_WIDTH * 0.1,
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButtonDisabled: {
    backgroundColor: IVOO_COLORS.grayLight,
    opacity: 0.6,
  },
  verifyButtonText: {
    fontSize: SCREEN_WIDTH * 0.042,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.white,
  },
  verifyButtonTextDisabled: {
    color: IVOO_COLORS.grayMedium,
  },
});

export default ForgotPasswordOTPScreen;
