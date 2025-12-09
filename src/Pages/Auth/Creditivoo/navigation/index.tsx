import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {useSelector, useDispatch} from 'react-redux';
import {MenuProvider} from 'react-native-popup-menu';
import {AppDispatch, RootState} from '../store/store';
import {loadAuth} from '../store/slices/auth-slice';

// Navigation
import {isReadyRef, navigationRef} from 'react-navigation-helpers';
import {SCREENS} from '@shared-constants';

// Components
import BackTopBar from '@components/BackTopBar';

// Screens
import PaymentMethodSelectScreen from '@screens/customer-account/home/payment-method-selection/PaymentMethodSelectScreen';
import PaymentMethodDetailScreen from '@screens/customer-account/home/payment-method-selection/PaymentMethodDetailScreen';
import MobilePaymentScreen from '@screens/customer-account/home/payment-method-selection/mobile-payment-screen/MobilePaymentScreen';
import PurchaseDetailScreen from '@screens/customer-account/home/purchase-detail/PurchaseDetailScreen';
import CarouselScreen from '@features/onboarding/screens/CarouselScreen';
import NotificationsScreen from '@screens/notifications/NotificationsScreen';
import ContractsScreen from '@screens/contracts/ContractsScreen';
import PersonalInformationScreen from '@screens/profile/PersonalInformationScreen';
import FaqScreen from '@screens/profile/FaqScreen';
import ContactSupportScreen from '@screens/profile/ContactSupportScreen';
import BranchDetailScreen from '@screens/branches/BranchDetailScreen';
import OnboardingScreen from '@features/onboarding/screens/OnboardingScreen';

import CreditivooLogin from '../CreditivooLogin';

import CreditivooRegisterScreen from '../CreditivooRegister';

import OTPVerificationScreen from '../views/signup/OTPVerificationScreen';
import EmailInputScreen from '../views/signup/EmailInputScreen';
import EmailOTPVerificationScreen from '../views/signup/EmailOTPVerificationScreen';
import PasswordScreen from '../views/signup/PasswordScreen';
import RegistrationSuccessScreen from '../views/signup/RegistrationSuccessScreen';
import HomeCreditIvoo from '../views/home/HomeCreditIvoo';
import SplashScreen from '@views/splash/SplashScreen';

const Stack = createStackNavigator();

const Navigation = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {isLoggedIn, isAutoLoginLoading} = useSelector(
    (state: RootState) => state.auth,
  );

  useEffect(() => {
    // Para limpiar el almacenamiento durante desarrollo/testing, descomenta la siguiente línea:
    // dispatch(clearAuthStorage());
    dispatch(loadAuth());
  }, [dispatch]);

  useEffect(() => {
    return () => {
      isReadyRef.current = false;
    };
  }, []);

  const renderRoutes = () => {
    if (!isLoggedIn) {
      // Unauthenticated routes
      return (
        <>
          <Stack.Screen
            name={SCREENS.SPLASH}
            component={SplashScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name={SCREENS.LOGIN}
            component={CreditivooLogin}
            options={{headerShown: false}} // Hide header
          />
          <Stack.Screen
            name={SCREENS.ONBOARDING}
            component={OnboardingScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name={SCREENS.REGISTER}
            component={CreditivooRegisterScreen}
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
          {/* Add HomeCreditIvoo directly to unauthenticated routes */}
          <Stack.Screen
            name={SCREENS.HOME}
            component={HomeCreditIvoo}
            options={{headerShown: false}}
          />
        </>
      );
    }

    // Authenticated customer routes
    return (
      <>
        <Stack.Screen
          name={SCREENS.SPLASH}
          component={SplashScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={SCREENS.HOME}
          component={HomeCreditIvoo}
          options={{headerShown: false}} // Hide header
        />
        <Stack.Screen
          name={SCREENS.PAYMENT_SELECTION}
          component={PaymentMethodSelectScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={SCREENS.PAYMENT_METHOD_DETAIL}
          component={PaymentMethodDetailScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={SCREENS.MOBILE_PAYMENT}
          component={MobilePaymentScreen}
          options={() => ({
            headerTitle: '',
            headerLeft: () => <BackTopBar />,
            headerStyle: {
              shadowColor: 'transparent',
              backgroundColor: 'transparent',
            },
          })}
        />
        <Stack.Screen
          name={SCREENS.PURCHASE_DETAIL}
          component={PurchaseDetailScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="OnboardingCarousel"
          component={CarouselScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={SCREENS.NOTIFICATIONS}
          component={NotificationsScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={SCREENS.CONTRACTS}
          component={ContractsScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={SCREENS.PERSONAL_INFORMATION}
          component={PersonalInformationScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={SCREENS.FAQ}
          component={FaqScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={SCREENS.CONTACT_SUPPORT}
          component={ContactSupportScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={SCREENS.BRANCH_DETAIL}
          component={BranchDetailScreen}
          options={{headerShown: false}}
        />
      </>
    );
  };

  if (isAutoLoginLoading) {
    return (
      <NavigationContainer
        ref={navigationRef}
        onReady={() => {
          isReadyRef.current = true;
        }}>
        <GestureHandlerRootView style={{flex: 1}}>
          <BottomSheetModalProvider>
            <MenuProvider>
              <Stack.Navigator
                id="splash-navigator"
              >
                <Stack.Screen
                  name={SCREENS.SPLASH}
                  component={SplashScreen}
                  options={{headerShown: false}}
                />
              </Stack.Navigator>
            </MenuProvider>
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        isReadyRef.current = true;
      }}>
      <GestureHandlerRootView style={{flex: 1}}>
        <BottomSheetModalProvider>
          <MenuProvider>
            <Stack.Navigator
              id="main-app-navigator"
              initialRouteName={
                !isLoggedIn && !isAutoLoginLoading
                  ? SCREENS.LOGIN
                  : SCREENS.SPLASH
              }>
              {renderRoutes()}
            </Stack.Navigator>
          </MenuProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </NavigationContainer>
  );
};

export default Navigation;
