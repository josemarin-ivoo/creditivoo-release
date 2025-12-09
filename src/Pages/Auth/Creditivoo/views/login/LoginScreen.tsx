import React from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {SCREENS} from '@shared-constants';
import {Button} from '../../components';
import {IVOO_COLORS, IVOO_SPACING, IVOO_TEXT_STYLES} from '../../styles';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

const LoginScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleContinue = () => {
    navigation.reset({
      index: 0,
      routes: [{name: 'MainTabs'}],
    });
  };

  const handleRegister = () => {
    (navigation as any).navigate(SCREENS.REGISTER);
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
        <Text style={styles.welcomeText}>Bienvenido a</Text>

        <View style={styles.logoContainer}>
          <Image
            source={require('../../images/creditivo-logo-full.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Ivitoo Illustration */}
        <View style={styles.illustrationContainer}>
          <Image
            source={require('../../images/onboarding/ivitoo-register.png')}
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>

        {/* Continue Button */}
        <Button
          onPress={handleContinue}
          title="Continuar"
          style={styles.continueButton}
        />

        {/* Register Link */}
        <TouchableOpacity onPress={handleRegister} style={styles.registerLink}>
          <Text style={styles.registerText}>Registrarse</Text>
        </TouchableOpacity>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 10,
  },
  welcomeText: {
    fontSize: IVOO_TEXT_STYLES.welcomeText.fontSize,
    fontFamily: IVOO_TEXT_STYLES.welcomeText.fontFamily,
    fontWeight: IVOO_TEXT_STYLES.welcomeText.fontWeight,
    lineHeight: IVOO_TEXT_STYLES.welcomeText.lineHeight,
    color: IVOO_COLORS.primary,
    textAlign: 'center',
    marginTop: 0,
  },
  logoContainer: {
    width: IVOO_SPACING.logoWidth,
    height: IVOO_SPACING.logoHeight,
    marginTop: SCREEN_HEIGHT * 0.015,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  illustrationContainer: {
    width: IVOO_SPACING.illustrationWidth,
    height: IVOO_SPACING.illustrationHeight,
    marginTop: SCREEN_HEIGHT * 0.09,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  continueButton: {
    marginTop: SCREEN_HEIGHT * 0.025,
  },
  registerLink: {
    marginTop: SCREEN_HEIGHT * 0.015,
    paddingVertical: 8,
  },
  registerText: {
    fontSize: IVOO_TEXT_STYLES.linkText.fontSize,
    fontFamily: IVOO_TEXT_STYLES.linkText.fontFamily,
    fontWeight: IVOO_TEXT_STYLES.linkText.fontWeight,
    lineHeight: IVOO_TEXT_STYLES.linkText.lineHeight,
    color: IVOO_COLORS.primary,
    textAlign: 'center',
    includeFontPadding: false,
    marginTop: SCREEN_HEIGHT * 0.015,
  },
});

export default LoginScreen;
