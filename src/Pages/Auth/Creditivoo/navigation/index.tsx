import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {MenuProvider} from 'react-native-popup-menu';

// Navigation
import {isReadyRef, navigationRef} from 'react-navigation-helpers';
import {SCREENS} from '@shared-constants';
import {useIvoSelector, useIvoDispatch} from '../../../../redux/useIvo';

// Screens from ivoo
import LoginScreen from '../views/login/LoginScreen';
import RegisterScreen from '../views/signup/RegisterScreen';
import OTPVerificationScreen from '../views/signup/OTPVerificationScreen';
import EmailInputScreen from '../views/signup/EmailInputScreen';
import EmailOTPVerificationScreen from '../views/signup/EmailOTPVerificationScreen';
import PasswordScreen from '../views/signup/PasswordScreen';
import RegistrationSuccessScreen from '../views/signup/RegistrationSuccessScreen';
import IdentityVerificator from '../views/kyc/IdentityVerificator';
import IdFrontRequest from '../views/kyc/IdFrontRequest';
import IdBackRequest from '../views/kyc/IdBackRequest';
import SelfieRequest from '../views/kyc/SelfieRequest';
import TermScreen from '../views/credit-prepare/TermScreen';
import PersonalInfoFormScreen from '../views/credit-prepare/PersonalInfoFormScreen';
import ReferralCodeForm from '../views/credit-prepare/ReferralCodeForm';
import CreditValidationScreen from '../views/credit-prepare/CreditValidationScreen';
import CreditConfirmationScreen from '../views/credit-prepare/CreditConfirmationScreen';
import SplashScreen from '../views/splash/SplashScreen';
import HelpScreen from '../views/help/HelpScreen';
import SettingScreen from '../views/settings/SettingScreen';
import SecurityScreen from '../views/settings/SecurityScreen';
import ChangePasswordScreen from '../views/settings/ChangePasswordScreen';
import NotificationScreen from '../views/notifications/NotificationScreen';
import MyPurchasesScreen from '../views/purchases/MyPurchasesScreen';
import PaymentInstallmentsScreen from '../views/purchases/PaymentInstallmentsScreen';
import GemsScreen from '../views/gem/GemsScreen';
import HowToEarnGemsScreen from '../views/gem/HowToEarnGemsScreen';

// Tabs
import MainTabs from './TabsNavigation';

const Stack = createStackNavigator();

// List of protected route names that require authentication
const PROTECTED_ROUTES = [
  'MainTabs',
  'IdentityVerificator',
  'IdFrontRequest',
  'IdBackRequest',
  'SelfieRequest',
  'Terms',
  'PersonalInfoForm',
  'ReferralCodeForm',
  'CreditValidation',
  'CreditConfirmation',
  SCREENS.HELP,
  SCREENS.SETTINGS,
  SCREENS.SECURITY,
  SCREENS.NOTIFICATIONS,
  'MyPurchases',
  'PaymentInstallments',
  'Gems',
  'HowToEarnGems',
];

// List of routes that should never trigger automatic redirects
// These routes handle their own navigation logic
const NO_AUTO_REDIRECT_ROUTES = [
  'RegistrationSuccess',
  SCREENS.LOGIN,
  SCREENS.REGISTER,
];

const Navigation = () => {
  const {isLoggedIn, isAutoLoginLoading} = useIvoSelector(state => state.auth);

  useEffect(() => {
    return () => {
      isReadyRef.current = false;
    };
  }, []);

  // Handler to protect routes by intercepting navigation state changes
  const handleNavigationStateChange = () => {
    // Wait for auth check to complete before protecting routes
    if (isAutoLoginLoading) {
      return;
    }

    if (!navigationRef.isReady()) {
      return;
    }

    const currentRoute = navigationRef.getCurrentRoute();
    if (!currentRoute) {
      return;
    }

    const routeName = currentRoute.name;
    const isProtectedRoute = PROTECTED_ROUTES.includes(routeName);
    const isNoAutoRedirectRoute = NO_AUTO_REDIRECT_ROUTES.includes(routeName);

    // Don't perform any automatic redirects if we're on a route that handles its own navigation
    if (isNoAutoRedirectRoute) {
      return;
    }

    // If trying to access a protected route without being logged in, redirect to login immediately
    if (isProtectedRoute && !isLoggedIn) {
      console.warn(
        `[Navigation] Bloqueando acceso a ruta protegida "${routeName}". Usuario no autenticado.`,
      );
      // Use requestAnimationFrame to ensure this runs after the navigation attempt
      requestAnimationFrame(() => {
        if (navigationRef.isReady()) {
          navigationRef.reset({
            index: 0,
            routes: [{name: SCREENS.LOGIN as never}],
          });
        }
      });
    }
  };

  const renderRoutes = () => {
    return (
      <>
        {/* Public Routes */}
        <Stack.Screen
          name={SCREENS.SPLASH}
          component={SplashScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={SCREENS.LOGIN}
          component={LoginScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={SCREENS.REGISTER}
          component={RegisterScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={SCREENS.OTP_VERIFICATION}
          component={OTPVerificationScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="EmailInput"
          component={EmailInputScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="EmailOTPVerification"
          component={EmailOTPVerificationScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Password"
          component={PasswordScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="RegistrationSuccess"
          component={RegistrationSuccessScreen}
          options={{headerShown: false}}
        />

        {/* Protected Routes */}
        {/* KYC Routes */}
        <Stack.Screen
          name="IdentityVerificator"
          component={IdentityVerificator}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="IdFrontRequest"
          component={IdFrontRequest}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="IdBackRequest"
          component={IdBackRequest}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="SelfieRequest"
          component={SelfieRequest}
          options={{headerShown: false}}
        />
        {/* Credit Prepare Routes */}
        <Stack.Screen
          name="Terms"
          component={TermScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="PersonalInfoForm"
          component={PersonalInfoFormScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="ReferralCodeForm"
          component={ReferralCodeForm}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="CreditValidation"
          component={CreditValidationScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="CreditConfirmation"
          component={CreditConfirmationScreen}
          options={{headerShown: false}}
        />
        {/* ⭐ TAB NAVIGATOR ⭐ - Main App */}
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{headerShown: false}}
        />
        {/* Settings and Profile Routes */}
        <Stack.Screen
          name={SCREENS.HELP}
          component={HelpScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={SCREENS.SETTINGS}
          component={SettingScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={SCREENS.SECURITY}
          component={SecurityScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="ChangePassword"
          component={ChangePasswordScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={SCREENS.NOTIFICATIONS}
          component={NotificationScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="MyPurchases"
          component={MyPurchasesScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="PaymentInstallments"
          component={PaymentInstallmentsScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Gems"
          component={GemsScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="HowToEarnGems"
          component={HowToEarnGemsScreen}
          options={{headerShown: false}}
        />
      </>
    );
  };

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        isReadyRef.current = true;
      }}
      onStateChange={handleNavigationStateChange}>
      <GestureHandlerRootView style={{flex: 1}}>
        <BottomSheetModalProvider>
          <MenuProvider>
            <Stack.Navigator initialRouteName={SCREENS.SPLASH}>
              {renderRoutes()}
            </Stack.Navigator>
          </MenuProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </NavigationContainer>
  );
};

export default Navigation;
