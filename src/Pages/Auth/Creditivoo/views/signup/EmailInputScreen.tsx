import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  Linking,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import * as yup from 'yup';
import {Button, Input, Checkbox, AlertModal} from '../../components';
import RegisterLayout from '../../components/layouts/RegisterLayout';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../styles';
import {SCREENS} from '@shared-constants';
import {sendEmailOTP} from '../../services';
import {useIvoSelector, useIvoDispatch} from '../../../../../redux/useIvo';
import {setEmail as setEmailInStore} from '../../store-creditivoo';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// Yup validation schema for email
const emailSchema = yup.object().shape({
  email: yup
    .string()
    .required('El correo electrónico es obligatorio')
    .email('Ingresa un correo electrónico válido'),
  acceptPolicy: yup
    .boolean()
    .oneOf([true], 'Debes aceptar la política de fines comerciales'),
});

const EmailInputScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useIvoDispatch();
  const [email, setEmail] = useState('');
  const [acceptPolicy, setAcceptPolicy] = useState(false);
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
            acceptPolicy,
          },
          {abortEarly: false},
        );
        setIsValid(true);
      } catch (err) {
        setIsValid(false);
      }
    };

    validateForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, acceptPolicy]);

  // Resetear el estado de carga cuando la pantalla recibe el foco
  useFocusEffect(
    React.useCallback(() => {
      setIsLoading(false);
    }, []),
  );

  const handleContinue = async () => {
    try {
      await emailSchema.validate(
        {
          email: email.trim(),
          acceptPolicy,
        },
        {abortEarly: false},
      );

      setIsLoading(true);
      
      // Enviar OTP al correo electrónico
      const trimmedEmail = email.trim();
      const otpResponse = await sendEmailOTP(trimmedEmail);

      // Si el email ya está verificado, significa que ya existe un usuario
      if (otpResponse.isAlreadyVerified) {
        setIsLoading(false);
        setAlertTitle('Usuario existente');
        setAlertMessage(
          'Ya existe un usuario registrado con este correo electrónico. Por favor, inicia sesión.',
        );
        setAlertType('info');
        setAlertVisible(true);
        console.log('Email ya verificado - usuario existente');
        return;
      }

      console.log('OTP enviado exitosamente a:', trimmedEmail);

      // Guardar email en el store
      dispatch(setEmailInStore(trimmedEmail));

      // Navegar a la pantalla de verificación OTP
      (navigation as any).navigate('EmailOTPVerification', {
        email: trimmedEmail,
      });
    } catch (err: any) {
      setIsLoading(false);

      // Si es error de validación, el botón debería estar deshabilitado
      if (err.errors) {
        console.log('Validation failed:', err);
        return;
      }

      // Error de la API - el mensaje ya viene del backend (incluye cooldown si es 429)
      const errorMessage =
        err.message ||
        'Error al enviar el código. Por favor, intenta de nuevo.';

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
      console.error('Error al enviar OTP:', err);
    }
  };

  const handlePolicyPress = () => {
    // TODO: Open commercial policy
    Linking.openURL('https://ivoo.app/commercial-policy');
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
      <Text style={styles.title}>Ingresa tu correo</Text>

      <Text style={styles.subtitle}>
        Te enviaremos a tu correo electrónico con un código de 6 dígitos para
        validarlo 📩
      </Text>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.formArea}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        <Input
          placeholder="ivitoo@gmail.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          containerStyle={styles.inputWrapper}
        />

        <View style={styles.policyContainer}>
          <Checkbox
            checked={acceptPolicy}
            onToggle={() => setAcceptPolicy(!acceptPolicy)}
            style={styles.checkbox}
            size={18}
          />
          <Text style={styles.policyText}>
            Autorizo el uso de mi correo electrónico según la politicas de{' '}
            <Text style={styles.policyLink} onPress={handlePolicyPress}>
              fines comerciales de IVOO APP.
            </Text>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </>
  );

  const bottomAction = (
    <Button
      onPress={handleContinue}
      title={isLoading ? 'Enviando...' : 'Continuar'}
      disabled={!isValid || isLoading}
      style={styles.continueButton}
    />
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
    marginBottom: SCREEN_HEIGHT * 0.03,
    width: SCREEN_WIDTH * 0.85,
  },
  formArea: {
    width: SCREEN_WIDTH * 0.75, // Same width as RegisterScreen
    alignItems: 'center',
    flexShrink: 1,
  },
  inputWrapper: {
    width: '100%',
  },
  policyContainer: {
    flexDirection: 'row',
    marginTop: SCREEN_HEIGHT * 0.03,
    width: SCREEN_WIDTH * 0.75, // Same width as formArea
    flexShrink: 1,
  },
  checkbox: {
    marginRight: SCREEN_WIDTH * 0.024,
    marginTop: 2,
  },
  policyText: {
    flex: 1,
    fontSize: SCREEN_WIDTH * 0.032,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: '#828282',
  },
  policyLink: {
    textDecorationLine: 'underline',
    color: '#828282',
  },
  continueButton: {},
});

export default EmailInputScreen;
