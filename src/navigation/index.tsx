import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {MenuProvider} from 'react-native-popup-menu';

// Navigation
import {isReadyRef, navigationRef} from 'react-navigation-helpers';
import {SCREENS} from '@shared-constants';
import {useIvoSelector} from '../ivoo/store/hooks';
import {ivooStore} from '../ivoo/store';

// Screens from ivoo
import LoginScreen from '../ivoo/screens/login/LoginScreen';
import RegisterScreen from '../ivoo/screens/signup/RegisterScreen';
import OTPVerificationScreen from '../ivoo/screens/signup/OTPVerificationScreen';
import EmailInputScreen from '../ivoo/screens/signup/EmailInputScreen';
import EmailOTPVerificationScreen from '../ivoo/screens/signup/EmailOTPVerificationScreen';
import PasswordScreen from '../ivoo/screens/signup/PasswordScreen';
import RegistrationSuccessScreen from '../ivoo/screens/signup/RegistrationSuccessScreen';
import ForgotPasswordScreen from '../ivoo/screens/signup/ForgotPasswordScreen';
import ForgotPasswordOTPScreen from '../ivoo/screens/signup/ForgotPasswordOTPScreen';
import ResetPasswordScreen from '../ivoo/screens/signup/ResetPasswordScreen';
import IdentityVerificator from '../ivoo/screens/kyc/IdentityVerificator';
import IdFrontRequest from '../ivoo/screens/kyc/IdFrontRequest';
import IdBackRequest from '../ivoo/screens/kyc/IdBackRequest';
import SelfieRequest from '../ivoo/screens/kyc/SelfieRequest';
import TermScreen from '../ivoo/screens/credit-prepare/TermScreen';
import PersonalInfoFormScreen from '../ivoo/screens/credit-prepare/PersonalInfoFormScreen';
import ReferralCodeForm from '../ivoo/screens/credit-prepare/ReferralCodeForm';
import CreditValidationScreen from '../ivoo/screens/credit-prepare/CreditValidationScreen';
import CreditConfirmationScreen from '../ivoo/screens/credit-prepare/CreditConfirmationScreen';
import SplashScreen from '@ivoo/screens/splash/SplashScreen';
import HelpScreen from '../ivoo/screens/help/HelpScreen';
import SettingScreen from '../ivoo/screens/settings/SettingScreen';
import SecurityScreen from '../ivoo/screens/settings/SecurityScreen';
import ChangePasswordScreen from '../ivoo/screens/settings/ChangePasswordScreen';
import NotificationScreen from '../ivoo/screens/notifications/NotificationScreen';
import MyPurchasesScreen from '../ivoo/screens/purchases/MyPurchasesScreen';
import PaymentInstallmentsScreen from '../ivoo/screens/purchases/PaymentInstallmentsScreen';
import MovementsScreen from '../ivoo/screens/movements/MovementsScreen';
import GemsScreen from '../ivoo/screens/gem/GemsScreen';
import HowToEarnGemsScreen from '../ivoo/screens/gem/HowToEarnGemsScreen';
import PlanGroupSelection from '../ivoo/screens/plan/PlanGroupSelection';
import PlanSelection from '../ivoo/screens/plan/PlanSelection';
import PurchaseConfirmationScreen from '../ivoo/screens/plan/PurchaseConfirmationScreen';
import PurchaseSuccessScreen from '../ivoo/screens/plan/PurchaseSuccessScreen';
import SubscriptionSuccessScreen from '../ivoo/screens/plan/SubscriptionSuccessScreen';

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
  'Movements',
  'Gems',
  'HowToEarnGems',
  'PlanGroupSelection',
  'PlanSelection',
  'PurchaseConfirmation',
];

// List of routes that should never trigger automatic redirects
// These routes handle their own navigation logic
const NO_AUTO_REDIRECT_ROUTES = [
  'RegistrationSuccess',
  'PurchaseSuccess',
  'SubscriptionSuccess',
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

  // Handle logout redirect - redirect to login when user becomes logged out
  useEffect(() => {
    console.log(
      '[Navigation] Auth state changed - isLoggedIn:',
      isLoggedIn,
      'isAutoLoginLoading:',
      isAutoLoginLoading,
    );

    if (isAutoLoginLoading) {
      return;
    }

    if (!isLoggedIn && navigationRef.isReady()) {
      const currentRoute = navigationRef.getCurrentRoute();
      if (currentRoute) {
        const routeName = currentRoute.name;
        const isNoAutoRedirectRoute =
          NO_AUTO_REDIRECT_ROUTES.includes(routeName);

        // Don't redirect if already on a route that handles its own navigation
        // SPLASH also handles its own navigation, so exclude it
        if (!isNoAutoRedirectRoute && routeName !== SCREENS.SPLASH) {
          console.warn(
            '[Navigation] Usuario no autenticado, redirigiendo a login desde:',
            routeName,
          );
          // Use setTimeout to ensure this runs after state updates
          const timeoutId = setTimeout(() => {
            if (navigationRef.isReady()) {
              // Verificar el estado actual desde el store directamente
              const currentState = ivooStore.getState();
              const stillLoggedOut = !currentState?.auth?.isLoggedIn;
              console.log(
                '[Navigation] Estado del store - isLoggedIn:',
                currentState?.auth?.isLoggedIn,
              );
              if (stillLoggedOut) {
                console.log('[Navigation] Ejecutando redirección a login');
                navigationRef.reset({
                  index: 0,
                  routes: [{name: SCREENS.LOGIN as never}],
                });
              }
            }
          }, 100);
          return () => clearTimeout(timeoutId);
        }
      }
    }
  }, [isLoggedIn, isAutoLoginLoading]);

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
        <Stack.Screen
          name={SCREENS.FORGOT_PASSWORD}
          component={ForgotPasswordScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="ForgotPasswordOTP"
          component={ForgotPasswordOTPScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="ResetPassword"
          component={ResetPasswordScreen}
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
          name="Movements"
          component={MovementsScreen}
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
        <Stack.Screen
          name="PlanGroupSelection"
          component={PlanGroupSelection}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="PlanSelection"
          component={PlanSelection}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="PurchaseConfirmation"
          component={PurchaseConfirmationScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="PurchaseSuccess"
          component={PurchaseSuccessScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="SubscriptionSuccess"
          component={SubscriptionSuccessScreen}
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
