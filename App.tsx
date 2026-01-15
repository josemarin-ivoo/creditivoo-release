import React, {useEffect} from 'react';
import {LogBox, StatusBar, StyleSheet, View} from 'react-native';
import 'react-native-gesture-handler';
import SplashScreen from 'react-native-splash-screen';
import {ToastProvider} from 'react-native-toast-notifications';
import {Provider} from 'react-redux';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';
import {palette} from '@theme/themes';
import TextWrapper from '@shared-components/text-wrapper/TextWrapper';
import Navigation from './src/navigation';
import {store} from './src/store/store';
import {updateAuth, logout} from './src/store/slices/auth-slice';
import {ivooStore} from './src/ivoo/store';
import {loadAuth as loadIvoAuth} from './src/ivoo/store/slices/auth-slice';
import {AuthStorage} from '@app-services/AuthStorage';
import {COLORS} from './src/app/styles/global.style';
import {ApplicationProvider, IconRegistry} from '@ui-kitten/components';
import {EvaIconsPack} from '@ui-kitten/eva-icons';
import * as eva from '@eva-design/eva';
import customMapping from './src/shared/theme/custom-mapping.json';
import {customTheme} from './src/shared/theme/custom-theme';

LogBox.ignoreAllLogs();

const App = () => {
  const {dispatch} = store;
  const ivoDispatch = ivooStore.dispatch;

  useEffect(() => {
    // Hide SplashScreen after a delay
    setTimeout(() => {
      SplashScreen.hide();
    }, 500);
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = await AuthStorage.getToken();
        const user = await AuthStorage.getUser();

        if (token && user) {
          dispatch(updateAuth({token, user}));
        } else {
          dispatch(logout());
        }
      } catch (error) {
        console.error('Error during authentication initialization:', error);
        dispatch(logout());
      }
    };

    // Firebase deshabilitado - no se está usando
    // const setupFirebaseMessaging = async () => {
    //   try {
    //     const messaging = require('@react-native-firebase/messaging').default;
    //     
    //     // Set up foreground message handler
    //     messaging().onMessage(async remoteMessage => {
    //       // Handle foreground messages
    //       console.log('Foreground message received:', remoteMessage);
    //     });

    //     // Set up token refresh handler
    //     messaging().onTokenRefresh(async (fcmToken) => {
    //       // Handle token refresh
    //       console.log('FCM token refreshed:', fcmToken);
    //     });
    //   } catch (error) {
    //     console.warn('Firebase messaging setup error:', error);
    //   }
    // };

    // Initialize ivoo auth store
    ivoDispatch(loadIvoAuth());

    // Initialize main auth store
    initializeAuth();

    // Firebase deshabilitado
    // setTimeout(() => {
    //   setupFirebaseMessaging();
    // }, 1000);
  }, [dispatch, ivoDispatch]);

  return (
    <>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider
        {...eva}
        customMapping={customMapping as any}
        theme={customTheme}>
        <Provider store={store}>
          <Provider store={ivooStore}>
            <StatusBar backgroundColor="#ffffff" translucent={false} />
            <ToastProvider
              placement="top"
              offsetTop={36}
              offset={10}
              renderType={{
                custom_error: toast => (
                  <View style={styles.toastContainer}>
                    <Icon
                      type={IconType.MaterialIcons}
                      name="error-outline"
                      color={palette.error}
                      size={20}
                    />
                    <View>
                      <TextWrapper
                        fontSize={14}
                        boldSora
                        color={palette.totalBlack}>
                        {toast.data.title}
                      </TextWrapper>
                      <TextWrapper fontSize={10} color={palette.totalBlack}>
                        {toast.message}
                      </TextWrapper>
                    </View>
                  </View>
                ),
              }}>
              <Navigation />
            </ToastProvider>
          </Provider>
        </Provider>
      </ApplicationProvider>
    </>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    maxWidth: '85%',
    paddingRight: 40,
    paddingLeft: 10,
    paddingVertical: 10,
    backgroundColor: '#fff',
    marginVertical: 4,
    borderRadius: 8,
    borderLeftWidth: 6,
    elevation: 3,
    shadowColor: '#171717',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
});

export default App;
