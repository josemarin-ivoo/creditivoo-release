import {useNavigation, StackActions} from '@react-navigation/native';
import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TouchableHighlight,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
  AppState,
} from 'react-native';
import commonStyle from '../../../commonStyle';
import {CustomButton} from '../../Components/CustomButton';
import CustomInput from '../../Components/CustomInput';
import {Layout} from '../../Components/Layout';
import {verifyMobile, sentOtp, getToken} from '../../Queries/queries';
import Toast from 'react-native-simple-toast';
import {useSelector, useDispatch} from 'react-redux';
import {GLOBAL_DATA} from '../../redux/actionTypes';
import CustomPBar from '../../Components/CustomPBar';
import OtpInputs from '../../Components/OtpInput';
import {translate} from '../../locales';
import {Routes} from '../../Utils/NavigationRoutes';
import {AccountSuccess} from './AccountSuccess';
import {useCustomer} from '../../Services/useCustomer';
import Helper from '../../Utils/Helper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ResColors from '../../Utils/Colors';
import Colors from '../../Utils/Colors';
import {AppContext} from '../AppContext';
import PermissionHandler from './../../Utils/PermissionHandler';
import {getItemFromStorage} from '../../Utils/Storage';
import {_PUSH_COUNTER_CHECK} from '../../redux/PushInboxReducers/PushCounterAction';

export const Verification = props => {
  // console.log('isnew --- ', props.route.params.isnew)
  var interval: any = '';
  const [verifyMobileOtp, {loading, error, data}] = verifyMobile();
  const [reSendOtp, {loading: loadingB, error: errorB, data: dataB}] =
    sentOtp();
  const global_data = useSelector((state: any) => state.commonReducer);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [fullOtp, setFullOtp] = useState('');
  const [
    generateCustomerToken,
    {loading: tokload, error: tokError, data: tokData},
  ] = getToken();
  const secondsToMinutes = seconds =>
    Math.floor(seconds / 60) + ':' + ('0' + Math.floor(seconds % 60)).slice(-2);
  const {
    getCustomer,
    data: customerData,
    loading: customerLoading,
    error: customerError,
  } = useCustomer();
  //const [sendPhoneOtp, { loading: loadingD, data: sendOtpResponse }] = sentOtp()
  const {appTheme} = useContext(AppContext);
  const [isDark, setDark] = useState(appTheme.type === 'dark');
  useEffect(() => {
    setDark(appTheme.type === 'dark');
  }, [appTheme.type]);

  // Show the option to re-send the OTP after the specified time interval
  const initialTimer = 300;
  const maxNumberOfTimes = 3;
  const [numberOfTimes, setNumberOfTimes] = useState(1);

  const [resendFlag, setResendFlag] = useState(false);
  const [timer, setTimer] = useState(initialTimer);
  const appState = useRef(AppState.currentState);

  const Stimer = useRef(null);

  useEffect(() => {
    if (!resendFlag) {
      if (timer > 0) {
        Stimer.current = setTimeout(() => {
          setTimer(timer => timer - 1);
        }, 1000);

        if (timer == 0) {
          clearTimeout(timer);
        }
      } else {
        if (numberOfTimes < maxNumberOfTimes) {
          setNumberOfTimes(numberOfTimes + 1);
          setResendFlag(true);
        }
      }
    }
  }, [timer, resendFlag]);

  // console.log(navigation)
  useEffect(() => {
    setTimeout(() => {
      const now = new Date();
      dispatch({type: GLOBAL_DATA, payload: {start_time: now.toISOString()}});
    }, 100);

    dispatch({type: GLOBAL_DATA, payload: {phone: props.route.params.mobile}});

    //sendPhoneOtp({ variables: { phone: props.route.params.mobile } });
    AppState.addEventListener('change', handleAppStateChange);

    return () => AppState.removeEventListener('change', handleAppStateChange);
  }, []);

  const handleAppStateChange = async nextAppState => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      clearTimeout(Stimer.current);
      // We just became active again: recalculate elapsed time based
      // on what we stored in AsyncStorage when we started.
      const elapsed = await getElapsedTime();
      // Update the elapsed seconds state

      setTimer(Math.floor(initialTimer - elapsed));
    }
    appState.current = nextAppState;
  };
  const getElapsedTime = async () => {
    try {
      const value = await AsyncStorage.getItem('persist:ivo-app');

      const localStorage = JSON.parse(value).commonReducer;
      const sTime = JSON.parse(localStorage).start_time;

      const startTime = new Date(sTime);
      const now = new Date();
      var seconds = (now.getTime() - startTime.getTime()) / 1000;
      return seconds; //differenceInSeconds( now, Date.parse( startTime ) );
    } catch (err) {
      // TODO: handle errors from setItem properly
      console.warn(err);
    }
  };

  const resendOTPCode = () => {
    Helper.HandleVibration();
    const now = new Date();
    dispatch({type: GLOBAL_DATA, payload: {start_time: now.toISOString()}});
    reSendOtp({
      variables: {
        phone: global_data.phone,
      },
    });

    setTimer(initialTimer);
    setResendFlag(false);
  };

  // Endof OTP reset

  useEffect(() => {
    error && Helper.ShowAlert(`${error}`);
  }, [error]);

  useEffect(() => {
    if (data) {
      VerifyUser();
    }
  }, [data]);

  const VerifyUser = async () => {
    if (props.route.params.isnew) {
      if (data.verifyPhoneOtp.is_verified) {
        const hasPermission = PermissionHandler.hasLocationPermission();
        if (await hasPermission) {
          PermissionHandler.getCurrentLatLong();
        }

        const lat = Number(await getItemFromStorage('latitude'));
        const long = Number(await getItemFromStorage('longitude'));

        console.log(lat, ' -- loc  -- ', long);

        props.route.params.passoword
          ? generateCustomerToken({
              variables: {
                email: global_data.email,
                password: props.route.params.passoword,
                fcmToken: global_data.fcm_token,
                device_id: Helper.getUniqueId(),
                latitude: lat,
                longitude: long,
              },
            })
          : getCustomer();
      } else {
        Toast.show(translate('pre_login.msg_incorrect_otp'));
      }
    } else {
      // Routes.APPSCREENS
      data.verifyPhoneOtp.is_verified
        ? navigation.reset({
            index: 1,
            routes: [{name: Routes.APPSCREENS}],
            key: null,
          })
        : Toast.show(translate('pre_login.msg_incorrect_otp'));
    }
  };

  useEffect(() => {
    if (tokData) {
      dispatch({
        type: GLOBAL_DATA,
        payload: {token: tokData.generateCustomerToken.token},
      });
      dispatch(_PUSH_COUNTER_CHECK(false, global_data.email, 0, 'clear'));
      getCustomer();
    }
  }, [tokData]);

  useEffect(() => {
    if (customerData) {
      dispatch({
        type: GLOBAL_DATA,
        payload: {
          Fname: customerData.customer.firstName,
          Lname: customerData.customer.lastName,
          wishListId: customerData.customer.wishlist.id,
          is_phone_verified: customerData.customer.is_phone_verified,
          customerData: customerData.customer,
        },
      });

      setTimeout(function () {
        navigation.reset({
          index: 1,
          routes: [{name: Routes.NAVIGATION_to_ACCOUNTSUCCESS}],
          key: null,
        });
      }, 1000);
    }
  }, [customerData]);

  const next = () => {
    Helper.HandleVibration();
    if (fullOtp.length != 4) {
      return;
    }

    //console.log(global_data.phone)
    verifyMobileOtp({
      variables: {
        phone: global_data.phone,
        otp: fullOtp,
      },
    });
  };

  const insets = useSafeAreaInsets();

  return (
    <Layout>
      <>
        <View
          style={[
            styles.container_keyboard,
            {backgroundColor: appTheme.background},
          ]}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={[commonStyle.flex_1]}>
              <Text
                style={[
                  commonStyle.h2,
                  commonStyle.fontBold,
                  commonStyle.marginBottom_30,
                  {
                    marginTop: Platform.OS === 'ios' ? insets.top + 30 : 50,
                    color: appTheme.text,
                  },
                ]}>
                {translate('pre_login.lbl_phone_number_verification')}
              </Text>
              <View style={styles.container_otp}>
                <OtpInputs
                  placeholder={'\u2B24'}
                  placeholderTextColor={ResColors.disc_rate_clr}
                  selectionColor={ResColors.black}
                  handleChange={code => {
                    setFullOtp(code);
                  }}
                  numberOfInputs={4}
                  autofillFromClipboard={false}
                />
              </View>
              {resendFlag ? (
                <TouchableHighlight
                  onPress={() => resendOTPCode()}
                  underlayColor="transparent">
                  <Text
                    style={[
                      commonStyle.h5,
                      styles.reSendOtp_text,
                      {color: appTheme.text},
                    ]}>
                    {translate('pre_login.lbl_resend_the_code')}
                  </Text>
                </TouchableHighlight>
              ) : (
                <View>
                  <Text
                    style={[
                      commonStyle.h6,
                      styles.optsendTo_text,
                      {color: appTheme.text},
                    ]}>
                    {translate('pre_login.lbl_sent_to_your_mobile')}
                  </Text>
                  <Text
                    style={[
                      commonStyle.h6,
                      styles.otpresendTimer_Text,
                      {color: appTheme.text},
                    ]}>
                    {numberOfTimes < maxNumberOfTimes
                      ? translate('pre_login.lbl_you_can_send_after') +
                        ' ' +
                        secondsToMinutes(timer) +
                        ' ' +
                        translate('pre_login.lbl_minutes')
                      : ''}
                  </Text>
                </View>
              )}

              <View style={[commonStyle.buttonViewStyles]}>
                <CustomButton
                  title="pre_login.lbl_create_an_account"
                  // disabled={fullOtp.length != 4}
                  onPress={next}
                  // customButtonStyle={[(fullOtp.length == 4) ? commonStyle.btn_primary : commonStyle.btn_disabled]}

                  customButtonStyle={[
                    fullOtp.length != 4
                      ? (commonStyle.btn_disabled,
                        isDark
                          ? {backgroundColor: Colors.a1E1E1E}
                          : commonStyle.btn_disabled)
                      : commonStyle.btn_primary,
                  ]}
                  customTitleStyle={[
                    fullOtp.length != 4 ? {color: Colors.a3E3E3E} : null,
                  ]}
                />
              </View>
              <CustomPBar
                showProgress={loading || tokload || customerLoading}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container_keyboard: {
    padding: 16,
    flex: 1,
  },
  container_otp: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  reSendOtp_text: {
    marginTop: Platform.OS === 'ios' ? 60 : 32,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  optsendTo_text: {
    marginTop: Platform.OS === 'ios' ? 60 : 32,
    textAlign: 'center',
  },
  otpresendTimer_Text: {marginTop: 0, textAlign: 'center'},
});
