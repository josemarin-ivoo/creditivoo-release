import {useNavigation, StackActions} from '@react-navigation/native';
import React, {useContext, useEffect, useState} from 'react';
import {StatusBar, StyleSheet, Text, View} from 'react-native';
import {Image} from 'react-native-elements';
import {useSelector, useDispatch} from 'react-redux';
import commonStyle from '../../../commonStyle';
import {CustomButton} from '../../Components/CustomButton';
import {translate} from '../../locales';
import {GLOBAL_DATA} from '../../redux/actionTypes';
import imgs from '../../Utils/Image';
import {Routes} from '../../Utils/NavigationRoutes';
import ProgressiveImage from '../../Components/ProgressiveImage';
import Helper from '../../Utils/Helper';
import {useTheme} from '../../Utils/ThemeProvider';
import Colors from '../../Utils/Colors';
import {AppContext} from '../AppContext';

export const AccountSuccess = () => {
  const navigation = useNavigation();
  const {appTheme} = useContext(AppContext);
  const [isDark, setDark] = useState(appTheme.type === 'dark');
  useEffect(() => {
    setDark(appTheme.type === 'dark');
  }, [appTheme.type]);

  const goToHome = () => {
    Helper.HandleVibration();
    navigation.dispatch(StackActions.replace(Routes.APPSCREENS));
  };

  return (
    <View
      style={[styles.MainContainer, {backgroundColor: appTheme.background}]}>
      <StatusBar
        translucent={true}
        backgroundColor={Colors.transparent}
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />
      <ProgressiveImage
        source={imgs.ic_account_success}
        style={[commonStyle.he_wi_240]}
        color={Colors.greenBackground}
        resizeMode="stretch"
      />
      <Text
        style={[
          commonStyle.h2,
          commonStyle.fontBold,
          styles.acc_createText,
          {color: appTheme.text},
        ]}>
        {translate('pre_login.lbl_account_created')}
      </Text>
      <Text
        style={[
          commonStyle.h5,
          styles.registration_Text,
          {color: appTheme.text},
        ]}>
        {translate('pre_login.lbl_thank_you_for_registration')}
      </Text>
      <View style={styles.btnontainer}>
        <CustomButton
          title="pre_login.lbl_explore_app"
          onPress={goToHome}
          customButtonStyle={[commonStyle.btn_primary]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  MainContainer: {
    padding: 24,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  acc_createText: {textAlign: 'center', marginTop: 30, marginBottom: 16},
  registration_Text: {textAlign: 'center', marginBottom: 50},
  btnontainer: {
    position: 'absolute',
    bottom: 25,
    marginBottom: 16,
    width: '100%',
  },
});
