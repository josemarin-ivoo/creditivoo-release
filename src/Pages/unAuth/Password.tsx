import {useNavigation, StackActions} from '@react-navigation/native';
import React, {useState, useEffect, useContext} from 'react';
import {
  Text,
  StyleSheet,
  TouchableHighlight,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  View,
} from 'react-native';
import {Icon} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';
import commonStyle from '../../../commonStyle';
import {CustomButton} from '../../Components/CustomButton';
import CustomInput from '../../Components/CustomInput';
import {Layout} from '../../Components/Layout';
import {getToken} from '../../Queries/queries';
import {GLOBAL_DATA} from '../../redux/actionTypes';
import CustomPBar from '../../Components/CustomPBar';
import {translate} from '../../locales';
import ResColor from '../../Utils/Colors';
import {Routes} from '../../Utils/NavigationRoutes';
import {useCustomer} from '../../Services/useCustomer';
import {CartItemCounterAction} from '../../redux/cartItemCounterAction';
import Helper from '../../Utils/Helper';
import {AnalyticsEvent} from '../../helpers/analyticHelper';
import TrackEvents from '../../Utils/TrackingEvent';
import {AppContext} from '../AppContext';
import PermissionHandler from '../../Utils/PermissionHandler';
import Geolocation from 'react-native-geolocation-service';
import {getItemFromStorage} from '../../Utils/Storage';
import {_PUSH_COUNTER_CHECK} from '../../redux/PushInboxReducers/PushCounterAction';
import {moderateScale} from 'react-native-size-matters';

export const Password = () => {
  const navigation = useNavigation();
  const {appTheme} = useContext(AppContext);
  const [isDark, setDark] = useState(appTheme.type === 'dark');
  useEffect(() => {
    setDark(appTheme.type === 'dark');
  }, [appTheme.type]);

  const [generateCustomerToken, {loading, error, data}] = getToken();

  const {
    getCustomer,
    data: customerData,
    loading: customerLoading,
    error: customerError,
  } = useCustomer();
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);

  const global_data = useSelector((state: any) => state.commonReducer);
  const dispatch = useDispatch();
  const passwordTextUpdate = value => {
    setPassword(value);
  };
  const signIn = async () => {
    if (password == '') {
      return;
    }
    Helper.HandleVibration();

    // let lat = 0;
    // let long = 0;
    const hasPermission = PermissionHandler.hasLocationPermission();
    if (await hasPermission) {
      PermissionHandler.getCurrentLatLong();
    }

    const lat = Number(await getItemFromStorage('latitude'));
    const long = Number(await getItemFromStorage('longitude'));

    //    console.log( lat, ' -- loc  -- ', long )

    generateCustomerToken({
      variables: {
        email: global_data.email,
        password: password,
        fcmToken: global_data.fcm_token,
        device_id: Helper.getUniqueId(),
        latitude: lat,
        longitude: long,
      },
    });
  };
  useEffect(() => {
    if (error) {
      console.log('======error===============');
      console.log(error);
      Helper.ShowAlert(`${error}`);
    } else if (customerError) {
      console.log('======customerError===============');
      console.log(customerError);
      Helper.ShowAlert(`${customerError}`);
    }
  }, [error, customerError]);

  useEffect(() => {
    if (data) {
      console.log('data');
      console.log(data);
      dispatch({
        type: GLOBAL_DATA,
        payload: {token: data.generateCustomerToken.token},
      });
      dispatch(_PUSH_COUNTER_CHECK(false, global_data.email, 0, 'clear'));
      setTimeout(function () {
        getCustomer();
      }, 1000);
    }
  }, [data]);

  useEffect(() => {
    if (customerData) {
      //getCart()
      console.log('customerData');
      console.log(customerData);
      AnalyticsEvent(TrackEvents.login_user, {
        userid: customerData.customer.id,
      });

      dispatch({
        type: GLOBAL_DATA,
        payload: {
          Fname: customerData.customer.firstName,
          Lname: customerData.customer.lastName,
          wishListId: customerData.customer.wishlist.id,
          is_phone_verified: customerData.customer.is_phone_verified,
          phone: customerData.customer.phone,
          customerData: customerData.customer,
        },
      });

      let mob: String = customerData.customer.phone;
      let phone_pincode: String = customerData.customer.phone_pincode;
      // customerData.customer.is_phone_verified ? navigation.reset({ index: 1, routes: [{ name: Routes.APPSCREENS },], key: null }) : navigation.navigate(Routes.MOBILEVERIFICATION, { mobile: mob })
      if (customerData.customerCart.items.length <= 0) {
        dispatch(CartItemCounterAction(false));
      } else {
        dispatch(CartItemCounterAction(true));
      }
      customerData.customer.phone == null
        ? navigation.navigate(Routes.NAVIGATION_TO_CHANGEMOBILE, {
            mobile: '',
            phone_pincode: '+58',
            isnew: false,
          })
        : customerData.customer.is_phone_verified
        ? navigation.reset({
            index: 1,
            routes: [{name: Routes.APPSCREENS}],
            key: null,
          })
        : navigation.navigate(Routes.NAVIGATION_TO_CHANGEMOBILE, {
            mobile: mob,
            phone_pincode: phone_pincode,
            isnew: false,
          });
    }
  }, [customerData]);

  return (
    <Layout>
      <View
        style={[
          commonStyle.unAuth_MainContainer,
          {backgroundColor: appTheme.background},
        ]}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={[commonStyle.flex_1]}>
            <Text
              style={[
                commonStyle.h2,
                commonStyle.fontBold,
                commonStyle.marginBottom_30,
                {marginTop: 65, color: appTheme.text},
              ]}>
              {translate('pre_login.lbl_password')}
            </Text>
            <CustomInput
              onChangeText={value => passwordTextUpdate(value)}
              placeholder="pre_login.lbl_password"
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

            <View style={{marginTop: moderateScale(16)}}>
              <CustomButton
                title="pre_login.lbl_sign_in"
                onPress={signIn}
                customButtonStyle={[
                  password == ''
                    ? (commonStyle.btn_disabled,
                      isDark
                        ? {backgroundColor: ResColor.a1E1E1E}
                        : commonStyle.btn_disabled)
                    : commonStyle.btn_primary,
                ]}
                customTitleStyle={[
                  password == '' ? {color: ResColor.a3E3E3E} : null,
                ]}
              />
            </View>

            <TouchableHighlight
              style={{marginTop: moderateScale(35)}}
              onPress={() => {
                Helper.HandleVibration();
                navigation.navigate(Routes.NAVIGATION_TO_FORGOTPASSWORD, {
                  email: global_data.email,
                });
              }}
              underlayColor={ResColor.transparent}>
              <Text
                style={[
                  commonStyle.h5,
                  commonStyle.fontBold,
                  styles.ForgotPassword_text,
                ]}>
                {translate('pre_login.lbl_forgot_password')}
              </Text>
            </TouchableHighlight>

            <CustomPBar showProgress={loading || customerLoading} />
          </View>
        </TouchableWithoutFeedback>
      </View>
    </Layout>
  );
};
const styles = StyleSheet.create({
  ForgotPassword_text: {color: ResColor.Gray, textAlign: 'center'},
});
