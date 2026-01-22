import {useNavigation, StackActions} from '@react-navigation/native';
import React, {useState, useEffect, useContext} from 'react';
import {Alert} from 'react-native';

import {TouchableOpacity, View, StyleSheet, Text, Platform} from 'react-native';
import commonStyle from '../../commonStyle';
import {CustomButton} from './CustomButton';
import {DELETE_DATA, GLOBAL_DATA} from '../redux/actionTypes';
import {useDispatch, useSelector} from 'react-redux';
import {appleAuth} from '@invertase/react-native-apple-authentication';
// import { GoogleSignin, statusCodes } from '@react-native-community/google-signin';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {translate} from '../locales';
import {sendLocationToServer, socialSignin} from '../Queries/queries';
import ResColor from '../Utils/Colors';
import ResImage from '../Utils/Image';
import messaging from '@react-native-firebase/messaging';
import ProgressiveImage from '../Components/ProgressiveImage';

// Import FBSDK
import {LoginManager, AccessToken} from 'react-native-fbsdk-next';
import CustomPBar from './CustomPBar';
import {useCustomer} from '../Services/useCustomer';
import {Routes} from '../Utils/NavigationRoutes';
import {CartItemCounterAction} from '../redux/cartItemCounterAction';
import Helper from './../Utils/Helper';
import {AppContext} from '../Pages/AppContext';
import PermissionHandler from './../Utils/PermissionHandler';
import {
  getItemFromStorage,
  getObjectFromStore,
  removeStoreItem,
  setItemInStorage,
  setObjectInStore,
} from '../Utils/Storage';
import {_PUSH_COUNTER_CHECK} from '../redux/PushInboxReducers/PushCounterAction';

let isDataLoading = false;

export const SocialButtons = (props: any) => {
  let isSignUp = 'signin';
  const {appTheme} = useContext(AppContext);
  const [isDark, setDark] = useState(appTheme.type === 'dark');

  const [
    saveLocation,
    {loading: locationLoading, error: locationError, data: locationData},
  ] = sendLocationToServer();

  // const [isLoading, setIsLoading] = useState( false )
  const [socialLogin, {loading, error, data: sData}] = socialSignin();
  const navigation = useNavigation();
  const global_data = useSelector((state: any) => state.commonReducer);
  const dispatch = useDispatch();
  const [fcmToken, setfcmToken] = useState('');
  const {
    getCustomer,
    data: customerData,
    loading: customerLoading,
    error: customerError,
  } = useCustomer();

  useEffect(() => {
    if (error) {
      error && Helper.ShowAlert(`${error}`);
    }
  }, [error]);

  useEffect(() => {
    requestUserPermission();
  }, []);

  useEffect(() => {
    if (fcmToken) {
      console.log(`FCM: ${fcmToken}`);
      dispatch({type: GLOBAL_DATA, payload: {fcm_token: fcmToken}});
      //AsyncStorage.setItem('fcmToken', fcmToken);
    }
  }, [fcmToken]);

  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    if (enabled) {
      console.log('FCM: accepted permissions');
      messaging()
        .getToken()
        .then(token => {
          setfcmToken(fcmToken => token);
        });
    } else console.log('FCM: rejected permissions');
    return enabled;
  };

  const goToHome = () => {
    Helper.HandleVibration();

    dispatch({type: DELETE_DATA});

    //setIsLoading( false )

    navigation.dispatch(StackActions.replace('AppScreens'));
  };

  const [] = useState('');

  //SIGIN WITH APPLE
  async function onAppleButtonPress() {
    Helper.HandleVibration();
    // performs login request
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    });
    // get current authentication state for user
    // /!\ This method must be tested on a real device. On the iOS simulator it always throws an error.
    const credentialState = await appleAuth.getCredentialStateForUser(
      appleAuthRequestResponse.user,
    );
    // use credentialState response to ensure the user is authenticated

    if (credentialState === appleAuth.State.AUTHORIZED) {
      console.log('appleAuth.State.AUTHORIZED');
      doAppleLogin(
        appleAuthRequestResponse.authorizationCode,
        appleAuthRequestResponse.identityToken,
        appleAuthRequestResponse.fullName.givenName +
          ' ' +
          appleAuthRequestResponse.fullName.familyName,
      );
    } else {
      console.log('Apple Authirisation failed');
      Helper.ShowAlert('Login Failed');
    }
  }

  const doAppleLogin = async (
    authCode: String,
    idToken: String,
    fullname: String,
  ) => {
    const hasPermission = PermissionHandler.hasLocationPermission();
    if (await hasPermission) {
      global_data.token && PermissionHandler.getCurrentLatLong();
    }

    const lat = Number(await getItemFromStorage('latitude'));
    const long = Number(await getItemFromStorage('longitude'));

    console.log('Social button lat long......');

    socialLogin({
      variables: {
        type: 'Apple',
        access_token: '',
        refresh_token: '',
        auth_code: '',
        id_token: idToken,
        fullname:
          fullname.replace('null', '').length > 0 ? fullname : 'No Name',
        fcmToken: global_data.fcm_token,
        device_id: Helper.getUniqueId(),
        latitude: lat,
        longitude: long,
      },
    });

    //global_data.token ? handleLOCATIONPermission() : null;
  };

  //LOGIN WITH FACEBOOK

  const loginWithFacebook = () => {
    //Settings.initializeSDK();
    Helper.HandleVibration();
    console.log('Login start');
    //setIsLoading( true )
    LoginManager.logInWithPermissions(['public_profile']).then(
      login => {
        console.log('inside login');
        if (login.isCancelled) {
          console.log('Login cancelled', login);
          //setIsLoading( true )
        } else {
          AccessToken.getCurrentAccessToken().then(async data => {
            const hasPermission = PermissionHandler.hasLocationPermission();
            if (await hasPermission) {
              global_data.token && PermissionHandler.getCurrentLatLong();
            }

            const lat = Number(await getItemFromStorage('latitude'));
            const long = Number(await getItemFromStorage('longitude'));
            console.log('loginWithFacebook');
            console.log(JSON.stringify(data));

            socialLogin({
              variables: {
                type: 'Facebook',
                access_token: data.accessToken.toString(),
                auth_code: '',
                refresh_token: '',
                id_token: '',
                fullname: '',
                fcmToken: global_data.fcm_token,
                device_id: Helper.getUniqueId(),
                latitude: lat,
                longitude: long,
              },
            });
          });

          //global_data.token ? handleLOCATIONPermission() : null;
        }
      },
      error => {
        console.log('Login fail with error: ' + error);
      },
    );

    console.log('Login end');
  };

  useEffect(() => {
    if (sData) {
      //setIsLoading( true )
      // console.log( "SData" );
      //  console.log( sData );
      if (sData.socialLogin) {
        console.log(`App Token::::::::::::::${sData.socialLogin.token}`);
        // Alert.alert(`App Token::::::::::::::${sData.socialLogin.token}`);
        dispatch({
          type: GLOBAL_DATA,
          payload: {token: sData.socialLogin.token},
        });

        setTimeout(function () {
          getCustomer();
          //setIsLoading( false )
        }, 1000);
      } else {
        Helper.ShowAlert('Login Failed');
      }
    }
    //setIsLoading( false )
  }, [sData]);

  useEffect(() => {
    if (customerData) {
      isDataLoading = true;
      // console.log( JSON.stringify( customerData ) );
      // Alert.alert('Customer Data', JSON.stringify(customerData));
      if (customerData.customer.phone == null) {
        isSignUp = 'signup';
      }
      syncLocData();

      dispatch(
        _PUSH_COUNTER_CHECK(false, customerData.customer.email, 0, 'clear'),
      );

      dispatch({
        type: GLOBAL_DATA,
        payload: {
          Fname: customerData.customer.firstName,
          Lname: customerData.customer.lastName,
          wishListId: customerData.customer.wishlist.id,
          is_phone_verified: customerData.customer.is_phone_verified,
          phone: customerData.customer.phone,
          email: customerData.customer.email,
          customerData: customerData.customer,
        },
      });

      let mob: String = customerData.customer.phone;
      let phone_pincode: String = customerData.customer.phone_pincode;

      if (customerData.customerCart.items.length <= 0) {
        dispatch(CartItemCounterAction(false));
      } else {
        dispatch(CartItemCounterAction(true));
      }

      if (customerData.customer.is_phone_verified) {
        // Navigate to Home screen
        setTimeout(() => {
          isDataLoading = false;
          navigation.reset({
            index: 1,
            routes: [{name: Routes.APPSCREENS}],
            key: null,
          });
        }, 3000);
      } else if (customerData.customer.phone == null) {
        isDataLoading = false;
        setTimeout(() => {
          navigation.navigate(Routes.AUTHSCREENS, {
            screen: Routes.NAVIGATION_TO_CHANGEMOBILE,
            params: {mobile: '', phone_pincode: '+58', isnew: true},
          });
        }, 3000);
      } else {
        isDataLoading = false;
        setTimeout(() => {
          navigation.navigate(Routes.AUTHSCREENS, {
            screen: Routes.NAVIGATION_TO_CHANGEMOBILE,
            params: {mobile: mob, phone_pincode: phone_pincode, isnew: false},
          });
        }, 3000);
      }

      // customerData.customer.phone == null ?
      //   navigation.navigate( Routes.AUTHSCREENS, { screen: Routes.NAVIGATION_TO_CHANGEMOBILE, params: { mobile: '', phone_pincode: '+58', isnew: true } } )
      //   :
      //   ( customerData.customer.is_phone_verified ? navigation.reset( { index: 1, routes: [{ name: Routes.APPSCREENS },], key: null } ) : navigation.navigate( Routes.AUTHSCREENS, { screen: Routes.NAVIGATION_TO_CHANGEMOBILE, params: { mobile: mob, phone_pincode: phone_pincode, isnew: false } } )
      //   )
    }
  }, [customerData]);

  const syncLocData = async () => {
    //const data = await getObjectFromStore('locationData');
    await removeStoreItem('locationData');
    await handleLOCATIONPermission();
  };

  //GOOGLE LOGIN
  const [, setUserInfo] = useState(null);
  const [, setIsLoggedIn] = useState(false);
  const [, setError] = useState(null);

  useEffect(() => {
    configureGoogleSign();
  }, []);

  function configureGoogleSign() {
    GoogleSignin.configure({
      webClientId:
        '393027277394-hdc7cccs461vcm84v497hae5md59ik2a.apps.googleusercontent.com',
      offlineAccess: false,
      forceCodeForRefreshToken: true,
    });
  }

  const getRefreshTokenApi = async (myToken: string) => {
    try {
      let response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          code: myToken,
          client_id:
            '393027277394-hdc7cccs461vcm84v497hae5md59ik2a.apps.googleusercontent.com',
          client_secret: 'DdVkDrCP68xjqQ1sL2Oltijs',
        }),
      });

      let json = await response.json();
      // console.log( "JSON:" + JSON.stringify( json ) );

      let refToken: String = '';
      for (var key in json) {
        console.log('============= ', key);
        //console.log( key );
        if (key === 'refresh_token') {
          refToken = json.refresh_token;
        }
      }
      const hasPermission = PermissionHandler.hasLocationPermission();
      if (await hasPermission) {
        global_data.token && PermissionHandler.getCurrentLatLong();
      }

      const lat = Number(await getItemFromStorage('latitude'));
      const long = Number(await getItemFromStorage('longitude'));
      console.log('Social button lat long google......');
      console.log({
        type: 'Google',
        access_token: json.access_token,
        auth_code: myToken,
        refresh_token: refToken,
        id_token: '',
        fullname: '',
        fcmToken: global_data.fcm_token,
        device_id: Helper.getUniqueId(),
        latitude: lat,
        longitude: long,
      });

      socialLogin({
        variables: {
          type: 'Google',
          access_token: json.access_token,
          auth_code: myToken,
          refresh_token: refToken,
          id_token: '',
          fullname: '',
          fcmToken: global_data.fcm_token,
          device_id: Helper.getUniqueId(),
          latitude: lat,
          longitude: long,
        },
      });

      //global_data.token ? handleLOCATIONPermission() : null;
    } catch (error) {
      console.error('error ' + error);
    }
  };

  async function signInWithGoogle() {
    //setIsLoading( true )
    console.log('start');
    Helper.HandleVibration();
    try {
      GoogleSignin.configure({
        offlineAccess: true,
        forceCodeForRefreshToken: true,
        webClientId:
          '393027277394-hdc7cccs461vcm84v497hae5md59ik2a.apps.googleusercontent.com',
      });
      console.log('start 1');
      try {
        await GoogleSignin.hasPlayServices({
          showPlayServicesUpdateDialog: true,
        });
        const userInfo = await GoogleSignin.signIn();
        console.log(JSON.stringify(userInfo));
        setIsLoggedIn(true);
        setUserInfo(userInfo);
        setError(null);

        console.log(
          `GoogleSignin Token: ****************************** : ${userInfo.data.serverAuthCode}`,
        );
        if (userInfo.data.serverAuthCode != null) {
          getRefreshTokenApi(userInfo.data.serverAuthCode);
        } else {
          Helper.ShowAlert('Error al iniciar sesión');
        }
      } catch (error) {
        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
          // when user cancels sign in process,
          Helper.ShowAlert('Inicio de sesión cancelado');
        } else if (error.code === statusCodes.IN_PROGRESS) {
          // when in progress already
          //  Helper.ShowAlert( 'Login in progress' );
        } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          // when play services not available
          Helper.ShowAlert('Los servicios de juego no están disponibles');
        } else {
          // some other error
          Helper.ShowAlert(translate('home.msg_error'), error.toString());
          setError(error);
        }
      }
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // when user cancels sign in process,
        // Helper.ShowAlert( 'Login Cancelled' );
      }
    }
    //setIsLoading( false )
  }

  const sendLocationDataToServer = async (lat, lng, event, city, isMobile) => {
    console.log('server data send....');
    saveLocation({
      variables: {
        lat: lat,
        lng: lng,
        event: event,
        city: city,
        isMobile: isMobile,
      },
    });
    console.log('server data send complete....');
  };

  useEffect(() => {
    console.log('Data returned from location service ------->>', locationError);
    //locationError && Helper.ShowAlert(`${error}`);
  }, [locationError]);

  useEffect(() => {
    console.log('Data returned from location service ------->>', locationData);
  }, [locationData]);

  // Check the user location permission access permission every 7 dyas
  const handleLOCATIONPermission = async () => {
    const hasPermission = await PermissionHandler.hasLocationPermission();
    if (hasPermission) {
      await PermissionHandler.getCurrentLatLong();
    }
    const nowDT = new Date();
    setTimeout(async () => {
      if (hasPermission) {
        const data = await getObjectFromStore('locationData');
        const locRefreshTimeInMin =
          (await getItemFromStorage('minLocationTime')) || '1440';
        console.log('Data of local storage object is -------->>', data);
        if (data == null) {
          const locationDataVal = {
            latitude: await getItemFromStorage('lat'),
            longitude: await getItemFromStorage('lng'),
            lastLocDate: new Date(nowDT.toString()),
            city: await getItemFromStorage('cityNameVal'),
          };
          await setObjectInStore('locationData', locationDataVal);
          await sendLocationDataToServer(
            await getItemFromStorage('lat'),
            await getItemFromStorage('lng'),
            'signin',
            await getItemFromStorage('cityNameVal'),
            'true',
          );
        } else {
          const storedLat = await getItemFromStorage('lat');
          const storedLng = await getItemFromStorage('lng');
          const lastLocDate = await data.lastLocDate;

          console.log(
            'Data of local storage is -------->>',
            storedLat,
            storedLng,
            lastLocDate,
          );

          if (lastLocDate !== '' || lastLocDate !== null) {
            const lastStoredDate = new Date(
              lastLocDate?.toString() || nowDT.toString(),
            );

            console.log('Time between dates is ------>>', lastLocDate, nowDT);

            const timeDiff = nowDT.getTime() - lastStoredDate.getTime();
            const differenceMinutes = Math.floor(timeDiff / (1000 * 60));

            console.log(
              'Time difference between dates is ------>>',
              differenceMinutes,
            );
            if (differenceMinutes > parseInt(locRefreshTimeInMin)) {
              await removeStoreItem('locationData');
              const locationDataVal = {
                latitude: await getItemFromStorage('lat'),
                longitude: await getItemFromStorage('lng'),
                lastLocDate: new Date(nowDT.toString()),
                city: await getItemFromStorage('cityNameVal'),
              };
              await setObjectInStore('locationData', locationDataVal);
              console.log(
                'Time diff between dates is ------>>',
                differenceMinutes,
              );
              await sendLocationDataToServer(
                data.latitude,
                data.longitude,
                isSignUp,
                data.city,
                'true',
              );
              isSignUp = 'signin';
            } else {
              console.log('No need to sync the data to the server');
            }
          }
        }
      }
    }, 4000);
  };

  return (
    <>
      {/* Apple */}
      <View style={[commonStyle.marginBottom_15]}>
        {Platform.OS === 'ios' ? (
          <View>
            <TouchableOpacity
              onPress={() => onAppleButtonPress()}
              style={[
                isDark ? commonStyle.btn_mail : commonStyle.btn_apple,
                commonStyle.btn_full,
                commonStyle.btnStyle,
                styles.Gmail_email_Touch_style,
              ]}>
              <View
                style={[
                  styles.buttons_containerStyle,
                  {justifyContent: 'space-between'},
                ]}>
                <ProgressiveImage
                  source={isDark ? ResImage.ic_appleB : ResImage.ic_apple}
                  style={[commonStyle.he_wi_24]}
                  resizeMode="center"
                />
              </View>
              <View>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={[
                    commonStyle.h5,
                    commonStyle.fontBold,
                    {
                      paddingLeft: 20,
                      color: isDark ? ResColor.black : ResColor.white,
                    },
                  ]}>
                  {translate('social_login.lbl_continue_with_apple')}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
      {/* Facebook */}

      <View style={[commonStyle.marginBottom_15]}>
        <TouchableOpacity
          onPress={() => loginWithFacebook()}
          style={[
            commonStyle.btn_fb,
            commonStyle.btn_full,
            commonStyle.btnStyle,
            styles.Gmail_email_Touch_style,
          ]}>
          <View
            style={[
              styles.buttons_containerStyle,
              {justifyContent: 'space-between'},
            ]}>
            <ProgressiveImage
              source={ResImage.ic_fb}
              style={[commonStyle.he_wi_24]}
              resizeMode="center"
            />
          </View>
          <View>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[
                commonStyle.h5,
                commonStyle.fontBold,
                {paddingLeft: 35, color: ResColor.white},
              ]}>
              {translate('social_login.lbl_continue_with_facebook')}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* GMAIL */}
      <View style={[commonStyle.marginBottom_15]}>
        <TouchableOpacity
          onPress={() => signInWithGoogle()}
          style={[
            commonStyle.btn_google,
            commonStyle.btn_full,
            commonStyle.btnStyle,
            styles.Gmail_email_Touch_style,
          ]}>
          <View
            style={[
              styles.buttons_containerStyle,
              {justifyContent: 'space-between'},
            ]}>
            <ProgressiveImage
              source={ResImage.ic_gmail}
              style={[commonStyle.he_wi_24]}
              resizeMode="center"
            />
          </View>
          <View>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[commonStyle.h5, commonStyle.fontBold, {marginLeft: 20}]}>
              {translate('social_login.lbl_continue_with_google')}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Email */}
      <View style={[commonStyle.marginBottom_15]}>
        <TouchableOpacity
          onPress={props.EmailNavigation}
          style={[
            commonStyle.btn_mail,
            commonStyle.btn_full,
            commonStyle.btnStyle,
            styles.Gmail_email_Touch_style,
          ]}>
          <View style={styles.buttons_containerStyle}>
            <ProgressiveImage
              source={ResImage.ic_email}
              style={[commonStyle.he_wi_24]}
              resizeMode="stretch"
            />
          </View>
          <View>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[commonStyle.h5, commonStyle.fontBold, {marginLeft: 20}]}>
              {translate('social_login.lbl_continue_with_email')}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      {/* Guest */}
      <View style={[commonStyle.marginBottom_15]}>
        {props.showGuestLogin === 'show' ? (
          <CustomButton
            title="social_login.lbl_try_app_now"
            customButtonStyle={[commonStyle.btn_mail]}
            customTitleStyle={[commonStyle.fontBold, {color: ResColor.black}]}
            onPress={goToHome}
          />
        ) : null}
      </View>
      <CustomPBar
        showProgress={
          loading || locationLoading || customerLoading || isDataLoading
        }
      />
    </>
  );
};

const styles = StyleSheet.create({
  buttons_containerStyle: {position: 'absolute', left: 20},
  Gmail_email_Touch_style: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
