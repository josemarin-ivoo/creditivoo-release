import {useNavigation, StackActions} from '@react-navigation/native';
import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  TextInput,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import commonStyle from '../../../../commonStyle';
import {CustomButton} from '../../../Components/CustomButton';
import CustomInput from '../../../Components/CustomInput';
import {Layout} from '../../../Components/Layout';
import {ContactUs} from '../../../Queries/queries';
import Toast from 'react-native-simple-toast';
import CustomPBar from '../../../Components/CustomPBar';
import {translate} from '../../../locales';
import {Routes} from '../../../Utils/NavigationRoutes';
import {useKeyboard} from '../../../Utils/KeybooardCustom';
import Helper from '../../../Utils/Helper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import resColor from '../../../Utils/Colors';
import {AppContext} from '../../AppContext';

const ContactForm = props => {
  // const netInfo = useNetInfo();
  const navigation = useNavigation();
  // const dispatch = useDispatch();
  const [newRequest, {loading, error, data}] = ContactUs();

  const [name, setName] = useState(null);
  const [email, setEmail] = useState(null);
  const [subject, setSubject] = useState(null);
  const [message, setMessage] = useState('');
  const [btn_enable, setBtnEnable] = useState(false);

  const submitForm = () => {
    Helper.HandleVibration();
    if (!btn_enable) return;
    try {
      newRequest({
        variables: {
          name: name,
          email: email,
          message: message,
          subject: subject,
        },
      });
    } catch (exception) {
      Toast.show(translate('contactus_form.msg_error'));
      // Toast.show('Something Went Wrong. Please try again')
    }
  };

  useEffect(() => {
    error && Helper.ShowAlert(`${error}`);
  }, [error]);

  if (data) {
    Toast.show(data.contactForm.message);
    navigation.navigate(Routes.NAVIGATION_TO_USERPROFILE); //"UserProfile")
  }

  useEffect(() => {
    checkAll();
  }, [name, email, subject, message]);

    const checkAll = () => {
        const emailRegex = /\S+@\S+\.\S+/;
        if (name && email && subject && message && emailRegex.test(email)) {
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

  const [viewHeight, setViewHeight] =
    useState(screenHeight); /* for example with didShow and didHide */
  const insets = useSafeAreaInsets();
  const {appTheme} = useContext(AppContext);
  const [isDark, setDark] = useState(appTheme.type === 'dark');
  useEffect(() => {
    setDark(appTheme.type === 'dark');
  }, [appTheme.type]);

  return (
    <Layout>
      <View
        style={{paddingBottom: 18, paddingLeft: 18, paddingRight: 18, flex: 1}}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{flex: 1}}>
            <View
              style={{
                flex: 1,
                marginBottom: keyboardHeigth == 0 ? 8 : keyboardHeigth - 100,
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
                  {translate('contactus_form.lbl_heading')}
                </Text>
                <View style={{marginTop: 20}}>
                  <CustomInput
                    labelText={'contactus_form.lbl_name'}
                    autoFocus={true}
                    onChangeText={value => setName(value)}
                    placeholder={'contactus_form.placeholder_name'}
                  />
                  <View style={commonStyle.marginBottom_24}></View>
                  <CustomInput
                    labelText={'contactus_form.lbl_email'}
                    onChangeText={value => setEmail(value)}
                    placeholder={'contactus_form.placeholder_email'}
                  />
                  <View style={commonStyle.marginBottom_24}></View>
                  <CustomInput
                    labelText={'contactus_form.lbl_subject'}
                    onChangeText={value => setSubject(value)}
                    placeholder={'contactus_form.placeholder_subject'}
                  />
                  <View style={commonStyle.marginBottom_24}></View>
                  <>
                    <Text
                      style={[
                        commonStyle.h6,
                        commonStyle.label,
                        {marginBottom: 5, color: appTheme.text},
                      ]}>
                      {translate('contactus_form.lbl_message')}
                    </Text>
                    <TextInput
                      multiline={true}
                      numberOfLines={5}
                      underlineColorAndroid={resColor.transparent}
                      style={[
                        styles.message_input,
                        {
                          backgroundColor: appTheme.InputBoxBGColor,
                          color: appTheme.text,
                        },
                      ]}
                      onChangeText={value => setMessage(value)}
                      placeholder={translate(
                        'contactus_form.placeholder_message',
                      )}
                      textAlignVertical={'top'}
                      placeholderTextColor={
                        isDark ? appTheme.text : resColor.Gray
                      }
                    />
                    <View style={commonStyle.marginBottom_24}></View>
                  </>
                </View>
              </ScrollView>
            </View>
            <View style={{bottom: 2, width: '100%'}}>
              <CustomButton
                title={'contactus_form.submit_btn'}
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

export default ContactForm;
