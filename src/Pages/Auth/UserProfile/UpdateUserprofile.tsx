import {useNavigation} from '@react-navigation/native';
import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  StatusBar,
} from 'react-native';
import {Avatar} from 'react-native-elements';
import commonStyle from '../../../../commonStyle';
import {CustomButton} from '../../../Components/CustomButton';
import CustomInput from '../../../Components/CustomInput';
import {Layout} from '../../../Components/Layout';
import {
  getCustomerProfileImage,
  updateProfileImage,
  updateUserprofile,
} from '../../../Queries/queries';
import CustomPBar from '../../../Components/CustomPBar';
import {translate} from '../../../locales';
import {useKeyboard} from '../../../Utils/KeybooardCustom';
import Helper from '../../../Utils/Helper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import resColor from '../../../Utils/Colors';
import {AppContext} from '../../AppContext';
import {Icon, Image, Input} from 'react-native-elements';
import {useSelector, useDispatch} from 'react-redux';
import {GLOBAL_DATA} from './../../../redux/actionTypes';
import {
  TouchableHighlight,
  TouchableOpacity,
} from 'react-native-gesture-handler';
import {ActionSheetCustom as ActionSheet} from '../../../Components/CustomeActionSheet/lib';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {useLazyQuery} from '@apollo/client';
import ResColors from '../../../Utils/Colors';
import PermissionHandler from '../../../Utils/PermissionHandler';
import AppConstants from "../../../Utils/AppConstants";

const UpdateUserprofile = props => {
  const actionSheetRef = useRef<ActionSheet>(null);
  const options = [
    'Tomar la foto',
    'Seleccionar imagen',
    <Text style={{color: 'red'}}>Cancelar</Text>,
  ];
  // const netInfo = useNetInfo();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [updateUserprofileAPI, {loading, error, data}] = updateUserprofile();
  const [
    updateProfileImageAPI,
    {loading: imgLoading, error: imgErr, data: imgData},
  ] = updateProfileImage();
  const [
    getCustomerProfileImageAPI,
    {loading: ProimgLoading, error: ProimgErr, data: ProimgData},
  ] = useLazyQuery(getCustomerProfileImage);

  const insets = useSafeAreaInsets();
  const [keyboardHeigth] =
    useKeyboard(); /* initialize the hook (optional parameters) */
  const {appTheme} = useContext(AppContext);
  const [response, setResponse] = useState(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [citizenId, setCitizenId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phone_pincode, setphone_pincode] = useState('+58');
  const [btn_enable, setBtnEnable] = useState(false);
  const global_data = useSelector((state: any) => state.commonReducer);
  const [profileImageURL, setProfileImageURL] = useState('');
  const submitForm = () => {
    Helper.HandleVibration();
    if (!btn_enable) return;

    updateUserprofileAPI({
      variables: {
        firstname: firstName,
        lastname: lastName,
        citizen_id: citizenId == '' ? null : citizenId,
        phone_pincode: phone_pincode,
        phone: phoneNumber,
      },
    });
  };

  useEffect(() => {
    const hasPermission = PermissionHandler.hasLocationPermission();
    if (hasPermission) {
      PermissionHandler.getCurrentLatLong();
    }
  }, []);

  useEffect(() => {
    if (error) {
      Helper.ShowAlert(`${error}`);
    } else if (imgErr) {
      Helper.ShowAlert(`${imgErr}`);
    }
  }, [error, imgErr]);

  useEffect(() => {
    if (data) {
      dispatch({
        type: GLOBAL_DATA,
        payload: {
          Fname: data.updateCustomerV2.customer.firstName,
          Lname: data.updateCustomerV2.customer.lastName,
          phone: data.updateCustomerV2.customer.phone,
          customerData: data.updateCustomerV2.customer,
        },
      });
      navigation.goBack();
    }
  }, [data]);

  useEffect(() => {
    if (imgData) {
      console.log('789');
      console.log(JSON.stringify(imgData));
      setProfileImageURL(imgData.updateProfileImage.img);
      dispatch({
        type: GLOBAL_DATA,
        payload: {profileImage: imgData.updateProfileImage.img},
      });
    }
  }, [imgData]);

  useEffect(() => {
    global_data.profileImage == '' && getCustomerProfileImageAPI();

    if (global_data.customerData != null) {
      // console.log( JSON.stringify( global_data.customerData ) )

      setFirstName(global_data.customerData.firstName);
      setLastName(global_data.customerData.lastName);
      setEmail(global_data.customerData.email);

      setphone_pincode(global_data.customerData.phone_pincode);
      setPhoneNumber(global_data.customerData.phone);
      setCitizenId(global_data.customerData.citizen_id);
    }
  }, [navigation]);

  useEffect(() => {
    if (ProimgData) {
      setProfileImageURL(ProimgData.getCustomerProfileImage.img);
      dispatch({
        type: GLOBAL_DATA,
        payload: {profileImage: ProimgData.getCustomerProfileImage.img},
      });
    }
  }, [ProimgData]);
  useEffect(() => {
    checkAll();
  }, [firstName, lastName, email, citizenId, phoneNumber, phone_pincode]);

    const checkAll = () => {
        if (
            (firstName != null && firstName.length > 0) &&
            (lastName != null && lastName.length > 0) &&
            (email != null && email.length > 0) &&
            (citizenId != null && citizenId.length >= 6) &&
            (phoneNumber != null && phoneNumber.length >= 11) &&
            (phone_pincode != null && phone_pincode === AppConstants.DEFAULT_PHONE_PINCODE)
        ) {
            setBtnEnable(true);
        } else {
            setBtnEnable(false);
        }
    };

  const processPictures = async index => {
    console.log(index);
    Helper.HandleVibration();

    switch (index) {
      case 0:
        setTimeout(() => {
          launchCamera(
            {
              saveToPhotos: false,
              mediaType: 'photo',
              includeBase64: true,
              maxHeight: 500,
              maxWidth: 500,
            },
            response => {
              console.log(response);
              if (response.didCancel) {
                console.log(' Photo picker didCancel');
              } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
              } else {
                setResponse(response);
              }
            },
          );
        }, 200);

        break;
      case 1:
        setTimeout(() => {
          launchImageLibrary(
            {
              maxWidth: 500,
              maxHeight: 500,
              // selectionLimit: adviceCount == 1 ? 1 : 2,
              mediaType: 'photo',
              includeBase64: true,
            },
            response => {
              // console.log({ response });
              if (response.didCancel) {
                console.log(' Photo picker didCancel');
              } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
              } else {
                setResponse(response);
              }
            },
          );
        }, 200);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (response !== null && 'assets' in response) {
      console.log('response');
      console.log({
        img: response.assets[0].base64,
      });

      updateProfileImageAPI({
        variables: {
          img: 'data:image/jpeg;base64,' + response.assets[0].base64,
        },
      });
    }
  }, [response]);

  return (
    <View style={{flex: 1}}>
      <View
        style={[
          styles.headerWrap,
          {top: Platform.OS === 'ios' ? insets.top : StatusBar.currentHeight},
        ]}>
        <StatusBar
          translucent={true}
          backgroundColor={ResColors.transparent}
          barStyle={appTheme.statusBar}
        />

        <TouchableHighlight
          style={[styles.ButtonViewStyles]}
          onPress={() => {
            Helper.HandleVibration();
            navigation.goBack();
          }}
          underlayColor={ResColors.transparent}>
          <Icon
            name="arrow-left"
            type="font-awesome-5"
            color={appTheme.backiconColor}
          />
        </TouchableHighlight>
      </View>
      <KeyboardAvoidingView
        behavior={'height'}
        enabled={Platform.OS === 'ios' ? false : false}
        style={[
          {
            paddingBottom: 16,
            paddingHorizontal: 24,
            flex: 1,
            backgroundColor: appTheme.background,
          },
        ]}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={[commonStyle.flex_1]}>
            <View
              style={[
                {
                  flex: 1,
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
                    paddingTop: Platform.OS === 'ios' ? insets.top + 50 : 80,
                    paddingBottom: insets.bottom + 50,
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
                  Perfil del usuario
                </Text>
                {
                  <View style={styles.imageParentContainer}>
                    <TouchableOpacity
                      style={styles.imageContainer}
                      onPress={() => {
                        actionSheetRef?.current?.show();
                      }}>
                      {global_data.profileImage != '' ? (
                        <Image
                          source={{uri: global_data.profileImage}}
                          style={[
                            styles.topimage,
                            {
                              borderWidth: 4,
                              borderColor:
                                Platform.OS == 'android'
                                  ? appTheme.placeholderTextColor
                                  : 'white',
                            },
                          ]}
                        />
                      ) : (
                        <Image
                          source={appTheme.profileimage}
                          style={[styles.topimage]}
                        />
                      )}
                      <Icon
                        name={'edit'}
                        containerStyle={styles.icon}
                        color={'white'}
                      />
                    </TouchableOpacity>
                  </View>
                }

                <View>
                  <CustomInput
                    labelText={'pre_login.lbl_first_name'}
                    value={firstName}
                    customStyle={commonStyle.marginBottom_24}
                    onChangeText={value => setFirstName(value)}
                    placeholder={'pre_login.lbl_enter_fname'}
                  />

                  <CustomInput
                    labelText={'pre_login.lbl_last_name'}
                    customStyle={commonStyle.marginBottom_24}
                    value={lastName}
                    onChangeText={value => setLastName(value)}
                    placeholder={'pre_login.lbl_enter_lname'}
                  />

                  <CustomInput
                    labelText={'pre_login.lbl_citizen_id'}
                    customStyle={commonStyle.marginBottom_24}
                    value={citizenId}
                    onChangeText={value => setCitizenId(value)}
                    placeholder={'pre_login.lbl_enter_id_number'}
                  />

                  <View style={{flex: 1, flexDirection: 'row'}}>
                    <View style={{flex: 0.25, marginEnd: 10}}>
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
                            color:
                              appTheme.type == 'dark'
                                ? appTheme.text
                                : resColor.blackShade,
                            justifyContent: 'center',
                            textAlignVertical: 'center',
                          },
                        ]}
                        containerStyle={[
                          commonStyle.input,
                          {
                            height: 48,
                            backgroundColor: appTheme.InputBoxBGColor,
                          },
                        ]}
                        inputContainerStyle={{borderColor: 'transparent'}}
                        textAlignVertical="center"
                        keyboardType="phone-pad"
                        value={phone_pincode}
                        onChangeText={value => setphone_pincode(value)}
                        placeholder={'+58'}
                        placeholderTextColor={
                          appTheme.type == 'dark'
                            ? resColor.Gray
                            : resColor.Gray
                        }
                      />
                    </View>
                    <View style={{flex: 1}}>
                      <CustomInput
                        maxLength={15}
                        labelText="pre_login.lbl_enter_phone_number"
                        onChangeText={value => setPhoneNumber(value)}
                        keyboardType="numeric"
                        value={phoneNumber}
                        placeholder="pre_login.lbl_enter_your_phone_number"
                      />
                    </View>
                  </View>
                </View>
              </ScrollView>
            </View>
            <View style={{bottom: 2, width: '100%'}}>
              <CustomButton
                title={'pre_login.lbl_submit'}
                onPress={submitForm}
                multiline={true}
                customButtonStyle={[
                  btn_enable
                    ? commonStyle.btn_primary
                    : (commonStyle.btn_disabled,
                      appTheme.type == 'dark'
                        ? {backgroundColor: resColor.a1E1E1E}
                        : commonStyle.btn_disabled),
                ]}
                customTitleStyle={[
                  btn_enable ? null : {color: resColor.a3E3E3E},
                ]}
              />
            </View>
            <CustomPBar showProgress={loading || imgLoading} />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      <ActionSheet
        ref={actionSheetRef}
        title={null}
        options={options}
        cancelButtonIndex={2}
        destructiveButtonIndex={2}
        onPress={index => processPictures(index)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  headerWrap: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 10,
    position: 'absolute',
    width: '100%',
    zIndex: 9999,
    backgroundColor: ResColors.transparent,
  },
  ButtonViewStyles: {
    flex: 0.1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 5,
    paddingRight: 8,
    paddingBottom: 5,
    paddingLeft: 4,
  },
  imageParentContainer: {
    marginVertical: 10,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,
    elevation: 24,
  },
  topimage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    resizeMode: 'cover',
  },
  icon: {
    backgroundColor: resColor.Green,
    position: 'absolute',
    zIndex: 10,
    right: 0,
    bottom: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
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

export default UpdateUserprofile;
