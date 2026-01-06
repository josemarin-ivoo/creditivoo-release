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
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import * as yup from 'yup';
import {Input, AlertModal} from '../../components';
import RegisterLayout from '../../components/layouts/RegisterLayout';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../styles';
import {forgotPasswordOtp} from '../../services/auth';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

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
  const [alertType, setAlertType] = useState<'error' | 'warning' | 'info'>('error');

  useEffect(() => {
    const validateForm = async () => {
      try {
        await emailSchema.validate({ email: email.trim() });
        setIsValid(true);
      } catch (err) {
        setIsValid(false);
      }
    };
    validateForm();
  }, [email]);

  const handleContinue = async () => {
    try {
      setIsLoading(true);
      const trimmedEmail = email.trim();
      const otpResponse = await forgotPasswordOtp(trimmedEmail);
      setIsLoading(false);

      (navigation as any).navigate('ForgotPasswordOTP', {
        email: trimmedEmail,
        expiresInSeconds: otpResponse.expiresInSeconds,
        cooldownSeconds: otpResponse.cooldownSeconds,
      });
    } catch (err: any) {
      setIsLoading(false);
      const errorMessage = err.message || 'Error al enviar el correo.';
      setAlertTitle('Error');
      setAlertMessage(errorMessage);
      setAlertType('error');
      setAlertVisible(true);
    }
  };

  const handleCancel = () => navigation.goBack();

  const logo = (
    <Image
      source={require('../../images/creditivo-logo-full.png')}
      style={styles.logo}
      resizeMode="contain"
    />
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={{flex: 1}}>
        <RegisterLayout
          contentPaddingTop={SCREEN_HEIGHT * 0.09}
          logo={logo}
          bottomAction={null}>
          <Text style={styles.title}>Cambiar contraseña</Text>
          <Text style={styles.subtitle}>
            Enviaremos un correo con los pasos para recuperar tu contraseña
          </Text>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.formArea}>
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
                  activeOpacity={0.8}>
                  <Text style={styles.continueButtonText}>
                    {isLoading ? 'Enviando...' : 'Continuar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </RegisterLayout>

        <AlertModal
          visible={alertVisible}
          title={alertTitle}
          message={alertMessage}
          type={alertType}
          onClose={() => setAlertVisible(false)}
        />
      </View>
    </TouchableWithoutFeedback>
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
  },
  inputContainer: {
    width: '100%',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: SCREEN_WIDTH * 0.038,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: '#676464',
    marginBottom: 8,
    paddingLeft: 4,
    alignSelf: 'flex-start',
  },
  inputWrapper: {
    width: '100%',
  },
  buttonsContainer: {
    width: '100%',
    marginTop: SCREEN_HEIGHT * 0.07,
    alignItems: 'center',
    // La sombra se aplica a un contenedor externo para evitar el sangrado blanco
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  unifiedButton: {
    flexDirection: 'row',
    width: '100%',
    height: 50,
    borderRadius: 25,
    overflow: 'hidden', // Corta los botones hijos perfectamente
    borderWidth: 1.5,
    borderColor: IVOO_COLORS.primary,
    backgroundColor: IVOO_COLORS.white,
  },
  cancelButton: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: IVOO_COLORS.white,
  },
  cancelButtonText: {
    fontSize: SCREEN_WIDTH * 0.038,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: '700',
    color: IVOO_COLORS.primary,
  },
  continueButton: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: IVOO_COLORS.primary,
  },
  continueButtonDisabled: {
    backgroundColor: '#A5D6A7', // Un verde más claro para deshabilitado
    borderColor: '#A5D6A7',
    opacity: 0.8,
  },
  continueButtonText: {
    fontSize: SCREEN_WIDTH * 0.038,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: '700',
    color: IVOO_COLORS.white,
  },
});

export default ForgotPasswordScreen;