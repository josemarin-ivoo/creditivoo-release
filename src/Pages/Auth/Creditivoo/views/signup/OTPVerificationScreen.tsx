import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {OtpInput} from 'react-native-otp-entry';
import RegisterLayout from '../../components/layouts/RegisterLayout';
import {IVOO_COLORS, IVOO_SPACING, IVOO_TYPOGRAPHY} from '../../styles';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const OTP_LENGTH = 6;

const OTPVerificationScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleOtpChange = (code: string) => {
    if (code.length === OTP_LENGTH) {
      handleVerify(code);
    }
  };

  const handleVerify = (code: string) => {
    // TODO: Verificar código OTP
    console.log('Verifying OTP:', code);
    // Navigate to email input screen
    (navigation as any).navigate('EmailInput');
  };

  const handleResend = () => {
    // TODO: Reenviar código OTP
    // The OtpInput component will handle clearing internally
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
        Ingresa el código de 6 digitos para validar tu número telefónico 📲
      </Text>

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
      </View>

      <View style={styles.resendContainer}>
        <Text style={styles.resendQuestion}>¿No recibiste el código?</Text>
        <TouchableOpacity onPress={handleResend}>
          <Text style={styles.resendLink}>Reenviar código</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const bottomAction = <View />;

  return (
    <>
      <RegisterLayout
        contentPaddingTop={SCREEN_HEIGHT * 0.09}
        logo={logo}
        bottomAction={bottomAction}>
        {content}
      </RegisterLayout>
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
    marginBottom: SCREEN_HEIGHT * 0.06,
    width: SCREEN_WIDTH * 0.75,
  },
  otpContainer: {
    marginTop: SCREEN_HEIGHT * 0.02,
    alignItems: 'center',
    width: '100%',
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
    marginTop: SCREEN_HEIGHT * 0.045,
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
});

export default OTPVerificationScreen;
