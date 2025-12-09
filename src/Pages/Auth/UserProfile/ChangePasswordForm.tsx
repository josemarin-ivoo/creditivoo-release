import {useNavigation} from '@react-navigation/native';
import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
  Platform,
  Dimensions,
  StatusBar,
} from 'react-native';
import commonStyle from '../../../../commonStyle';
import {CustomButton} from '../../../Components/CustomButton';
import CustomInput from '../../../Components/CustomInput';
import {Layout} from '../../../Components/Layout';
import {ChangePassword} from '../../../Queries/queries';
import Toast from 'react-native-simple-toast';
import CustomPBar from '../../../Components/CustomPBar';
import {translate} from '../../../locales';
import {Icon} from 'react-native-elements';
import {Routes} from '../../../Utils/NavigationRoutes';
import {useKeyboard} from '../../../Utils/KeybooardCustom';
import Helper from '../../../Utils/Helper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import resColor from '../../../Utils/Colors';
import {AppContext} from '../../AppContext';

const ChangePasswordForm = props => {
  // const netInfo = useNetInfo();
  const navigation = useNavigation();
  // const dispatch = useDispatch();
  const [changePasswordRequest, {loading, error, data}] = ChangePassword();

  const [currentPassword, setCurrentPassword] = useState(null);
  const [newPassword, setNewPassword] = useState(null);
  const [confrimPassword, setConfrimPassword] = useState(null);

  const [secureCurrentPassword, setSecureCurrentPassword] = useState(true);
  const [secureNewPassword, setSecureNewPassword] = useState(true);
  const [secureConfrimPassword, setSecureConfrimPassword] = useState(true);

  const [btn_enable, setBtnEnable] = useState(false);

  const submitForm = () => {
    Helper.HandleVibration();
    if (!btn_enable) return;

    if (newPassword != confrimPassword) {
      Helper.ShowAlert(
        translate('changepassword_form.confirm_password_not_match'),
      );
      return;
    }
    try {
      changePasswordRequest({
        variables: {
          currentPassword: currentPassword,
          newPassword: newPassword,
        },
      });
    } catch (exception) {
      console.log(exception);
      // Toast.show('Something Went Wrong. Please try again')
      Toast.show(translate('contactus_form.msg_error'));
    }
  };

  useEffect(() => {
    error && Helper.ShowAlert(`${error}`);
  }, [error]);

  useEffect(() => {
    if (data && data.changeCustomerPassword.email) {
      Toast.show(translate('changepassword_form.success_message'));
      navigation.navigate(Routes.NAVIGATION_TO_USERPROFILE); //"UserProfile")
    }
  }, [data]);

  useEffect(() => {
    checkAll();
  }, [currentPassword, newPassword, confrimPassword]);

  const checkAll = () => {
    if (currentPassword && newPassword && confrimPassword) {
      setBtnEnable(true);
    } else {
      setBtnEnable(false);
    }
  };
  const screenHeight = Dimensions.get('window').height;
  const didShow = height => {
    setViewHeight(screenHeight - height);
  };

  const didHide = () => {
    setViewHeight(screenHeight);
  };

  const [keyboardHeigth] = useKeyboard(
    didShow,
    didHide,
  ); /* initialize the hook (optional parameters) */
  const {appTheme} = useContext(AppContext);
  const [isDark, setDark] = useState(appTheme.type === 'dark');
  useEffect(() => {
    setDark(appTheme.type === 'dark');
  }, [appTheme.type]);

  const [viewHeight, setViewHeight] =
    useState(screenHeight); /* for example with didShow and didHide */
  const insets = useSafeAreaInsets();

  return (
    <Layout>
      <StatusBar
        translucent={true}
        backgroundColor={resColor.transparent}
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />
      <View
        style={{paddingBottom: 18, paddingLeft: 18, paddingRight: 18, flex: 1}}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{flex: 1}}>
            <View
              style={{
                flex: 1,
                marginBottom: keyboardHeigth == 0 ? 8 : keyboardHeigth - 50,
              }}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                  commonStyle.wrapper,
                  {
                    paddingTop: Platform.OS === 'ios' ? insets.top + 40 : 70,
                    paddingBottom: insets.bottom,
                    backgroundColor: appTheme.background,
                  },
                ]}
                keyboardShouldPersistTaps="handled">
                <Text
                  style={[
                    commonStyle.h2,
                    commonStyle.fontBold,
                    {color: appTheme.text},
                  ]}>
                  {translate('changepassword_form.lbl_heading')}
                </Text>
                <View style={{marginTop: 20}}>
                  <View style={commonStyle.marginBottom_24}>
                    <CustomInput
                      autoFocus={true}
                      labelText="changepassword_form.lbl_current_password"
                      onChangeText={value => setCurrentPassword(value)}
                      placeholder="changepassword_form.placeholder_current_password"
                      secureTextEntry={secureCurrentPassword}
                      rightIcon={
                        <Icon
                          name={!secureCurrentPassword ? 'eye' : 'eye-slash'}
                          size={18}
                          type="font-awesome-5"
                          color={appTheme.text}
                          onPress={() => {
                            Helper.HandleVibration();
                            setSecureCurrentPassword(!secureCurrentPassword);
                          }}
                        />
                      }
                    />
                  </View>
                  <View style={commonStyle.marginBottom_24}>
                    <CustomInput
                      labelText="changepassword_form.lbl_new_password"
                      onChangeText={value => setNewPassword(value)}
                      placeholder="changepassword_form.placeholder_new_password"
                      secureTextEntry={secureNewPassword}
                      rightIcon={
                        <Icon
                          name={!secureNewPassword ? 'eye' : 'eye-slash'}
                          size={18}
                          type="font-awesome-5"
                          color={appTheme.text}
                          onPress={() => {
                            Helper.HandleVibration();
                            setSecureNewPassword(!secureNewPassword);
                          }}
                        />
                      }
                    />
                  </View>
                  <View style={commonStyle.marginBottom_24}>
                    <CustomInput
                      labelText="changepassword_form.lbl_confirm_new_password"
                      onChangeText={value => setConfrimPassword(value)}
                      placeholder="changepassword_form.placeholder_confirm_new_password"
                      secureTextEntry={secureConfrimPassword}
                      rightIcon={
                        <Icon
                          name={!secureConfrimPassword ? 'eye' : 'eye-slash'}
                          size={18}
                          type="font-awesome-5"
                          color={appTheme.text}
                          onPress={() => {
                            Helper.HandleVibration();
                            setSecureConfrimPassword(!secureConfrimPassword);
                          }}
                        />
                      }
                    />
                  </View>
                </View>
              </ScrollView>
            </View>
            <View style={{bottom: 3, width: '100%'}}>
              <CustomButton
                title={'changepassword_form.submit_btn'}
                onPress={submitForm}
                multiline={true}
                customButtonStyle={[
                  btn_enable
                    ? commonStyle.btn_primary
                    : (commonStyle.btn_disabled,
                      isDark
                        ? {backgroundColor: resColor.a1E1E1E}
                        : commonStyle.btn_disabled),
                ]}
                customTitleStyle={[
                  btn_enable ? null : {color: resColor.a3E3E3E},
                ]}
              />
            </View>
            <CustomPBar showProgress={loading} />
          </View>
        </TouchableWithoutFeedback>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  address_container: {
    marginBottom: 34,
    marginTop: 24,
    flexDirection: 'row',
    width: 246,
    alignContent: 'flex-start',
    justifyContent: 'space-between',
  },

  type_container: {
    flexDirection: 'column',
    alignItems: 'center',
  },

  address_type: {
    height: 80,
    aspectRatio: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  type_icon: {
    height: 24,
    aspectRatio: 1,
    resizeMode: 'stretch',
  },

  btn_submit: {
    fontWeight: '600',
    color: 'white',
  },
  type_text_enable: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
    fontWeight: '600',
    marginTop: 4,
    color: resColor.Green,
  },

  type_text_disable: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
    marginTop: 4,
    color: resColor.Gray,
  },
  text_header: {
    marginTop: 8,
  },
  message_input: {
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: resColor.SmokeWhite,
    fontSize: 16,
    lineHeight: 24,
    paddingHorizontal: 16,
    marginBottom: 26,
  },
});

export default ChangePasswordForm;
