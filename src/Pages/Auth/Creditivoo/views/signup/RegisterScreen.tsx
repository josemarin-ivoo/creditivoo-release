import React, {useState} from 'react';
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
import {useNavigation} from '@react-navigation/native';
import {Button, Input, Checkbox} from '../../components';
import RegisterLayout from '../../components/layouts/RegisterLayout';
import {IVOO_COLORS, IVOO_SPACING, IVOO_TYPOGRAPHY} from '../../styles';
import {SCREENS} from '@shared-constants';
import { Routes } from 'Utils/NavigationRoutes';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleContinue = () => {
    console.log('handleContinue called', {
      phoneNumber,
      acceptTerms,
      screen: Routes.NAVIGATION_OTP_VERIFICATION,
    });

    (navigation as any).navigate(Routes.NAVIGATION_OTP_VERIFICATION, {
      phoneNumber: phoneNumber.trim() || '',
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

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.formArea}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        <Input
          placeholder="+58 (___) ___ ____"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          containerStyle={styles.inputWrapper}
        />

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
      </KeyboardAvoidingView>
    </>
  );

  const bottomAction = (
    <Button
      onPress={handleContinue}
      title="Continuar"
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
    </>
  );
};

const styles = StyleSheet.create({
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
    width: SCREEN_WIDTH * 0.75, // Same width as terms container
    alignItems: 'center',
    flexShrink: 1, // Allow shrinking on small screens
  },
  inputWrapper: {
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
  continueButton: {},
});

export default RegisterScreen;
