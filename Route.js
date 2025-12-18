/* eslint-disable no-return-assign */
/* eslint-disable react-native/no-inline-styles */ /* eslint-disable no-unused-vars */ /* eslint-disable prettier/prettier */
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {useSelector} from 'react-redux';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Host} from 'react-native-portalize';
import {setNavigator} from './src/Utils/NavigationRef';
//import analytics from '@react-native-firebase/analytics';
import { getAnalytics, logEvent } from '@react-native-firebase/analytics';
import { getApp } from '@react-native-firebase/app';

const Stack = createStackNavigator();
const AuthStack = createStackNavigator();
const AppStack = createStackNavigator();
const RootStack = createStackNavigator();
const Tab = createBottomTabNavigator();

import Home from './src/Pages/Auth/Home';
import SplashScreen from './src/Pages/unAuth/SplashScreen';
import {Email} from './src/Pages/unAuth/Email';
import {Password} from './src/Pages/unAuth/Password';
import {ForgotPassword} from './src/Pages/unAuth/ForgotPassword';
import {CreateAccount} from './src/Pages/unAuth/CreateAccount';
import {Verification} from './src/Pages/unAuth/Verification';
import {AccountSuccess} from './src/Pages/unAuth/AccountSuccess';
// import { MobileVerification } from './src/Pages/unAuth/MobileVerification';
import {AccountSingup} from './src/Pages/unAuth/AccountSingup';
import {Image, View} from 'react-native';
import {NewPassword} from './src/Pages/unAuth/NewPassword';
import {ChangeMobile} from './src/Pages/unAuth/ChangeMobile';
import ProductList from './src/Pages/Auth/Product/ProductList';

import CreditivooLogin from './src/Pages/Auth/Creditivoo/CreditivooLogin';

import CreditivooRegister from './src/Pages/Auth/Creditivoo/CreditivooRegister';
import OTPVerificationScreen from './src/Pages/Auth/Creditivoo/views/signup/OTPVerificationScreen';
import EmailInputScreen from './src/Pages/Auth/Creditivoo/views/signup/EmailInputScreen';
import EmailOTPVerificationScreen from './src/Pages/Auth/Creditivoo/views/signup/EmailOTPVerificationScreen';
import PasswordScreen from './src/Pages/Auth/Creditivoo/views/signup/PasswordScreen';
import RegistrationSuccessScreen from './src/Pages/Auth/Creditivoo/views/signup/RegistrationSuccessScreen';
import HomeCreditIvoo from './src/Pages/Auth/Creditivoo/views/home/HomeCreditIvoo';
import IdentityVerificator from './src/Pages/Auth/Creditivoo/views/kyc/IdentityVerificator';
import IdFrontRequest from './src/Pages/Auth/Creditivoo/views/kyc/IdFrontRequest';
import IdBackRequest from './src/Pages/Auth/Creditivoo/views/kyc/IdBackRequest';
import SelfieRequest from './src/Pages/Auth/Creditivoo/views/kyc/SelfieRequest';
import TermScreen from './src/Pages/Auth/Creditivoo/views/credit-prepare/TermScreen';
import PersonalInfoFormScreen from './src/Pages/Auth/Creditivoo/views/credit-prepare/PersonalInfoFormScreen';
import ReferralCodeForm from './src/Pages/Auth/Creditivoo/views/credit-prepare/ReferralCodeForm';
import CreditValidationScreen from './src/Pages/Auth/Creditivoo/views/credit-prepare/CreditValidationScreen';
import CreditConfirmationScreen from './src/Pages/Auth/Creditivoo/views/credit-prepare/CreditConfirmationScreen';
import HelpScreen from './src/Pages/Auth/Creditivoo/views/help/HelpScreen';
import SettingScreen from './src/Pages/Auth/Creditivoo/views/settings/SettingScreen';
import SecurityScreen from './src/Pages/Auth/Creditivoo/views/settings/SecurityScreen';
import NotificationScreen from './src/Pages/Auth/Creditivoo/views/notifications/NotificationScreen';
import PurchasesScreen from './src/Pages/Auth/Creditivoo/views/purchases/MyPurchasesScreen';
import GemsScreen from './src/Pages/Auth/Creditivoo/views/gem/GemsScreen';
import MainTabsCreditivoo from './src/Pages/Auth/Creditivoo/navigation/TabsNavigation';
import ProfileScreen from './src/Pages/Auth/Creditivoo/views/profile/ProfileScreen';
import PlanGroupSelection from './src/Pages/Auth/Creditivoo/views/plan/PlanGroupSelection';
import PlanSelection from './src/Pages/Auth/Creditivoo/views/plan/PlanSelection';
import PurchasesConfirm from './src/Pages/Auth/Creditivoo/views/plan/PurchaseConfirmationScreen';

// import CreditivooLogin from './src/Pages/Auth/Creditivoo/CreditivooLogin'; // revisar a donde va a abrir 

import CardDetails from './src/Pages/Auth/cardDetails';
import ProductDetails from './src/Pages/Auth/Product/ProductDetails';
import {CategoryList} from './src/Pages/Auth/Product/Category/CategoryList';
import {CategoryDetail} from './src/Pages/Auth/Product/Category/CategoryDetail';
//import  CartProductList  from './src/Pages/Auth/Cart/toDel_CartProductList.tsx.txt';
import WishtList from './src/Pages/Auth/Wishlist/WishtList';
import UserProfile from './src/Pages/Auth/UserProfile/Profile';
import Cart from './src/Pages/Auth/Cart/Cart';
import {Splash} from './src/Pages/Splash';
import GuestLogin from './src/Pages/Auth/GuestLogin';
import AddressList from './src/Pages/Auth/UserProfile/AddressList';
import ContactForm from './src/Pages/Auth/UserProfile/ContactForm';
import NewAddress from './src/Pages/Auth/UserProfile/NewAddress';
import ChangePasswordForm from './src/Pages/Auth/UserProfile/ChangePasswordForm';
import OrderHistory from './src/Pages/Auth/UserProfile/Order/OrderHistory';
import OrderHistoryDetail from './src/Pages/Auth/UserProfile/Order/OrderHistoryDetail';
import EditAddress from './src/Pages/Auth/UserProfile/EditAddress';
import ColorResource from './src/Utils/Colors';
import imageResource from './src/Utils/Image';
import {Routes} from './src/Utils/NavigationRoutes';
import Checkout from './src/Pages/Auth/Cart/Checkout';
import SelectDelivery from './src/Pages/Auth/Cart/SelectDelivery';
//import WayOfTransport from './src/Pages/Auth/Cart/toDel_WayOfTransport.tsx.txt';
import PickUpPointSelection from './src/Pages/Auth/Cart/PickUpPointSelection';
import OrderAccepted from './src/Pages/Auth/Cart/OrderAccepted';
import OrderedProduct from './src/Pages/Auth/UserProfile/Order/OrderedProduct';

import {CartIcon} from './src/Components/Icon/CartIcon';
import {Intro} from './src/Pages/Intro/Intro';

import DateandTimeSelection from './src/Pages/Auth/Cart/DateandTimeSelection';
import PaymentSelection from './src/Pages/Auth/Cart/Payment/PaymentSelection';
import AddPaymentMethod from './src/Pages/Auth/Cart/Payment/AddPaymentMethod';
import AddressMapSelection from './src/Pages/Auth/UserProfile/AddressMapSelection';
import OrderCancel from './src/Pages/Auth/UserProfile/Order/OrderCancel';
import Helper from './src/Utils/Helper';
import NewPaySlips from './src/Pages/Auth/Cart/Payment/NewPaySlips';
import {AppContext} from './src/Pages/AppContext';
import {useContext} from 'react';
import Notificationlist from './src/Pages/Auth/UserProfile/Notificationlist';
import {HomeIcon} from './src/Components/Icon/HomeIcon';
import {ProfileIcon} from './src/Components/Icon/ProfileIcon';
import {getFocusedRouteNameFromRoute} from '@react-navigation/native';
import TestPage from './src/Pages/Auth/TestPage';
import UpdateUserprofile from './src/Pages/Auth/UserProfile/UpdateUserprofile';
import Colors from './src/Utils/Colors';
import EditAlternetAddress from './src/Pages/Auth/UserProfile/Order/EditAlternetAddress';
import chatScreen from "./src/Pages/Auth/UserProfile/ChatScreen";

const Route = () => {
  const routeNameRef = React.useRef();
  const navigationRef = React.useRef();

  // const linking = {
  //   prefixes: ['https://ivoo.com', 'ivoo://'],
  //   //prefixes: ["ivoo://"],
  //   config: {
  //     ProductDetails: 'ProductDetails/:id',
  //     parse: {
  //       id: id => `${id}`,
  //     },
  //   },
  // };

  const getTabBarVisibility = route => {
    const routeName = getFocusedRouteNameFromRoute(route) ?? '';
    if (routeName === Routes.NAVIGATION_TO_CHECKOUT) {
      return false;
    }

    return true;
  };

  function HomeTabs() {
    const {appTheme} = useContext(AppContext);

    const tabBarStyle = {
      backgroundColor: appTheme.background,
      borderTopWidth: 0,
    };
    return (
      <Host>
        <Tab.Navigator
          tabBarOptions={{
            style: {
              backgroundColor:
                appTheme.type == 'green' ? appTheme.text : appTheme.background,
            },
          }}
          options={{
            headerShown: false,
            navigationOptions: {
              headerVisible: false,
            },
          }}
          screenOptions={{
            headerShown: false,
            tabBarStyle: tabBarStyle,
            keyboardHidesTabBar: true,
          }}>
          {/**"HomeStack" */}
          <Tab.Screen
            name={Routes.HOMESTACK}
            component={HomeStack}
            options={{
              tabBarLabel: () => {
                return null;
              },
              tabBarIcon: ({size, focused}) => (
                <View>
                  <HomeIcon theme={appTheme} size={size} focused={focused} />
                </View>
              ),
            }}
            listeners={() => ({
              tabPress: () => {
                Helper.HandleVibration();
              },
            })}
          />
          {/**"Search" */}
          <Tab.Screen
            name={Routes.SEARCHSTACK}
            component={SearchStack}
            options={{
              tabBarLabel: () => {
                return null;
              },
              tabBarIcon: ({size, focused}) =>
                focused ? (
                  <Image
                    source={
                      appTheme.type == 'green'
                        ? imageResource.ic_search_white
                        : imageResource.ic_search_green
                    }
                    size={size}
                    resizeMode="stretch"
                  />
                ) : (
                  <Image
                    source={
                      appTheme.type == 'light'
                        ? imageResource.ic_search
                        : appTheme.type == 'dark'
                        ? imageResource.ic_search_dark
                        : imageResource.ic_search_green
                    }
                    size={size}
                    resizeMode="stretch"
                  />
                ),
            }}
            listeners={() => ({
              tabPress: () => {
                Helper.HandleVibration();
              },
            })}
          />
          {/**"CartStack" */}
          <Tab.Screen
            name={Routes.CARTSTACK}
            component={CartStack}
            options={({route}) => ({
              tabBarVisible: getTabBarVisibility(route),
              tabBarLabel: () => {
                return null;
              },
              tabBarIcon: ({size, focused}) => (
                <View>
                  <CartIcon theme={appTheme} size={size} focused={focused} />
                </View>
              ),
            })}
            listeners={() => ({
              tabPress: () => {
                Helper.HandleVibration();
              },
            })}
          />

          {/* By JAMP 01/12/2025 */}

            <Tab.Screen
            name={Routes.CREDITIVOOSTACK}
            component={CreditivooStack} 
            options={({route}) => ({
              tabBarVisible: getTabBarVisibility(route),
              
              tabBarLabel: () => {
                return null;
              },
              tabBarIcon: ({size, focused}) => (focused ? (
                  <Image
                    source={
                      appTheme.type == 'green'
                        ? imageResource.ic_creditivo
                        : imageResource.ic_creditivo_green
                    }
                    size={size}
                    resizeMode="stretch"
                  />
                ) : (
                  <Image
                    source={
                      appTheme.type == 'light'
                        ? imageResource.ic_search
                        : appTheme.type == 'dark'
                        ? imageResource.ic_creditivodark
                        : imageResource.ic_creditivo
                    }
                    size={size}
                    resizeMode="stretch"
                  />
                )
              ),
               
              
            })}
            listeners={() => ({
              tabPress: () => {
                Helper.HandleVibration();
              },
            })}
          />
        
        {/* end BY JAMP */}

          {/**"WishlistStack"*/}
          <Tab.Screen
            name={Routes.WISHLISTSTACK}
            component={WishlistStack}
            options={{
              tabBarLabel: () => {
                return null;
              },
              tabBarIcon: ({size, focused}) =>
                focused ? (
                  <Image
                    source={
                      appTheme.type == 'green'
                        ? imageResource.ic_wishlist_white
                        : imageResource.ic_wishlist_green
                    }
                    size={size}
                    resizeMode="stretch"
                  />
                ) : (
                  <Image
                    source={
                      appTheme.type == 'light'
                        ? imageResource.ic_wishlist_t
                        : appTheme.type == 'dark'
                        ? imageResource.ic_wishlist_dark
                        : imageResource.ic_wishlist_green
                    }
                    size={size}
                    resizeMode="stretch"
                  />
                ),
            }}
            listeners={() => ({
              tabPress: () => {
                Helper.HandleVibration();
              },
            })}
          />
          {/**"ProfileStack"*/}
          <Tab.Screen
            name={Routes.PROFILESTACK}
            component={ProfileStack}
            options={{
              tabBarLabel: () => {
                return null;
              },
              tabBarIcon: ({size, focused}) => (
                <View>
                  <ProfileIcon theme={appTheme} size={size} focused={focused} />
                </View>
              ),
            }}
            listeners={() => ({
              tabPress: () => {
                Helper.HandleVibration();
              },
            })}
          />
        </Tab.Navigator>
      </Host>
    );
  }


  const HomeStack = () => {
    return (
      <Stack.Navigator
        headerShown={false}
        initialRouteName={Routes.HOMESCREEN} //"TestPage" //
        screenOptions={{
          headerStyle: {backgroundColor: ColorResource.Screamin_Green},
          headerTintColor: ColorResource.white,
          headerTitleStyle: {fontWeight: 'bold'},
          headerShown: false,
        }}>
        <Stack.Screen
          name={'TestPage'}
          component={TestPage}
          options={{headerShown: false}}
        />
        {/**"Home"  */}
        <Stack.Screen
          name={Routes.HOMESCREEN}
          component={Home}
          options={{headerShown: false}}
        />
        {/**"Home"  */}
        <Stack.Screen
          name={Routes.NAVIGATION_TO_PRODUCTLIST}
          component={ProductList}
          options={{headerShown: false}}
        />
        {/**"ProductList" */}
        <Stack.Screen
          name={Routes.NAVIGATION_TO_CARDDETAILS}
          component={CardDetails}
          options={{headerShown: false}}
        />
        {/**"cardDetail" */}
        <Stack.Screen
          name={Routes.NAVIGATION_TO_PRODUCTDETAILS}
          component={ProductDetails}
          options={{headerShown: false}}
          path="ProductDetails/:url_key"
        />
        {/**"ProductDetails"  */}
        <Stack.Screen
          name={Routes.CATEGORYLIST}
          component={CategoryList}
          options={{headerShown: false}}
        />
        {/**"CategoryList" */}
        <Stack.Screen
          name={Routes.NAVIGATION_TO_CATEGORYDETAIL}
          component={CategoryDetail}
          options={{headerShown: false}}
        />
        {/**"CategoryDetail"*/}
        <Stack.Screen
          name={Routes.NAVIGATION_TO_ORDERHISTORY}
          component={OrderHistory}
          options={{headerShown: false}}
        />
        {/**"OrderHistory" */}
        <Stack.Screen
          name={Routes.NAVIGATION_TO_ORDERHISTORYDETAIL}
          component={OrderHistoryDetail}
          options={{headerShown: false}}
        />
        {/**"OrderHistoryDetail" */}
        <Stack.Screen
          name={Routes.NAVIGATION_TO_ORDERCANCEL}
          component={OrderCancel}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={Routes.NAVIGATION_TO_CHECKOUT}
          component={Checkout}
          options={{headerShown: false}}
        />
        {/**"Checkout"*/}
        <Stack.Screen
          name={Routes.NAVIGATION_TO_ORDERACCEPTED}
          component={OrderAccepted}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={Routes.NAVIGATION_TO_NOTIFICATIONLIST}
          component={Notificationlist}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    );
  };


  const SearchStack = () => {
    return (
      <Stack.Navigator
        initialRouteName={Routes.CATEGORYLIST} //"CategoryList"
        screenOptions={{
          headerStyle: {backgroundColor: ColorResource.Screamin_Green},
          headerTintColor: ColorResource.white,
          headerTitleStyle: {fontWeight: 'bold'},
        }}>
        <Stack.Screen
          name={Routes.NAVIGATION_TO_PRODUCTLIST}
          component={ProductList}
          options={{headerShown: false}}
        />
        {/**"ProductList"*/}
        <Stack.Screen
          name={Routes.NAVIGATION_TO_PRODUCTDETAILS}
          component={ProductDetails}
          options={{headerShown: false}}
        />
        {/**"ProductDetails"*/}
        <Stack.Screen
          name={Routes.CATEGORYLIST}
          component={CategoryList}
          options={{headerShown: false}}
        />
        {/**"CategoryList" */}
        <Stack.Screen
          name={Routes.NAVIGATION_TO_CATEGORYDETAIL}
          component={CategoryDetail}
          options={{headerShown: false}}
        />
        {/**"CategoryDetail"*/}
        <Stack.Screen
          name={Routes.NAVIGATION_TO_CHECKOUT}
          component={Checkout}
          options={{headerShown: false}}
        />
        {/**"Checkout"*/}
        <Stack.Screen
          name={Routes.NAVIGATION_TO_ORDERACCEPTED}
          component={OrderAccepted}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    );
  };



  const CreditivooStack = () => {

    // const token = useSelector(state => state.commonReducer.token);
    return (

      <Stack.Navigator
        initialRouteName={ Routes.NAVIGATION_CREDITIVOO }
      
        screenOptions={{
          headerStyle: {backgroundColor: ColorResource.Screamin_Green},
          headerTintColor: ColorResource.white,
          headerTitleStyle: {fontWeight: 'bold'},
        }}>
        <Stack.Screen
         name={Routes.NAVIGATION_CREDITIVOO}
         component={CreditivooLogin}
         options={{headerShown: false}}
       />
       <Stack.Screen
          name={Routes.NAVIGATION_REGISTER}
          component={CreditivooRegister}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={Routes.NAVIGATION_OTP_VERIFICATION}
          component={OTPVerificationScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={Routes.NAVIGATION_EMAIL_INPUT}
          component={EmailInputScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={Routes.NAVIGATION_EMAIL_OTP_VERIFICATION}
          component={EmailOTPVerificationScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={Routes.NAVIGATION_PASSWORD}
          component={PasswordScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={Routes.NAVIGATION_REGISTRATION_SUCCESS}
          component={RegistrationSuccessScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={Routes.NAVIGATION_IDVERIFICATION}
          component={IdentityVerificator}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Home"
          component={HomeCreditIvoo}
          options={{headerShown: false}}
        />
        <Stack.Screen
          
          name={Routes.NAVIGATION_TABCREDITIVOO}
          component={MainTabsCreditivoo}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={Routes.NAVIGATION_IDFRONTREQUEST}
          component={IdFrontRequest}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={Routes.NAVIGATION_IDBACKREQUEST}
          component={IdBackRequest}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={Routes.NAVIGATION_SELFIEREQUEST}
          component={SelfieRequest}
          options={{headerShown: false}}
        />

        <Stack.Screen
          name={Routes.NAVIGATION_TERMS}
          component={TermScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={Routes.NAVIGATION_PERSONALINFO}
          component={PersonalInfoFormScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={Routes.NAVIGATION_REFERRALCODE}
          component={ReferralCodeForm}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={Routes.NAVIGATION_CREDITVALIDATION}
          component={CreditValidationScreen}
          options={{headerShown: false}}
        />

        <Stack.Screen
          name={Routes.NAVIGATION_CREDITCONFIRMATION}
          component={CreditConfirmationScreen}
          options={{headerShown: false}}
        />

        <Stack.Screen
          name={Routes.NAVIGATION_PROFILE}
          component={ProfileScreen}
          options={{headerShown: false}}
        />


        <Stack.Screen
          name={Routes.NAVIGATION_HELP}
          component={HelpScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={Routes.NAVIGATION_SETTINGS}
          component={SettingScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={Routes.NAVIGATION_SECURITY}
          component={SecurityScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={Routes.NAVIGATION_NOTIFICATIONS}
          component={NotificationScreen}
          options={{headerShown: false}}
        />

        <Stack.Screen
          name={Routes.NAVIGATION_MYPURCHASES}
          component={PurchasesScreen}
          options={{headerShown: false}}
        />

        <Stack.Screen
          name={Routes.NAVIGATION_GEMS}
          component={GemsScreen}
          options={{headerShown: false}}
        />

        <Stack.Screen
          name={Routes.NAVIGATION_PLANGROUPSELECTION}
          component={PlanGroupSelection}
          options={{headerShown: false}}
        />

        <Stack.Screen
          name={Routes.NAVIGATION_PLANSELECTION}
          component={PlanSelection}
          options={{headerShown: false}}
        />

        <Stack.Screen
          name={Routes.NAVIGATION_PURCHASESCONFIRM}
          component={PurchasesConfirm}
          options={{headerShown: false}}
        />


        {/* ¡CORRECCIÓN CLAVE: AÑADIR GUESTLOGIN! */}
        <Stack.Screen
        name={Routes.GUESTLOGIN}
        component={GuestLogin}
        options={{headerShown: false}}
        />
      
      </Stack.Navigator>
    );


  }

  const CartStack = () => {
    const token = useSelector(state => state.commonReducer.token);
    return (
      <Stack.Navigator
        initialRouteName={token ? Routes.NAVIGATION_TO_CART : Routes.GUESTLOGIN} //'Cart' : 'GuestLogin'}
        screenOptions={{
          headerStyle: {backgroundColor: ColorResource.Screamin_Green},
          headerTintColor: ColorResource.white,
          headerTitleStyle: {fontWeight: 'bold'},
        }}>
        <Stack.Screen
          name={Routes.NAVIGATION_TO_CART}
          component={Cart}
          options={{headerShown: false}}
        />
        {/**"Cart" */}
        <Stack.Screen
          name={Routes.GUESTLOGIN}
          component={GuestLogin}
          options={{headerShown: false}}
        />
        {/**"GuestLogin" */}
        <Stack.Screen
          name={Routes.NAVIGATION_TO_CHECKOUT}
          component={Checkout}
          options={{headerShown: false}}
        />
        {/**"Checkout"*/}
        <Stack.Screen
          name={Routes.NAVIGATION_TO_SELECTDELIVERY}
          component={SelectDelivery}
          options={{headerShown: false}}
        />
        {/**"SelectDelivery"*/}
        <Stack.Screen
          name={Routes.NAVIGATION_TO_NEWADDRESS}
          component={NewAddress}
          options={{headerShown: false}}
        />
        {/**"NewAddress"*/}
        {/* <Stack.Screen name={Routes.NAVIGATION_TO_WAYOFTRANSPORT} component={WayOfTransport} options={{ headerShown: false }} />  */}
        <Stack.Screen
          name={Routes.NAVIGATION_TO_PICKUPPOINTSELECTION}
          component={PickUpPointSelection}
          options={{headerShown: false}}
        />
        {/**"PickUpPointSelection"*/}
        <Stack.Screen
          name={Routes.NAVIGATION_TO_DATETIME}
          component={DateandTimeSelection}
          options={{headerShown: false}}
        />
        {/**"DateandTimeSelection"*/}
        <Stack.Screen
          name={Routes.NAVIGATION_TO_PaymentSelection}
          component={PaymentSelection}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={Routes.NAVIGATION_TO_ADDNEW_PAYMENTMETHOD}
          component={AddPaymentMethod}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={Routes.NAVIGATION_TO_NewPaySlips}
          component={NewPaySlips}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={Routes.NAVIGATION_TO_ORDERACCEPTED}
          component={OrderAccepted}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={Routes.NAVIGATION_TO_ADDRESSMAPSELECTION}
          component={AddressMapSelection}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={Routes.NAVIGATION_TO_CHANGEMOBILE}
          component={ChangeMobile}
          options={{headerShown: false}}
        />
        {/**"ChangeMobile" */}
        <Stack.Screen
          name={Routes.NAVIGATION_TO_VERIFICATION}
          component={Verification}
          options={{headerShown: false}}
        />
        {/**"Verification" */}
        <Stack.Screen
          name={Routes.NAVIGATION_to_ACCOUNTSUCCESS}
          component={AccountSuccess}
          options={{headerShown: false}}
        />
        {/**"AccountSuccess"  */}
      </Stack.Navigator>
    );
  };
  


  const WishlistStack = () => {
    const token = useSelector(state => state.commonReducer.token);
    return (
      <Stack.Navigator
        initialRouteName={token ? Routes.WISHTLIST : Routes.GUESTLOGIN} //'WishtList' : 'GuestLogin'}
        screenOptions={{
          headerStyle: {backgroundColor: ColorResource.Screamin_Green},
          headerTintColor: ColorResource.white,
          headerTitleStyle: {fontWeight: 'bold'},
        }}>
        <Stack.Screen
          name={Routes.WISHTLIST}
          component={WishtList}
          options={{headerShown: false}}
        />
        {/**"WishtList" */}
        <Stack.Screen
          name={Routes.GUESTLOGIN}
          component={GuestLogin}
          options={{headerShown: false}}
        />
        {/**"GuestLogin" */}
        <Stack.Screen
          name={Routes.NAVIGATION_TO_PRODUCTDETAILS}
          component={ProductDetails}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={Routes.NAVIGATION_TO_CHECKOUT}
          component={Checkout}
          options={{headerShown: false}}
        />
        {/**"Checkout"*/}
        <Stack.Screen
          name={Routes.NAVIGATION_TO_ORDERACCEPTED}
          component={OrderAccepted}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={Routes.NAVIGATION_TO_CHANGEMOBILE}
          component={ChangeMobile}
          options={{headerShown: false}}
        />
        {/**"ChangeMobile" */}
        <Stack.Screen
          name={Routes.NAVIGATION_TO_VERIFICATION}
          component={Verification}
          options={{headerShown: false}}
        />
        {/**"Verification" */}
        <Stack.Screen
          name={Routes.NAVIGATION_to_ACCOUNTSUCCESS}
          component={AccountSuccess}
          options={{headerShown: false}}
        />
        {/**"AccountSuccess"  */}
      </Stack.Navigator>
    );
  };

// BY JAMP 02/12/2025




// end BY JAMP 02/12/2025


  const ProfileStack = () => {
    const token = useSelector(state => state.commonReducer.token);
    return (
      <Stack.Navigator
        initialRouteName={
          token ? Routes.NAVIGATION_TO_USERPROFILE : Routes.GUESTLOGIN
        } //'UserProfile' : 'GuestLogin'
        screenOptions={{
          headerStyle: {backgroundColor: ColorResource.Screamin_Green},
          headerTintColor: ColorResource.white,
          headerTitleStyle: {fontWeight: 'bold'},
        }}>
        <Stack.Screen
          name={Routes.NAVIGATION_TO_USERPROFILE}
          component={UserProfile}
          options={{headerShown: false}}
        />
        {/*'UserProfile'*/}
        <Stack.Screen
          name={Routes.NAVIGATION_TO_ADDRESSLIST}
          component={AddressList}
          options={{headerShown: false}}
        />
        {/*/"AddressList" */}
        <Stack.Screen
          name={Routes.NAVIGATION_TO_NEWADDRESS}
          component={NewAddress}
          options={{headerShown: false}}
        />
        {/**"NewAddress" */}
        <Stack.Screen
          name={Routes.NAVIGATION_TO_EDITADDRESS}
          component={EditAddress}
          options={{headerShown: false}}
        />
        {/**"EditAddress" */}
        <Stack.Screen
          name={Routes.NAVIGATION_TO_EDIT_ALTERNET_ADDRESS}
          component={EditAlternetAddress}
          options={{headerShown: false}}
        />
        {/**"EditAlternetAddress" */}
        <Stack.Screen
          name={Routes.NAVIGATION_TO_CONTACTFORM}
          component={ContactForm}
          options={{headerShown: false}}
        />
        {/**"ContactForm" */}
        <Stack.Screen
          name={Routes.NAVIGATION_TO_UpdateUserprofile}
          component={UpdateUserprofile}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={Routes.NAVIGATION_TO_CHANGEPASSWORDFORM}
          component={ChangePasswordForm}
          options={{headerShown: false}}
        />
        {/**"ChangePasswordForm" */}
        <Stack.Screen
          name={Routes.NAVIGATION_TO_ORDERHISTORY}
          component={OrderHistory}
          options={{headerShown: false}}
        />
        {/**"OrderHistory" */}
        <Stack.Screen
          name={Routes.NAVIGATION_TO_ORDERHISTORYDETAIL}
          component={OrderHistoryDetail}
          options={{headerShown: false}}
        />
        {/**"OrderHistoryDetail" */}
        <Stack.Screen
          name={Routes.NAVIGATION_TO_ORDERCANCEL}
          component={OrderCancel}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={Routes.GUESTLOGIN}
          component={GuestLogin}
          options={{headerShown: false}}
        />
        {/**"GuestLogin" */}
        <Stack.Screen
          name={Routes.NAVIGATION_TO_PaymentSelection}
          component={PaymentSelection}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={Routes.NAVIGATION_TO_ADDNEW_PAYMENTMETHOD}
          component={AddPaymentMethod}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={Routes.NAVIGATION_TO_ORDEREDPRODUCTS}
          component={OrderedProduct}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={Routes.NAVIGATION_TO_PRODUCTDETAILS}
          component={ProductDetails}
          options={{headerShown: false}}
        />
        {/**"ProductDetails"*/}
        <Stack.Screen
          name={Routes.WISHTLIST}
          component={WishtList}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={Routes.NAVIGATION_TO_ADDRESSMAPSELECTION}
          component={AddressMapSelection}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={Routes.NAVIGATION_TO_CHECKOUT}
          component={Checkout}
          options={{headerShown: false}}
        />
        {/**"Checkout"*/}
        <Stack.Screen
          name={Routes.NAVIGATION_TO_ORDERACCEPTED}
          component={OrderAccepted}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={Routes.NAVIGATION_TO_CHANGEMOBILE}
          component={ChangeMobile}
          options={{headerShown: false}}
        />
        {/**"ChangeMobile" */}
        <Stack.Screen
          name={Routes.NAVIGATION_TO_VERIFICATION}
          component={Verification}
          options={{headerShown: false}}
        />
        {/**"Verification" */}
        <Stack.Screen
          name={Routes.NAVIGATION_to_ACCOUNTSUCCESS}
          component={AccountSuccess}
          options={{headerShown: false}}
        />
        {/**"AccountSuccess"  */}
        <Stack.Screen
          name={Routes.NAVIGATION_TO_NOTIFICATIONLIST}
          component={Notificationlist}
          options={{headerShown: false}}
        />

      <Stack.Screen
          name={Routes.NAVIGATION_TO_CHAT_SCREEN}
          component={chatScreen}
          options={{headerShown: false}}
      />
      </Stack.Navigator>
    );
  };
  const AppScreens = () => (
    <AppStack.Navigator>
      <Stack.Screen
        name={Routes.HOMESCREEN}
        component={HomeTabs}
        options={{headerShown: false}}
      />
      
      {/**"Home" */}
    </AppStack.Navigator>
  );

  const IntroScreen = () => (
    <AuthStack.Navigator>
      <Stack.Screen
        name={Routes.IntroScreen}
        component={Intro}
        options={{headerShown: false}}
      />
    </AuthStack.Navigator>
  );

  const AuthScreens = () => (
    <AuthStack.Navigator>
      <Stack.Screen
        name={Routes.SPLASHSCREEN}
        component={SplashScreen}
        options={{headerShown: false}}
      />
      {/**"Splashscreen" */}
      <Stack.Screen
        name={Routes.NAVIGATION_TO_EMAIL}
        component={Email}
        options={{headerShown: false}}
      />
      {/**"Email" */}
      <Stack.Screen
        name={Routes.NAVIGATION_TO_ACCOUNTSIGNUP}
        component={AccountSingup}
        options={{headerShown: false}}
      />
      {/**"AccountSingup"  */}
      <Stack.Screen
        name={Routes.NAVIGATION_TO_PASSWORD}
        component={Password}
        options={{headerShown: false}}
      />
      {/**"Password" */}
      {/* <Stack.Screen name={Routes.MOBILEVERIFICATION} component={MobileVerification} options={{ headerShown: false }} />  */}
      <Stack.Screen
        name={Routes.NAVIGATION_TO_CHANGEMOBILE}
        component={ChangeMobile}
        options={{headerShown: false}}
      />
      {/**"ChangeMobile" */}
      <Stack.Screen
        name={Routes.NAVIGATION_TO_FORGOTPASSWORD}
        component={ForgotPassword}
        options={{headerShown: false}}
      />
      {/**"ForgotPassword" */}
      <Stack.Screen
        name={Routes.NAVIGATION_TO_NEWPASSWORD}
        component={NewPassword}
        options={{headerShown: false}}
      />
      {/**"NewPassword" */}
      <Stack.Screen
        name={Routes.NAVIGATION_TO_CREATEACCOUNT}
        component={CreateAccount}
        options={{headerShown: false}}
      />
      {/**"CreateAccount" */}
      <Stack.Screen
        name={Routes.NAVIGATION_TO_VERIFICATION}
        component={Verification}
        options={{headerShown: false}}
      />
      {/**"Verification" */}
      <Stack.Screen
        name={Routes.NAVIGATION_to_ACCOUNTSUCCESS}
        component={AccountSuccess}
        options={{headerShown: false}}
      />
      {/**"AccountSuccess"  */}
      <Stack.Screen
        name={Routes.NAVIGATION_TO_PRODUCTDETAILS}
        component={ProductDetails}
        options={{headerShown: false}}
        path="ProductDetails/:url_key"
      />
    </AuthStack.Navigator>
  );

  const RootScreens = () => (
    <RootStack.Navigator>
      <Stack.Screen
        name={Routes.SPLASH}
        component={Splash}
        options={{headerShown: false}}
      />
      {/**"Splash" */}
      <Stack.Screen
        name={Routes.APPSCREENS}
        component={AppScreens}
        options={{headerShown: false}}
      />
      
      {/**"AppScreens" */}
      <Stack.Screen
        name={Routes.AUTHSCREENS}
        component={AuthScreens}
        options={{headerShown: false}}
      />
      {/**"AuthScreens"  */}
      <Stack.Screen
        name={Routes.IntroScreen}
        component={IntroScreen}
        options={{headerShown: false}}
      />
    </RootStack.Navigator>
    
  );
  // const Tabcreditivoo = () =>(
  //   <RootStack.Navigator>
  //     <Stack.Screen
          
  //       name={Routes.NAVIGATION_TABCREDITIVOO}
  //       component={MainTabsCreditivoo}
  //       options={{headerShown: false}}
  //     />
  //   </RootStack.Navigator>

  // );
  return (
    <NavigationContainer
      //linking={linking}
      ref={navigationRef}
      onReady={() =>
        (routeNameRef.current = navigationRef.current.getCurrentRoute().name)
      }
      onStateChange={async () => {
        const previousRouteName = routeNameRef.current;
        const currentRouteName = navigationRef.current.getCurrentRoute().name;
        setNavigator(navigationRef);
        if (previousRouteName !== currentRouteName) {
          console.log(`****** ${currentRouteName}*******`);
            const analytics = getAnalytics(getApp());

            await logEvent(analytics, 'screen_view', {
                firebase_screen: currentRouteName,
                firebase_screen_class: currentRouteName,
            });

          // await analytics().logScreenView({
          //   screen_name: currentRouteName,
          //   screen_class: currentRouteName,
          // });
        }
        routeNameRef.current = currentRouteName;
      }}>
      <RootScreens options={{animationEnabled: false}} />
      {/* <Tabcreditivoo options={{animationEnabled: false}} /> */}
    </NavigationContainer>
  );
};

export default Route;
