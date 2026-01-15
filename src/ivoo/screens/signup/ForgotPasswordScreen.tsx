import React, {useState, useEffect} from 'react';
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
import {useNavigation} from '@react-navigation/native';
import * as yup from 'yup';
import {Button, Input, AlertModal} from '../../components';
import RegisterLayout from '../../components/layouts/RegisterLayout';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../styles';
import {forgotPasswordOtp} from '../../services/auth';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// Yup validation schema for email
const emailSchema = yup.object().shape({
  email: yup
    .string()
    .required('El correo electrónico es obligatorio')
    .email('Ingresa un correo electrónico válido'),
});

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [isValid, setIsValid] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'error' | 'warning' | 'info'>(
    'error',
  );

  useEffect(() => {
    const validateForm = async () => {
      try {
        await emailSchema.validate(
          {
            email: email.trim(),
          },
          {abortEarly: false},
        );
        setIsValid(true);
      } catch (err) {
        setIsValid(false);
      }
    };

    validateForm();
  }, [email]);

  const handleContinue = async () => {
    try {
      await emailSchema.validate(
        {
          email: email.trim(),
        },
        {abortEarly: false},
      );

      setIsLoading(true);

      // Enviar solicitud de recuperación de contraseña con OTP
      const trimmedEmail = email.trim();
      const otpResponse = await forgotPasswordOtp(trimmedEmail);

      setIsLoading(false);

      // Navegar a la pantalla de OTP para reset password
      (navigation as any).navigate('ForgotPasswordOTP', {
        email: trimmedEmail,
        expiresInSeconds: otpResponse.expiresInSeconds,
        cooldownSeconds: otpResponse.cooldownSeconds,
      });
    } catch (err: any) {
      setIsLoading(false);

      // Si es error de validación, el botón debería estar deshabilitado
      if (err.errors) {
        console.log('Validation failed:', err);
        return;
      }

      // Error de la API
      const errorMessage =
        err.message ||
        'Error al enviar el correo. Por favor, intenta de nuevo.';

      setAlertTitle('Error');
      setAlertMessage(errorMessage);
      setAlertType('error');
      setAlertVisible(true);
      console.error('Error al enviar correo de recuperación:', err);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
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

      <Text style={styles.subtitle}>
        Enviaremos un correo con los pasos para recuperar tu contraseña
      </Text>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.formArea}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Correo electrónico:</Text>
          <Input
            placeholder="ejemplo@gmail.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            containerStyle={styles.inputWrapper}
          />
        </View>

        {/* Buttons below input */}
        <View style={styles.buttonsContainer}>
          <View style={styles.unifiedButton}>
            <TouchableOpacity
              onPress={handleCancel}
              style={styles.cancelButton}
              disabled={isLoading}
              activeOpacity={0.7}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleContinue}
              style={[
                styles.continueButton,
                (!isValid || isLoading) && styles.continueButtonDisabled,
              ]}
              disabled={!isValid || isLoading}
              activeOpacity={0.7}>
              {isLoading ? (
                <Text style={styles.continueButtonText}>Enviando...</Text>
              ) : (
                <Text style={styles.continueButtonText}>Continuar</Text>
              )}
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
    width: SCREEN_WIDTH * 0.85,
  },
  formArea: {
    width: SCREEN_WIDTH * 0.82,
    alignItems: 'center',
    flexShrink: 1,
  },
  inputContainer: {
    width: '100%',
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
  inputWrapper: {
    width: '100%',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: SCREEN_HEIGHT * 0.07,
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
  continueButton: {
    flex: 1,
    height: '100%',
    backgroundColor: IVOO_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonText: {
    fontSize: SCREEN_WIDTH * 0.038,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.white,
  },
});

export default ForgotPasswordScreen;
