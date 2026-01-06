import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  Linking,
  Dimensions,
  ScrollView,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import * as yup from 'yup';
import {Button, Checkbox, AlertModal} from '../../components';
import RegisterLayout from '../../components/layouts/RegisterLayout';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../styles';
import {SCREENS} from '@shared-constants';
import MaskInput from 'react-native-mask-input';
import {sendOTP} from '../../services/otpVerification'; // Comentado para debug
import {useIvoDispatch} from '../../../../../redux/useIvo';
import {setPhoneNumber as setPhoneNumberInStore} from '../../store-creditivoo';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// Yup validation schema for phone number
// Note: phoneNumber will be unmasked (only digits, starting with 58)
// Format: +58 (XXX) YYY YY YY = 58 + 3 + 3 + 2 + 2 = 12 dígitos totales
const phoneSchema = yup.object().shape({
  phoneNumber: yup
    .string()
    .required('El número telefónico es obligatorio')
    .matches(
      /^58\d{10}$/,
      'Ingresa un número telefónico válido (+58 seguido de 10 dígitos)',
    ),
  acceptTerms: yup
    .boolean()
    .oneOf([true], 'Debes aceptar los términos y condiciones'),
});

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useIvoDispatch();
  const [phoneNumber, setPhoneNumber] = useState('58'); // Start with country code
  const [acceptTerms, setAcceptTerms] = useState(false);
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
        await phoneSchema.validate(
          {
            phoneNumber: phoneNumber.trim(),
            acceptTerms,
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
  }, [phoneNumber, acceptTerms]);

  // Resetear el estado de carga cuando la pantalla recibe el foco
  useFocusEffect(
    React.useCallback(() => {
      setIsLoading(false);
    }, []),
  );

  const handleContinue = async () => {
    try {
      await phoneSchema.validate(
        {
          phoneNumber: phoneNumber.trim(),
          acceptTerms,
        },
        {abortEarly: false},
      );
      setIsLoading(true);
      // Enviar OTP al número telefónico
      const trimmedPhone = phoneNumber.trim();

      const otpResponse = await sendOTP(trimmedPhone);

      // Si el teléfono ya está verificado, significa que ya existe un usuario
      if (otpResponse.isAlreadyVerified) {
        setIsLoading(false);
        setAlertTitle('Usuario existente');
        setAlertMessage(
          'Ya existe un usuario registrado con este número telefónico. Por favor, inicia sesión.',
        );
        setAlertType('info');
        setAlertVisible(true);
        console.log('Teléfono ya verificado - usuario existente');
        return;
      }

      console.log('OTP enviado exitosamente a:', trimmedPhone);

      // Guardar phoneNumber en el store
      dispatch(setPhoneNumberInStore(trimmedPhone));

      // Navegar a la pantalla de verificación OTP
      (navigation as any).navigate(SCREENS.OTP_VERIFICATION, {
        phoneNumber: trimmedPhone,
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

      <View style={styles.illustrationContainer}>
        <Image
          source={require('../../images/onboarding/mobile-register-phone.png')}
          style={styles.phoneIllustration}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.title}>Ingresa tu número telefónico</Text>

      <Text style={styles.subtitle}>
        Te enviaremos un SMS con un código de 6 dígitos para validar tu teléfono
        😉
      </Text>

      <View style={styles.formArea}>
        <View style={styles.inputContainerWrapper}>
          <View style={[styles.inputWrapper, styles.inputContainer]}>
            <MaskInput
              value={phoneNumber}
              onChangeText={(_masked: string, unmasked: string) => {
                // Extract only digits
                const digits = unmasked.replace(/\D/g, '');

                // Ensure +58 prefix is always present
                if (digits.length === 0) {
                  setPhoneNumber('58');
                } else if (!digits.startsWith('58')) {
                  // If user tries to delete +58, restore it
                  setPhoneNumber('58' + digits);
                } else {
                  // Limit to 12 digits total (58 + 10 digits: 3+3+2+2)
                  if (digits.length <= 12) {
                    setPhoneNumber(digits);
                  } else {
                    setPhoneNumber(digits.substring(0, 12));
                  }
                }
              }}
              mask={[
                '+',
                '5',
                '8',
                ' ',
                '(',
                /\d/,
                /\d/,
                /\d/,
                ')',
                ' ',
                /\d/,
                /\d/,
                /\d/,
                ' ',
                /\d/,
                /\d/,
                ' ',
                /\d/,
                /\d/,
              ]}
              placeholder="+58 (___) ___ __ __"
              placeholderTextColor="#B4B4B4"
              keyboardType="phone-pad"
              style={styles.maskInput}
              editable={true}
            />
          </View>
          <Text style={styles.hintText}>Ejemplo: +58 (412) 123 45 67</Text>
        </View>

        <View style={styles.termsContainer}>
          <Checkbox
            checked={acceptTerms}
            onToggle={() => setAcceptTerms(!acceptTerms)}
            style={styles.checkbox}
            size={18}
          />
          <Text style={styles.termsText}>
            Acepto los{' '}
            <Text
              style={styles.termsLink}
              onPress={() => Linking.openURL('https://ivoo.app/terms')}>
              términos de uso
            </Text>{' '}
            y{' '}
            <Text
              style={styles.termsLink}
              onPress={() => Linking.openURL('https://ivoo.app/privacy')}>
              tratamiento de datos personales de IVOO APP.
            </Text>
          </Text>
        </View>
      </View>

      {/* Spacer to push button to bottom */}
      <View style={styles.spacer} />

      {/* Button */}
      <View style={styles.buttonContainer}>
        <Button
          onPress={handleContinue}
          title={isLoading ? 'Enviando...' : 'Continuar'}
          disabled={!isValid || isLoading}
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
  illustrationContainer: {
    width: SCREEN_WIDTH * 0.32,
    height: SCREEN_WIDTH * 0.32 * 1.408,
    maxHeight: SCREEN_HEIGHT * 0.2, // Limit height on small screens
    marginBottom: SCREEN_HEIGHT * 0.015, // Reduced spacing
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneIllustration: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: SCREEN_WIDTH * 0.063,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.black,
    textAlign: 'center',
    marginTop: SCREEN_HEIGHT * 0.04, // Increased space between phone image and title
    marginBottom: SCREEN_HEIGHT * 0.008, // Reduced spacing
    width: SCREEN_WIDTH * 0.92,
  },
  subtitle: {
    fontSize: SCREEN_WIDTH * 0.042,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: '#676464',
    textAlign: 'center',
    marginBottom: SCREEN_HEIGHT * 0.03, // Reduced spacing
    width: SCREEN_WIDTH * 0.85,
  },
  formArea: {
    width: SCREEN_WIDTH * 0.75,
    maxWidth: 302,
    alignItems: 'center',
    flexShrink: 1,
    alignSelf: 'center',
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
    justifyContent: 'space-between',
  },
  inputContainerWrapper: {
    width: '100%',
    alignItems: 'center',
    maxWidth: 302,
  },
  inputWrapper: {
    width: '100%',
  },
  inputContainer: {
    width: '100%',
    maxWidth: 302,
    height: 53,
    alignSelf: 'center',
  },
  maskInput: {
    flex: 1,
    backgroundColor: '#F9FAFC',
    borderWidth: 1,
    borderColor: 'rgba(110, 113, 124, 0.31)',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 15,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.regular,
    color: IVOO_COLORS.textPrimary,
  },
  hintText: {
    fontSize: 12,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.regular,
    color: '#828282',
    marginTop: 8,
    marginLeft: 0,
    textAlign: 'left',
    alignSelf: 'flex-start',
    width: '100%',
  },
  termsContainer: {
    flexDirection: 'row',
    marginTop: SCREEN_HEIGHT * 0.03, // Reduced spacing
    width: SCREEN_WIDTH * 0.75,
    flexShrink: 1, // Allow shrinking on small screens
  },
  checkbox: {
    marginRight: SCREEN_WIDTH * 0.024,
    marginTop: 2,
  },
  termsText: {
    flex: 1,
    fontSize: SCREEN_WIDTH * 0.032,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: '#828282',
  },
  termsLink: {
    textDecorationLine: 'underline',
    color: '#828282',
  },
  spacer: {
    minHeight: SCREEN_HEIGHT * 0.1,
    flexGrow: 1,
  },
  buttonContainer: {
    width: SCREEN_WIDTH * 0.75,
    maxWidth: 302,
    alignItems: 'center',
    paddingBottom: SCREEN_HEIGHT * 0.04,
    alignSelf: 'center',
  },
  continueButton: {
    shadowColor: 'transparent',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
});

export default RegisterScreen;
