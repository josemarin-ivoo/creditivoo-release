import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Text,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import {IVOO_COLORS, IVOO_SPACING, IVOO_TYPOGRAPHY} from '@creditivo-style';

interface RouteParams {
  phoneNumber?: string;
}

const OTP_LENGTH = 6;

const OTPVerificationScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {phoneNumber} = (route.params as RouteParams) || {};

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    // Auto-focus first input
    inputRefs.current[0]?.focus();
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    // Solo permitir números
    const numericValue = value.replace(/[^0-9]/g, '');

    if (numericValue.length > 1) {
      // Si se pega un código completo
      const digits = numericValue.slice(0, OTP_LENGTH).split('');
      const newOtp = [...otp];
      digits.forEach((digit, i) => {
        if (index + i < OTP_LENGTH) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);

      // Mover focus al último dígito ingresado
      const nextIndex = Math.min(index + digits.length, OTP_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
    } else {
      // Un solo dígito
      const newOtp = [...otp];
      newOtp[index] = numericValue;
      setOtp(newOtp);

      // Mover al siguiente input si hay un valor
      if (numericValue && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }

    // Si todos los campos están llenos, verificar automáticamente
    const updatedOtp = [...otp];
    updatedOtp[index] = numericValue;
    if (
      updatedOtp.every(digit => digit !== '') &&
      updatedOtp.join('').length === OTP_LENGTH
    ) {
      handleVerify(updatedOtp.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Si se presiona backspace y el campo está vacío, ir al anterior
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = (code?: string) => {
    const otpCode = code || otp.join('');
    if (otpCode.length === OTP_LENGTH) {
      // TODO: Verificar código OTP
      console.log('Verifying OTP:', otpCode);
      // navigation.navigate(SCREENS.HOME);
    }
  };

  const handleResend = () => {
    // TODO: Reenviar código OTP
    setOtp(Array(OTP_LENGTH).fill(''));
    inputRefs.current[0]?.focus();
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
        {/* Creditivoo Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../images/creditivo-logo-full.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>Escribe el código</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Ingresa el código de 6 digitos para validar tu número de celular 📲
        </Text>

        {/* OTP Input Fields */}
        <View style={styles.otpContainer}>
          {Array.from({length: OTP_LENGTH}).map((_, index) => (
            <TextInput
              key={index}
              ref={ref => (inputRefs.current[index] = ref)}
              style={[
                styles.otpInput,
                otp[index] ? styles.otpInputFilled : null,
              ]}
              value={otp[index]}
              onChangeText={value => handleOtpChange(value, index)}
              onKeyPress={e => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              textAlign="center"
            />
          ))}
        </View>

        {/* Resend Code Section */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendQuestion}>¿No recibiste el código?</Text>
          <TouchableOpacity onPress={handleResend}>
            <Text style={styles.resendLink}>Reenviar código</Text>
          </TouchableOpacity>
        </View>

        {/* Home Indicator */}
        <View style={styles.homeIndicator} />
      </ScrollView>
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
    alignItems: 'center',
    paddingBottom: 10,
  },
  logoContainer: {
    width: 272,
    height: 42,
    marginTop: 83,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 24,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    lineHeight: 21.657,
    letterSpacing: 0.0591,
    color: IVOO_COLORS.black,
    textAlign: 'center',
    marginTop: 68,
    width: 307,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    fontWeight: '300',
    lineHeight: 21.657,
    letterSpacing: 0.0591,
    color: '#676464',
    textAlign: 'center',
    marginTop: 40,
    width: 296,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 69,
    gap: 14.7,
  },
  otpInput: {
    width: 35,
    height: 35,
    backgroundColor: '#F2F2F2',
    borderWidth: 1,
    borderColor: 'rgba(31, 31, 31, 0.4)',
    borderRadius: 4.438,
    fontSize: 20,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.black,
    textAlign: 'center',
  },
  otpInputFilled: {
    backgroundColor: '#F2F2F2',
  },
  resendContainer: {
    marginTop: 58,
    alignItems: 'center',
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
  homeIndicator: {
    position: 'absolute',
    bottom: IVOO_SPACING.homeIndicatorBottom,
    left: '50%',
    marginLeft: IVOO_SPACING.homeIndicatorMargin,
    width: IVOO_SPACING.homeIndicatorWidth,
    height: IVOO_SPACING.homeIndicatorHeight,
    backgroundColor: IVOO_COLORS.black,
    borderRadius: IVOO_SPACING.homeIndicatorBorderRadius,
  },
});

export default OTPVerificationScreen;
