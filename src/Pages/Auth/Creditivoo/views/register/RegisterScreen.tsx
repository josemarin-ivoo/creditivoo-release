import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Text,
  ScrollView,
  Image,
  Linking,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {Button, Input, Checkbox} from '@creditivo-components';
import {IVOO_COLORS, IVOO_SPACING, IVOO_TYPOGRAPHY} from '@creditivo-style';
import {SCREENS} from '@shared-constants';

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleContinue = () => {
    if (!phoneNumber.trim()) {
      // TODO: Show error message
      return;
    }
    if (!acceptTerms) {
      // TODO: Show error message
      return;
    }
    // Navigate to OTP verification screen
    (navigation as any).navigate(SCREENS.OTP_VERIFICATION, {
      phoneNumber: phoneNumber.trim(),
    });
  };

  const handleTermsPress = () => {
    // TODO: Open terms and conditions
    Linking.openURL('https://ivoo.app/terms');
  };

  const handlePrivacyPress = () => {
    // TODO: Open privacy policy
    Linking.openURL('https://ivoo.app/privacy');
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
        {/* Status Bar Content */}
        <View style={styles.statusBar}>
          <View style={styles.connections}>
            {/* Battery, WiFi, Cellular icons would go here */}
          </View>
        </View>

        {/* Creditivoo Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../images/creditivo-logo-full.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Phone Illustration */}
        <View style={styles.illustrationContainer}>
          <Image
            source={require('../../images/onboarding/mobile-register-phone.png')}
            style={styles.phoneIllustration}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>Ingresa tu número de celular</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Te enviaremos un SMS con un código de 6 dígitos para validar tu
          celular 😊
        </Text>

        {/* Phone Input */}
        <View style={styles.inputContainer}>
          <Input
            placeholder="+58 (___)"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            containerStyle={styles.inputWrapper}
          />
        </View>

        {/* Terms and Conditions Checkbox */}
        <View style={styles.termsContainer}>
          <Checkbox
            checked={acceptTerms}
            onToggle={() => setAcceptTerms(!acceptTerms)}
            style={styles.checkbox}
          />
          <View style={styles.termsTextContainer}>
            <Text style={styles.termsText}>
              Acepto los{' '}
              <Text style={styles.termsLink} onPress={handleTermsPress}>
                términos de uso
              </Text>{' '}
              y{' '}
              <Text style={styles.termsLink} onPress={handlePrivacyPress}>
                tratamiento de datos personales de IVOO APP.
              </Text>
            </Text>
          </View>
        </View>

        {/* Continue Button */}
        <Button
          onPress={handleContinue}
          title="Continuar"
          style={styles.continueButton}
        />

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
  statusBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: IVOO_SPACING.statusBarHeight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: IVOO_SPACING.statusBarPadding,
    paddingTop: IVOO_SPACING.statusBarTop,
  },
  connections: {
    width: IVOO_SPACING.connectionsWidth,
    height: IVOO_SPACING.connectionsHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
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
  illustrationContainer: {
    width: 120,
    height: 169,
    marginTop: 61,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneIllustration: {
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
    marginTop: 84,
    width: 336,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.regular,
    lineHeight: 21.657,
    letterSpacing: 0.0591,
    color: '#676464',
    textAlign: 'center',
    marginTop: 10,
    width: 296,
  },
  inputContainer: {
    marginTop: 28,
    alignItems: 'center',
  },
  inputWrapper: {
    marginTop: 0,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 28,
    width: 303,
    paddingHorizontal: 0,
  },
  checkbox: {
    marginRight: 9,
    marginTop: 2,
  },
  termsTextContainer: {
    flex: 1,
  },
  termsText: {
    fontSize: 12,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.regular,
    lineHeight: 18,
    color: '#828282',
  },
  termsLink: {
    textDecorationLine: 'underline',
    color: '#828282',
  },
  continueButton: {
    marginTop: 60,
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

export default RegisterScreen;
