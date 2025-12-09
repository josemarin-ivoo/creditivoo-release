import {useNavigation} from '@react-navigation/native';
import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import {Icon, Input} from 'react-native-elements';
import commonStyle from '../../../commonStyle';
import {CustomButton} from '../../Components/CustomButton';
import CustomInput from '../../Components/CustomInput';
import {Layout} from '../../Components/Layout';
import {Register, getToken, sendLocationToServer} from '../../Queries/queries';
import {useSelector, useDispatch} from 'react-redux';
import {GLOBAL_DATA} from '../../redux/actionTypes';
import CustomPBar from '../../Components/CustomPBar';
import {translate} from '../../locales';
import {Routes} from '../../Utils/NavigationRoutes';
import {useKeyboard} from '../../Utils/KeybooardCustom';
import ResColors from '../../Utils/Colors';
import Helper from '../../Utils/Helper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AppContext} from '../AppContext';
import PermissionHandler from './../../Utils/PermissionHandler';
import {
  getItemFromStorage,
  getObjectFromStore,
  removeStoreItem,
  setItemInStorage,
  setObjectInStore,
} from '../../Utils/Storage';
import {_PUSH_COUNTER_CHECK} from '../../redux/PushInboxReducers/PushCounterAction';
import {useCustomer} from './../../Services/useCustomer';

// constructor(props) {
//     super(props);
//     const {placeholderStyle} = this.props;
// }

const locRefreshTimeInMin = 1440;

export const CreateAccount = () => {
  const global_data = useSelector((state: any) => state.commonReducer);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [email, setEmail] = useState(global_data.email);
  const [fpassword, setFPassword] = useState('');
  const [subscribedFlag, setSubscribedFlag] = useState(false);
  const [citizenId, setCitizenId] = useState('');
  const [phone, setPhone] = useState('');
  const [phone_pincode, setphone_pincode] = useState('+58');
  const [secureText, setSecureText] = useState(true);
  const [register, {loading, error, data}] = Register();

  //
  const [
    generateCustomerToken,
    {loading: tokload, error: tokError, data: tokData},
  ] = getToken();
  const {
    getCustomer,
    data: customerData,
    loading: customerLoading,
    error: customerError,
  } = useCustomer();

  const [
    saveLocation,
    {loading: locationLoading, error: locationError, data: locationData},
  ] = sendLocationToServer();

  const [keyboardHeigth] =
    useKeyboard(); /* initialize the hook (optional parameters) */
  const [btn_disabled, setbtn_disabled] = useState(false); // it should be a false to Allow Click Button
  const {appTheme} = useContext(AppContext);
  const [isDark, setDark] = useState(appTheme.type === 'dark');
  useEffect(() => {
    setDark(appTheme.type === 'dark');
  }, [appTheme.type]);
    useEffect(() => {
        checkAll();
    }, [fname, lname, email, fpassword, citizenId, phone, phone_pincode]);

  const checkAll = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const allValid =
            fname.trim().length > 0 &&
            lname.trim().length > 0 &&
            emailRegex.test(email.trim()) &&
            citizenId.trim().length >= 6 &&
            phone.trim().length >= 10 &&
            phone_pincode.trim() === '+58' &&
            fpassword.trim().length > 0;
        setbtn_disabled(!allValid);
    };

  useEffect(() => {
    if (data) {
      CallGeneToken();
    }
  }, [data]);

  const CallGeneToken = async () => {
    const hasPermission = PermissionHandler.hasLocationPermission();
    if (await hasPermission) {
      global_data.token ? PermissionHandler.getCurrentLatLong() : null;
    }
    const lat = Number(await getItemFromStorage('latitude'));
    const long = Number(await getItemFromStorage('longitude'));

    generateCustomerToken({
      variables: {
        email: email,
        password: fpassword,
        fcmToken: global_data.fcm_token,
        device_id: Helper.getUniqueId(),
        latitude: lat,
        longitude: long,
      },
    });
  };

  useEffect(() => {
    if (tokData) {
      console.log('tokData');
      console.log(tokData);
      dispatch({
        type: GLOBAL_DATA,
        payload: {token: tokData.generateCustomerToken.token},
      });
      dispatch(_PUSH_COUNTER_CHECK(false, email, 0, 'clear'));

      setTimeout(function () {
        getCustomer();
      }, 1000);
    }
  }, [tokData]);

  useEffect(() => {
    if (customerData) {
      // console.log( JSON.stringify( customerData ) )

      dispatch({
        type: GLOBAL_DATA,
        payload: {
          Fname: customerData.customer.firstName,
          Lname: customerData.customer.lastName,
          wishListId: customerData.customer.wishlist.id,
          is_phone_verified: customerData.customer.is_phone_verified,
          phone: phone,
          customerData: customerData.customer,
        },
      });
      // Navigating to acccout success screen after 1 sec
      setTimeout(function () {
        navigation.reset({
          index: 1,
          routes: [{name: Routes.NAVIGATION_to_ACCOUNTSUCCESS}],
          key: null,
        });
      }, 1000);
    }
  }, [customerData]);

  const syncLocData = async () => {
    await handleLOCATIONPermission();
  };

  useEffect(() => {
    if (error) {
      error && Helper.ShowAlert(`${error}`);
      setbtn_disabled(false);
    } else if (tokError) {
      console.log('tokError');
      console.log(tokError);
      Helper.ShowAlert(`${tokError}`);
      setbtn_disabled(false);
    } else if (customerError) {
      console.log('customerError');
      console.log(customerError);
      Helper.ShowAlert(`${customerError}`);
      setbtn_disabled(false);
    }
  }, [error, tokError, customerError]);

  const next = async () => {
    if (!btn_disabled) {
      await syncLocData();
      Helper.HandleVibration();
      setbtn_disabled(true);
      register({
        variables: {
          firstname: fname,
          lastname: lname,
          email: email,
          password: fpassword,
          is_subscribed: subscribedFlag,
          citizen_id: citizenId,
          phone: phone,
          phone_pincode: phone_pincode,
        },
      });
    }
  };
  const insets = useSafeAreaInsets();

  const handleLOCATIONPermission = async () => {
    const nowDT = new Date();

    const hasPermission = await PermissionHandler.hasLocationPermission();
    if (hasPermission) {
      await PermissionHandler.getCurrentLatLong();
    }
    setTimeout(async () => {
      if (hasPermission) {
        await removeStoreItem('locationData');
        const data = await getObjectFromStore('locationData');

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

          const locationData = {
            latitude: await getItemFromStorage('lat'),
            longitude: await getItemFromStorage('lng'),
            lastLocDate: new Date(nowDT.toString()),
            city: await getItemFromStorage('cityNameVal'),
          };
          await setObjectInStore('locationData', locationData);
          await sendLocationDataToServer(
            data.latitude,
            data.longitude,
            'signup',
            data.city,
            'true',
          );
        }
      }
    }, 3000);
  };

  const sendLocationDataToServer = async (lat, lng, event, city, isMobile) => {
    saveLocation({
      variables: {
        lat: lat,
        lng: lng,
        event: event,
        city: city,
        isMobile: isMobile,
      },
    });
  };

  useEffect(() => {
    console.log('Data returned from location service ------->>', locationError);
    //locationError && Helper.ShowAlert(`${error}`);
  }, [locationError]);

  useEffect(() => {
    console.log('Data returned from location service ------->>', locationData);
  }, [locationData]);

  return (
    <Layout>
      {/* <StatusBar backgroundColor='transparent' barStyle="dark-content" ></StatusBar> */}
      <KeyboardAvoidingView
        behavior={'height'}
        enabled={Platform.OS === 'ios' ? false : false}
        style={[
          styles.unAuth_MainContainer,
          {backgroundColor: appTheme.background},
        ]}>
        <TouchableWithoutFeedback
          onPress={Keyboard.dismiss}
          style={{backgroundColor: appTheme.background}}>
          <View style={[commonStyle.flex_1]}>
            <View
              style={[
                styles.safeAreContainer,
                {
                  marginBottom:
                    Platform.OS === 'ios'
                      ? 0
                      : keyboardHeigth == 0
                      ? 15
                      : keyboardHeigth - 80,
                },
              ]}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                  commonStyle.wrapper,
                  {
                    paddingTop: insets.top,
                    paddingBottom: insets.bottom,
                    backgroundColor: appTheme.background,
                  },
                ]}
                keyboardShouldPersistTaps="handled">
                <Text
                  style={[
                    commonStyle.h2,
                    commonStyle.fontBold,
                    commonStyle.marginBottom_20,
                    {marginTop: 50, color: appTheme.text},
                  ]}>
                  {translate('pre_login.lbl_create_an_account')}
                </Text>
                <View style={commonStyle.marginBottom_24}>
                  <CustomInput
                    labelText="pre_login.lbl_first_name"
                    onChangeText={value => setFname(value)}
                    placeholder="pre_login.lbl_enter_fname"
                  />
                </View>
                <View style={commonStyle.marginBottom_24}>
                  <CustomInput
                    labelText="pre_login.lbl_last_name"
                    onChangeText={value => setLname(value)}
                    placeholder="pre_login.lbl_last_name"
                  />
                </View>
                <View style={commonStyle.marginBottom_24}>
                  <CustomInput
                    labelText="pre_login.lbl_email"
                    keyboardType="email-address"
                    value={email}
                    editable={false}
                    placeholder="pre_login.lbl_enter_your_email"
                  />
                </View>
                <View style={commonStyle.marginBottom_24}>
                  <CustomInput
                    labelText="pre_login.lbl_citizen_id"
                    onChangeText={value => setCitizenId(value)}
                    placeholder="pre_login.lbl_enter_id_number"
                  />
                </View>
                <View
                  style={[commonStyle.marginBottom_24, {flexDirection: 'row'}]}>
                  <View style={{flex: 0.2, marginEnd: 10}}>
                    <Text
                      style={[
                        commonStyle.h6,
                        commonStyle.label,
                        {marginBottom: 5, color: appTheme.text},
                      ]}>
                      {translate('pre_login.lbl_code')}
                    </Text>

                    <Input
                      maxLength={4}
                      style={[
                        {
                          height: 48,
                          borderRadius: 16,
                          fontSize: 16,
                          textAlign: 'center',
                          justifyContent: 'center',
                          textAlignVertical: 'center',
                          color: isDark ? appTheme.text : ResColors.blackShade,
                        },
                      ]}
                      containerStyle={[
                        commonStyle.input,
                        {height: 48, backgroundColor: appTheme.InputBoxBGColor},
                      ]}
                      inputContainerStyle={{borderColor: ResColors.transparent}}
                      textAlignVertical="center"
                      keyboardType="phone-pad"
                      value={phone_pincode}
                      onChangeText={value => setphone_pincode(value)}
                      placeholder={'+58'}
                      placeholderTextColor={
                        isDark ? appTheme.text : ResColors.Gray
                      }
                    />
                  </View>
                  <View style={{flex: 0.8}}>
                    <CustomInput
                      maxLength={15}
                      labelText="pre_login.lbl_enter_phone_number"
                      keyboardType="numeric"
                      onChangeText={value => setPhone(value)}
                      placeholder="pre_login.lbl_enter_your_phone_number"
                    />
                  </View>
                </View>
                <View
                  style={[
                    commonStyle.marginBottom_60,
                    {marginBottom: Platform.OS === 'ios' ? 70 : 80},
                  ]}>
                  <CustomInput
                    labelText="pre_login.lbl_password"
                    onChangeText={value => setFPassword(value)}
                    placeholder="pre_login.lbl_type_password"
                    secureTextEntry={secureText}
                    rightIcon={
                      <Icon
                        name={!secureText ? 'eye' : 'eye-slash'}
                        size={18}
                        type="font-awesome-5"
                        color={appTheme.text}
                        onPress={() => {
                          Helper.HandleVibration();
                          setSecureText(!secureText);
                        }}
                      />
                    }
                  />
                </View>
              </ScrollView>
            </View>
            <View style={[commonStyle.buttonViewStyles]}>
              <CustomButton
                title="pre_login.lbl_submit"
                onPress={next}
                customButtonStyle={[
                  btn_disabled
                    ? (commonStyle.btn_disabled,
                      isDark
                        ? {backgroundColor: ResColors.a1E1E1E}
                        : commonStyle.btn_disabled)
                    : commonStyle.btn_primary,
                ]}
                customTitleStyle={[
                  btn_disabled ? {color: ResColors.a3E3E3E} : null,
                ]}
              />
            </View>
            <CustomPBar showProgress={loading || tokload || customerLoading} />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  safeAreContainer: {flex: 1},
  unAuth_MainContainer: {
    paddingBottom: 16,
    paddingRight: 16,
    paddingLeft: 16,
    flex: 1,
  },
  headerWrap: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  ButtonViewStyles: {
    flex: 0.1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
