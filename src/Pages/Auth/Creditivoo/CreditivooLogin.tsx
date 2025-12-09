import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
 
  StatusBar,
  Image,
  
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';

import {SCREENS} from '@shared-constants';
import {Button} from '@creditivo-components';
import {IVOO_COLORS, IVOO_SPACING, IVOO_TEXT_STYLES} from '@creditivo-style';


const LoginScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleContinue = () => {
    // Navigate to Home
    (navigation as any).navigate("Home");
  };

  const handleRegister = () => {
    (navigation as any).navigate("Register");
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
        {/* Welcome Text */}
        <Text style={styles.welcomeText}>Bienvenido a</Text>

        {/* Creditivoo Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('./images/creditivo-logo-full.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Ivitoo Illustration */}
        <View style={styles.illustrationContainer}>
          <Image
            source={require('./images/onboarding/ivitoo-register.png')}
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
  welcomeText: {
    fontSize: IVOO_TEXT_STYLES.welcomeText.fontSize,
    fontFamily: IVOO_TEXT_STYLES.welcomeText.fontFamily,
    fontWeight: IVOO_TEXT_STYLES.welcomeText.fontWeight,
    lineHeight: IVOO_TEXT_STYLES.welcomeText.lineHeight,
    color: IVOO_COLORS.primary,
    textAlign: 'center',
    marginTop: 197,
  },
  logoContainer: {
    width: IVOO_SPACING.logoWidth,
    height: IVOO_SPACING.logoHeight,
    marginTop: 10,
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
    marginTop: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  continueButton: {
    marginTop: 50,
  },
  registerLink: {
    marginTop: 25,
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

export default LoginScreen;