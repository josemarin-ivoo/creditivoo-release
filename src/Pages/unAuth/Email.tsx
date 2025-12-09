import {useNavigation} from '@react-navigation/native';
import React, {useContext, useEffect, useState} from 'react';
import {Text, TouchableWithoutFeedback, Keyboard, View} from 'react-native';
import commonStyle from '../../../commonStyle';
import {CustomButton} from '../../Components/CustomButton';
import CustomInput from '../../Components/CustomInput';
import {Layout} from '../../Components/Layout';
import Toast from 'react-native-simple-toast';
import {useLazyQuery} from '@apollo/client';
import {emailValidate, sendLocationToServer} from '../../Queries/queries';
import {useDispatch, useSelector} from 'react-redux';
import {GLOBAL_DATA} from '../../redux/actionTypes';
import CustomPBar from '../../Components/CustomPBar';
import {translate} from '../../locales';
import {Routes} from '../../Utils/NavigationRoutes';
import Helper from '../../Utils/Helper';
import {cartDelete} from '../../redux/cartAction';

import colorResource from '../../Utils/Colors';
import {AppContext} from '../AppContext';
//import { Clear_CARTITEMS } from '../../redux/CartCacheReducer/CartCacheAction';
import {ClearCHECKOUT} from '../../redux/CheckoutCacheReducer/CheckoutCacheAction';
import {DELETE_DATETIMESLOT} from '../../redux/DateTimeSlotReducers/DateTimeSlotAction';
import {DELETE_PAYMETHODS} from '../../redux/PaymentMethodsReducers/PaymentMethodsAction';
import {
  getItemFromStorage,
  getObjectFromStore,
  removeStoreItem,
  setItemInStorage,
  setObjectInStore,
} from '../../Utils/Storage';
import {moderateScale} from 'react-native-size-matters';
import PermissionHandler from '../../Utils/PermissionHandler';

export const Email = () => {
  const {appTheme} = useContext(AppContext);
  const [isDark, setDark] = useState(appTheme.type === 'dark');
  useEffect(() => {
    setDark(appTheme.type === 'dark');
  }, [appTheme.type]);
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [finalEmail, setFinalEmail] = useState('');

  const dispatch = useDispatch();
  const global_data = useSelector((state: any) => state.commonReducer);
  // dispatch({ type: DELETE_DATA });
  const [
    saveLocation,
    {loading: locationLoading, error: locationError, data: locationData},
  ] = sendLocationToServer();

  const [validateEmail, {loading, error, data}] = useLazyQuery(emailValidate, {
    variables: {email: finalEmail},
  });

  const emailTextUpdate = value => {
    setEmail(value.trim());
  };
  useEffect(() => {
    if (data) {
      // console.log(data);
      dispatch({type: GLOBAL_DATA, payload: {email: finalEmail}});

      !data.isEmailAvailable.is_email_available
        ? navigation.navigate(Routes.NAVIGATION_TO_PASSWORD)
        : navigation.navigate(Routes.NAVIGATION_TO_ACCOUNTSIGNUP);
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      error && Helper.ShowAlert(`${error}`);
    }
  }, [error]);

  const next = async () => {
    if (email == '') {
      return;
    }

    Helper.HandleVibration();

    if (Helper.validateEmail(email)) {
      dispatch(cartDelete());
      // dispatch(Clear_CARTITEMS());
      dispatch(ClearCHECKOUT());
      dispatch(DELETE_DATETIMESLOT());
      dispatch(DELETE_PAYMETHODS());

      removeStoreItem('CartCacheStatus_customerCart');
      setItemInStorage('CartCacheStatus_isUpdated', '0');
      setItemInStorage('CartCacheStatus_expTime', new Date().toString());

      setFinalEmail(email);
      validateEmail({variables: {email: email}});

      global_data.token ? await handleLOCATIONPermission() : null;
    } else {
      Toast.show(translate('email.msg_email_valid'));
    }
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
            'signin',
            data.city,
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
              const locationData = {
                latitude: await getItemFromStorage('lat'),
                longitude: await getItemFromStorage('lng'),
                lastLocDate: new Date(nowDT.toString()),
                city: await getItemFromStorage('cityNameVal'),
              };
              await setObjectInStore('locationData', locationData);
              console.log(
                'Time diff between dates is ------>>',
                differenceMinutes,
              );
              await sendLocationDataToServer(
                data.latitude,
                data.longitude,
                'signin',
                data.city,
                'true',
              );
            } else {
              console.log('No need to sync the data to the server');
            }
          }
        }
      }
    }, 5000);
  };

  return (
    <Layout>
      <>
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
                {translate('pre_login.lbl_fill_email')}
              </Text>
              <CustomInput
                onChangeText={value => emailTextUpdate(value)}
                keyboardType="email-address"
                placeholder="pre_login.lbl_email_address"
                autoCapitalize="none"
              />

              <View style={{marginTop: moderateScale(16)}}>
                <CustomButton
                  title="pre_login.lbl_Continue"
                  // disabled={email == '' ? true : false}
                  onPress={next}
                  // customButtonStyle={[
                  //   email == ''
                  //     ? commonStyle.btn_disabled
                  //     : commonStyle.btn_primary,
                  // ]}
                  customButtonStyle={[
                    email == ''
                      ? (commonStyle.btn_disabled,
                        isDark
                          ? {backgroundColor: colorResource.a1E1E1E}
                          : commonStyle.btn_disabled)
                      : commonStyle.btn_primary,
                  ]}
                  customTitleStyle={[
                    email == '' ? {color: colorResource.a3E3E3E} : null,
                  ]}
                />
              </View>
              <CustomPBar showProgress={loading} />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </>
    </Layout>
  );
};
