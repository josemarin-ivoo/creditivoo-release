import {useNavigation, StackActions} from '@react-navigation/native';
import React, {useContext, useEffect, useRef} from 'react';
import {tokenFound} from '../Services/service';
import Video from 'react-native-video';
import videofile from '../Utils/Image';
import commonStyle from '../../commonStyle';
import {Routes} from '../Utils/NavigationRoutes';
import {LaunchService} from '../Services/LaunchService';
import {useLazyQuery, useQuery} from '@apollo/client';
import {useDispatch, useSelector} from 'react-redux';
import {DELETE_DATA, storeConfig as storeConfig1} from '../redux/actionTypes';
import {getLocationConfig, storeConfig} from '../Queries/queries';
import {
  StatusBar,
  AppState,
  View,
  ImageBackground,
  Platform,
} from 'react-native';
import Colors from '../Utils/Colors';
import {AppContext} from './AppContext';
import PermissionHandler from '../Utils/PermissionHandler';
import Helper from './../Utils/Helper';
import {getItemFromStorage} from '../Utils/Storage';
import {setItemInStorage} from './../Utils/Storage';
import BackgroundTimer from 'react-native-background-timer';
import {syncCustomerInfo, userCartId} from './../Queries/queries';
import {cartAction} from './../redux/cartAction';
import {CartItemCounterAction} from '../redux/cartItemCounterAction';
import moment from 'moment';
import SystemNavigationBar from 'react-native-system-navigation-bar';

import ResImage from '../Utils/Image';

export const Splash = () => {
  const navigation = useNavigation();

  const global_data = useSelector((state: any) => state.commonReducer);
  const {data: data} = useQuery(storeConfig);
  const dispatch = useDispatch();

  const {appTheme} = useContext(AppContext);
  const appState = useRef(AppState.currentState);
  const [syncDatatoFirestore] = syncCustomerInfo();

  const [GetUsercartId, {data: userCartIdData}] = useLazyQuery(userCartId);
  const [GetLocationConfigValue, {data: getLocationConfigData}] =
    useLazyQuery(getLocationConfig);

  const currentDate = moment(new Date());
  const futureDateString = '2023-11-20T12:00:00'; // Replace this with your future date
  const futureDate = moment(futureDateString).toDate();

  // Check and update users last seen lat long to save data in Firestore.
  const SyncFirestoreData = async syncTimeInterval => {
    if (global_data.token) {
      // && Helper.env !== 'dev'

      // Fire store sync check at every 4 hours
      // Sync data to Firestore chagned to every 5 min on Date: 06-09-2021
      const nowDT = new Date();
      const LastseenTimeStr = await getItemFromStorage('LastseenTime');
      const LastseenTime = new Date(LastseenTimeStr);

      var seconds = Math.floor(
        (nowDT.getTime() - LastseenTime.getTime()) / 1000,
      );
      // var h = Math.floor( seconds / 3600 );
      // var m = Math.floor( seconds % 3600 / 60 );
      var m = Math.floor(seconds / 60);

      if (m >= syncTimeInterval) {
        setItemInStorage('LastseenTime', nowDT.toISOString());

        // Call API here to store firestore
        const hasPermission = PermissionHandler.hasLocationPermission();
        if (await hasPermission) {
          PermissionHandler.getCurrentLatLong();
        }
        const lat = Number(await getItemFromStorage('latitude'));
        const long = Number(await getItemFromStorage('longitude'));

        global_data.token &&
          Helper.env !== 'dev' &&
          syncDatatoFirestore({
            variables: {
              device_id: Helper.getUniqueId(),
              latitude: lat,
              longitude: long,
            },
          });
      }
    }
  };

  useEffect(() => {
    GetUsercartId();
    GetLocationConfigValue();
    BackgroundTimer.stopBackgroundTimer();

    BackgroundTimer.runBackgroundTimer(() => {
      //code that will be called every 3 seconds
      SyncFirestoreData(5);
    }, 5 * 60 * 1000); // 5 Minutes

    AppState.addEventListener('change', handleAppStateChange);
  }, []);

  useEffect(() => {
    if (userCartIdData) {
      dispatch(cartAction(userCartIdData.customerCart.id));
    }
  }, [userCartIdData]);

  useEffect(() => {
    if (getLocationConfigData) {
      //Location config data value ----->> {"locationConfig": {"__typename": "LocationConfigOutput", "distance": "10", "time": "1440"}}
      //dispatch(cartAction(userCartIdData.customerCart.id));
      console.log(
        'Location config data value ----->>',
        getLocationConfigData.locationConfig.distance,
        getLocationConfigData.locationConfig.time,
      );
      saveLocationConfigDataToLocal(getLocationConfigData);
    }
  }, [getLocationConfigData]);

  const saveLocationConfigDataToLocal = async getLocationConfigData => {
    await setItemInStorage(
      'minLocationDistance',
      getLocationConfigData.locationConfig.distance,
    );
    await setItemInStorage(
      'minLocationTime',
      getLocationConfigData.locationConfig.time,
    );
  };

  const handleAppStateChange = async nextAppState => {
    BackgroundTimer.stopBackgroundTimer();

    if (nextAppState === 'background') {
      BackgroundTimer.runBackgroundTimer(() => {
        SyncFirestoreData(480);
      }, 8 * 60 * 60 * 1000); //8 Hours
    } else {
      BackgroundTimer.runBackgroundTimer(() => {
        SyncFirestoreData(5);
      }, 5 * 60 * 1000); // 5 Minutes
    }

    appState.current = nextAppState;
  };

  useEffect(() => {
    if (data) {
      var uniqueId = Helper.getUniqueId();
      console.log('Store Config --- ', uniqueId);
      dispatch({type: storeConfig1, payload: {storeConfig: data}});
      LaunchService(CheckLaunch);
    }
  }, [data]);

  const CheckLaunch = async flag => {
    flag ? PermissionHandler.hasLocationPermission() : null;
    console.log('Token Found for Intro Page ' + flag);
    const now = new Date();

    setItemInStorage('LastseenTime', now.toISOString());
    setTimeout(() => {
      //flag
      // ? navigation.dispatch(StackActions.replace(Routes.IntroScreen))
      // :
      tokenFound(afterTokenFound);
    }, 2000);
  };

  const afterTokenFound = () => {
      SystemNavigationBar.stickyImmersive(false);
    global_data.is_phone_verified
      ? ''
      : (dispatch({type: DELETE_DATA}), dispatch(CartItemCounterAction(false)));
    // var nextRoute = global_data.is_phone_verified ? Routes.APPSCREENS : Routes.AUTHSCREENS;
    navigation.dispatch(StackActions.replace(Routes.APPSCREENS));
  };

  return (
    <>
      <StatusBar
        translucent={true}
        backgroundColor={Colors.transparent}
        barStyle={appTheme.stastuBar}
      />
      <View style={{flex: 1, justifyContent: 'center',backgroundColor:'black'}}>
        <Video
            source={
              Platform.OS === 'ios'
                  ? videofile.vd_splash_screen_ios
                  : videofile.vd_splash_screen_android
              // currentDate.isAfter(futureDate)
              //   ? videofile.vd_splash
              //   : videofile.vd_splash_celebration
            }
            style={[
              {
                height: '100%',
                width: '100%',
                alignContent: 'center',
                alignItems: 'center',
                alignSelf: 'center',
              },
            ]}
            controls={false}
            resizeMode="contain"
        />

        {/*<ImageBackground*/}
        {/*  source={ResImage.video_bg}*/}
        {/*  style={{flex: 1, width: '100%', height: '100%', alignSelf: 'center'}}>*/}
        {/* */}
        {/*</ImageBackground>*/}
      </View>
    </>
  );
};
