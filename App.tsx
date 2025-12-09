import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Platform} from 'react-native';
import 'react-native-gesture-handler';
import {Provider} from 'react-redux';
import store from './src/redux/store';
import {PersistGate} from 'redux-persist/integration/react';
import {persistStore} from 'redux-persist';
const persistedStore = persistStore(store);
import Route from './Route';
import {ApolloClient, ApolloProvider} from '@apollo/client';
import {getApolloClient} from './src/Queries/client';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import messaging from '@react-native-firebase/messaging';
import {GLOBAL_DATA, ORDER_NOTIFICATION} from './src/redux/actionTypes';
import PushNotification from 'react-native-push-notification';
export const NotifactionContext = React.createContext({});
import {Routes} from './src/Utils/NavigationRoutes';
import {navigate} from './src/Utils/NavigationRef';
import {AppContextProvider} from './src/Pages/AppContext';
import {Settings} from 'react-native-fbsdk-next';
import {PERMISSIONS, RESULTS, request, check} from 'react-native-permissions';

import Colors from './src/Utils/Colors';
import {
  PUSH_COUNTER_DATAAdd,
  _PUSH_COUNTER_CHECK,
} from './src/redux/PushInboxReducers/PushCounterAction';

const App = () => {
  const [client, setClient] = useState<ApolloClient<any>>();
  const [fcmToken, setfcmToken] = useState('');
  let fcmMessage = '';

  PushNotification.createChannel(
    {
      channelId: 'ivoo001', // (required)
      channelName: 'IVOO_notification', // (required)
      channelDescription: undefined, // (optional) default: undefined.
      playSound: true, // (optional) default: true
      soundName: 'default', // (optional) See `soundName` parameter of `localNotification` function
      importance: 1, // (optional) default: Importance.HIGH. Int value of the Android notification importance
      vibrate: true,
    },
    created => console.log(`createChannel returned '${created}'`), // (optional) callback returns whether the channel was created, false means it already existed.
  );

  useEffect(() => {
    getApolloClient()
      .then(setClient)
      .catch(e => {});
  }, []);

  useEffect(() => {
    if (fcmToken) {
      store.dispatch({type: GLOBAL_DATA, payload: {fcm_token: fcmToken}});
    }
  }, [fcmToken]);

  async function initPixel() {
    if (Platform.OS === 'ios') {
      const ATT_CHECK = await check(PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY);
      console.log('ATT_CHECK');
      console.log(ATT_CHECK);

      if (ATT_CHECK === RESULTS.DENIED) {
        try {
          const ATT = await request(PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY);
          if (ATT === RESULTS.GRANTED) {
            Settings.setAdvertiserTrackingEnabled(true).then(() => {
              Settings.initializeSDK();
            });
          }
        } catch (error) {
          throw error;
        } finally {
          Settings.initializeSDK();
        }
        Settings.initializeSDK();
        Settings.setAdvertiserTrackingEnabled(true);
      }
    } else {
      Settings.initializeSDK();
      Settings.setAdvertiserTrackingEnabled(true);
    }
  }

  useEffect(() => {
    initPixel();

    PushNotification.configure({
      onRegister: function (token) {
        console.log(
          '**************************: onRegister :***************************',
        );
        console.log('TOKEN:', token);
        setfcmToken(fcmToken => token.token);
      },

      // (required) Called when a remote is received or opened, or local notification is opened
      onNotification: function (notification) {
        notification.finish(PushNotificationIOS.FetchResult.NoData);

        if (notification.userInteraction === true) {
          //console.log( "************************ : onNotification : userInteraction : *****************************" );

          if ('data' in notification.data) {
            const customData = JSON.parse(notification.data.data);
            navigate(Routes.NAVIGATION_TO_ORDERHISTORYDETAIL, {
              id: customData.increment_id,
            });
          } else {
            console.log('* ** : Opened : *** **');
            console.log(notification);

            'title' in notification.data == true &&
              'body' in notification.data == true &&
              ManagePushNotification(
                JSON.parse(
                  `{"messageId":${Math.random()},"notification":{"body":"${
                    notification.data.body
                  }","title":"${
                    notification.data.title
                  }","data":{},"android":{}}}`,
                ),
                true,
              );
          }
        } else {
          if (notification.data.type == 'order-status-updated') {
            //console.log( "order-status-updated --> ", JSON.stringify( notification.data.data ) );
            store.dispatch({
              type: ORDER_NOTIFICATION,
              payload: notification.data.data,
            });
          }
        }
      },

      onAction: function (notification) {
        console.log(
          '*************************: onAction :****************************',
        );
        console.log('ACTION:', notification.action);
        console.log('NOTIFICATION:', notification);
      },

      // IOS ONLY (optional): default: all - Permissions to register.
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: true,
    });

    const unsubscribe = messaging().onMessage(async (remoteMessage: any) => {
      if (remoteMessage) {
        if (Platform.OS === 'ios' && remoteMessage.notification.title != null) {
          PushNotificationIOS.addNotificationRequest({
            id: Math.random().toString(),
            title: remoteMessage.notification.title,
            body: remoteMessage.notification.body,
            userInfo: remoteMessage.data,
          });
        } else {
          PushNotification.localNotification({
            channelId: 'ivoo001',
            autoCancel: true,
            title: remoteMessage.notification.title,
            message: remoteMessage.notification.body,
            vibrate: true,
            vibration: 300,
            color: Colors.Green,
            playSound: true,
            soundName: 'default',
            largeIcon: 'ic_launcher',
            smallIcon: 'ic_notification',
            bigLargeIcon: 'ic_notification',
            userInfo: remoteMessage.data,
            largeIconUrl:
              Platform.OS == 'android'
                ? remoteMessage.notification.android.imageUrl
                : remoteMessage.data.fcm_options.image,
            // bigPictureUrl: "https://www.starhub.com/content/dam/starhub/2015/mobile/prepaid-plan/Prepaid-Sim-cards/Sim-card-face-2015/18-topup-card.jpg",
            picture:
              Platform.OS == 'android'
                ? remoteMessage.notification.android.imageUrl
                : remoteMessage.data.fcm_options.image,
            ignoreInForeground: false,
          });
        }
        console.log(
          '*************************: remoteMessage :****************************',
        );
        ManagePushNotification(remoteMessage, false);
      }
    });
    return unsubscribe;
  }, []);

  const ManagePushNotification = async (remoteMessage: any, isOpened: any) => {
    console.log('ManagePushNotification');
    console.log(JSON.stringify(remoteMessage));

    if ('notification' in remoteMessage) {
      if (
        store.getState().commonReducer.token &&
        'title' in remoteMessage.notification
      ) {
        const now = new Date();
        store.dispatch(
          PUSH_COUNTER_DATAAdd({
            received_at: now.toISOString(),
            token: store.getState().commonReducer.email,
            remoteMessage,
          }),
        );
        store.dispatch(
          _PUSH_COUNTER_CHECK(
            true,
            store.getState().commonReducer.email,
            0,
            'add',
          ),
        );
      }
    }
  };

  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('********** In the background! *************');

    ManagePushNotification(remoteMessage, false);
  });

  if (client) {
    return (
      <ApolloProvider client={client}>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistedStore}>
            <NotifactionContext.Provider value={fcmMessage}>
              <AppContextProvider>
                <Route />
              </AppContextProvider>
            </NotifactionContext.Provider>
          </PersistGate>
        </Provider>
      </ApolloProvider>
    );
  }

  return <ActivityIndicator size="large" />;
};

export default App;
