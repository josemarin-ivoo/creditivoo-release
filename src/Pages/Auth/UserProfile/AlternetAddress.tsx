import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableHighlight,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from 'react-native';
import commonStyle from '../../../../commonStyle';
import {CustomButton} from '../../../Components/CustomButton';
import CustomInput from '../../../Components/CustomInput';
import {
  AddAddress,
  AddAlternateAddress,
  getNearestCityList,
} from '../../../Queries/queries';
import CustomPBar from '../../../Components/CustomPBar';
import {translate} from '../../../locales';
import {useLazyQuery} from '@apollo/client';
import {Picker, PickerIOS} from '@react-native-picker/picker';
import ImageResources from '../../../Utils/Image';
import ResColor from '../../../Utils/Colors';
import ResImage from '../../../Utils/Image';
import Helper from '../../../Utils/Helper';
import {useKeyboard} from '../../../Utils/KeybooardCustom';
import {Icon} from 'react-native-elements';
import {AppContext} from '../../AppContext';
import {getItemFromStorage} from '../../../Utils/Storage';

const AlternetAddress = props => {
  const {appTheme} = useContext(AppContext);
  const [isDark, setDark] = useState(appTheme.type === 'dark');
  useEffect(() => {
    setDark(appTheme.type === 'dark');
  }, [appTheme.type]);
  // const [newAdd, { loading, error, data }] = AddAddress()
  const [
    getCityList,
    {loading: loadingCity, error: errorCity, data: dataCity},
  ] = useLazyQuery(getNearestCityList);

  const [newAdd, {loading: aloading, error: aError, data: aData}] =
    AddAlternateAddress();

  const [addressType, setaddressType] = useState(1);
  const [city, setCity] = useState('');
  const [fname, setfname] = useState('');
  const [lname, setlname] = useState('');
  const [appartment, setappartment] = useState('');
  const [urbanization, seturbanization] = useState('');
  const [deliveryNote, setdeliveryNote] = useState('');
  const [postalcode, setpostalcode] = useState('');
  const [note, setnote] = useState('');
  const [receiverId, setReceiverId] = useState('');
  const [btn_enable, setbtnenable] = useState(false);
  const [selectedCity, setselectedCity] = useState(null);
  const [iosPicker, setiosPicker] = useState(false);

  useEffect(() => {
    getCityList();
  }, []);

  useEffect(() => {
    dataCity != undefined &&
      dataCity.nearestCityList != undefined &&
      dataCity.nearestCityList.length > 0 &&
      setselectedCity(dataCity.nearestCityList[0].name);
    console.log('city list ------>>', dataCity);
  }, [dataCity]);

  // useEffect( () =>
  // {
  //     error && Helper.ShowAlert( `${ error }` );
  // }, [error] )

  useEffect(() => {
    if (props.addressfromMap) {
      setfname(props.addressfromMap.firstname);
      setlname(props.addressfromMap.lastname);
      setCity(props.addressfromMap.city);
      seturbanization(props.addressfromMap.urbanization);
      setappartment(props.addressfromMap.apartment_number);
      setpostalcode(props.addressfromMap.postcode);
      setdeliveryNote(props.addressfromMap.street);
      setaddressType(Number(props.addressfromMap.address_type));
      setselectedCity(props.addressfromMap.nearest_city);
      setReceiverId(props.addressfromMap.receiverId);
    }
  }, [props.addressfromMap]);

  const ContinuetoMap = () => {
    Helper.HandleVibration();
    if (!btn_enable) {
      return;
    }
    const variables = {
      firstname: fname,
      lastname: lname,
      city: selectedCity,
      street: deliveryNote,
      urbanization: urbanization,
      address_type: '4',
      apartment_number: appartment,
      default_shipping: true,
      default_billing: false,
      postcode: postalcode,
      nearest_city: selectedCity,
      isNewAddress: true,
      receiverId: receiverId,
    };
    console.log('variables value ----->>', variables);
    //props.ContinuetoMap(variables);
    SaveAddress(variables);
  };

  const SaveAddress = async variables => {
    Helper.HandleVibration();
    const storedLat = await getItemFromStorage('lat');
    const storedLng = await getItemFromStorage('lng');
    newAdd({
      variables: {
        firstname: variables.firstname,
        lastname: variables.lastname,
        city: variables.city,
        street: [variables.street, variables.urbanization],
        address_type: variables.address_type,
        apartment_number: variables.apartment_number,
        default_shipping: true,
        default_billing: false,
        postcode: variables.postcode,
        nearest_city: variables.nearest_city,
        latitude: storedLat,
        longitude: storedLng,
        receiverId: receiverId,
      },
    });
  };

  useEffect(() => {
    if (aData) {
      if (aData.createAlternateAddress) {
        console.log('Saved address --- ' + JSON.stringify(aData));
        // dispatch(ISAddressCacheUpdated(true));
        Helper.ShowAlert(translate('address.msg_address_added'), null);
        props.ContinuetoMap(aData);

        // props.Useraddress.Useraddress = null;
        // props.Saved();
      }
    }
  }, [aData]);

  useEffect(() => {
    aError && Helper.ShowAlert(`${aError}`);
  }, [aError]);

  useEffect(() => {
    checkAll();
  }, [
    fname,
    lname,
    city,
    urbanization,
    deliveryNote,
    appartment,
    note,
    postalcode,
    receiverId,
  ]);

  const checkAll = () => {
    if (fname != '' && lname != '' && urbanization != '') {
      // && street != '' )
      setbtnenable(true);
    } else {
      setbtnenable(false);
    }
  };
  const [keyboardHeigth] =
    useKeyboard(); /* initialize the hook (optional parameters) */

  return (
    <SafeAreaView
      style={[
        {flex: 1, backgroundColor: appTheme.background},
        isDark ? null : {borderTopLeftRadius: 24, borderTopRightRadius: 24},
      ]}>
      <View style={styles.headerWrap}>
        <View style={styles.ButtonViewStyles}>
          <TouchableHighlight
            onPress={props.CloseBottomsheet}
            underlayColor={ResColor.transparent}
            style={{padding: 5}}>
            <Icon
              name="times"
              type="font-awesome-5"
              size={24}
              color={isDark ? ResColor.white : ResColor.black}
            />
          </TouchableHighlight>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{padding: 16, flex: 1}}
        behavior="height"
        enabled={Platform.OS === 'ios' ? false : false}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <>
            <View
              style={{
                flex: 1,
                paddingBottom:
                  Platform.OS === 'ios'
                    ? 60
                    : keyboardHeigth == 0
                    ? 60
                    : keyboardHeigth - 50,
              }}>
              <SafeAreaView style={{marginBottom: 8}}>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={[
                    commonStyle.wrapper,
                    {backgroundColor: appTheme.background},
                  ]}
                  keyboardShouldPersistTaps="handled">
                  <Text
                    style={[
                      commonStyle.h2,
                      commonStyle.fontBold,
                      commonStyle.titlePageHeaderText,
                      {color: appTheme.text},
                    ]}>
                    {translate('address.lbl_receiver_address')}
                  </Text>
                  {/* Address Type */}
                  <View style={styles.address_container}>
                    {/* Receiver */}
                    <TouchableOpacity
                      style={styles.type_container}
                      onPress={() => {
                        Helper.HandleVibration();
                        setaddressType(4);
                      }}>
                      <View
                        style={[
                          styles.address_type,
                          {
                            backgroundColor: isDark
                              ? ResColor.Green_03
                              : ResColor.Green_06,
                          },
                        ]}>
                        {
                          <Image
                            source={ResImage.ic_profile_green}
                            style={styles.type_icon}
                          />
                        }
                      </View>
                      <Text style={styles.type_text_enable}>
                        {translate('recipient.lbl_recipient')}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <CustomInput
                    labelText={'address.lbl_first_name'}
                    value={fname}
                    onChangeText={value => setfname(value)}
                    placeholder={'address.lbl_enter_fname'}
                  />
                  <Text style={{marginBottom: 1}}></Text>
                  <CustomInput
                    labelText={'address.lbl_last_name'}
                    value={lname}
                    onChangeText={value => setlname(value)}
                    placeholder={'address.lbl_enter_lname'}
                  />
                  <Text style={{marginBottom: 1}}></Text>
                  <Text
                    style={[
                      styles.type_text_disable,
                      {color: appTheme.text, marginBottom: 5},
                    ]}>
                    {translate('address.lbl_city')}
                  </Text>
                  {dataCity != undefined &&
                    dataCity.nearestCityList != undefined &&
                    Platform.OS == 'android' && (
                      <View
                        style={{
                          width: '100%',
                          backgroundColor: appTheme.InputBoxBGColor,
                          borderRadius: 12,
                          paddingLeft: 10,
                        }}>
                        <Picker
                          selectedValue={selectedCity}
                          mode="dropdown"
                          dropdownIconColor={appTheme.text}
                          onValueChange={(itemValue, itemIndex) =>
                            setselectedCity(itemValue)
                          }>
                          {dataCity.nearestCityList.map((item, index) => {
                            return (
                              <Picker.Item
                                style={{
                                  color: appTheme.text,
                                  marginStart: 12,
                                  backgroundColor: appTheme.InputBoxBGColor,
                                  borderBottomLeftRadius: 5,
                                }}
                                label={item.name}
                                value={item.name}
                                key={index}
                              />
                            );
                          })}
                        </Picker>
                      </View>
                    )}
                  {dataCity != undefined &&
                    dataCity.nearestCityList != undefined &&
                    Platform.OS == 'ios' && (
                      <TouchableOpacity
                        style={[
                          styles.pickerios,
                          {
                            backgroundColor: appTheme.InputBoxBGColor,
                            flexDirection: 'row',
                          },
                        ]}
                        onPress={() => {
                          Helper.HandleVibration();
                          setiosPicker(true);
                        }}>
                        <Text
                          style={[
                            styles.text_PickerSelected,
                            {
                              color: appTheme.text,
                            },
                          ]}>
                          {selectedCity == undefined
                            ? 'Select City'
                            : selectedCity}
                        </Text>
                        <View style={{marginTop: 15}}>
                          <Icon
                            name="caret-down"
                            size={18}
                            type="font-awesome-5"
                            color={appTheme.text}
                          />
                        </View>
                      </TouchableOpacity>
                    )}
                  <Text style={{marginBottom: 1}}></Text>

                  <CustomInput
                    labelText={'address.lbl_urbanization'}
                    value={urbanization}
                    onChangeText={value => seturbanization(value)}
                    placeholder={'address.lbl_enter_urbanization'}
                  />
                  <Text style={{marginBottom: 1}}></Text>
                  <CustomInput
                    labelText={'address.lbl_addrs'}
                    value={deliveryNote}
                    onChangeText={value => setdeliveryNote(value)}
                    placeholder={'address.lbl_addrs_input'}
                  />
                  <Text style={{marginBottom: 1}}></Text>
                  <CustomInput
                    labelText={'address.lbl_person_id'}
                    value={receiverId}
                    onChangeText={value => setReceiverId(value)}
                    placeholder={'address.lbl_person_id_details'}
                  />
                  <Text style={{marginBottom: 12}}></Text>
                </ScrollView>
              </SafeAreaView>
            </View>
            {
              <View
                style={{
                  bottom: 25,
                  width: '100%',
                  position: 'absolute',
                  marginLeft: 16,
                }}>
                <CustomButton
                  title={'pre_login.lbl_Continue'}
                  onPress={ContinuetoMap}
                  customButtonStyle={[
                    btn_enable
                      ? commonStyle.btn_primary
                      : (commonStyle.btn_disabled,
                        isDark
                          ? {backgroundColor: ResColor.a1E1E1E}
                          : commonStyle.btn_disabled),
                  ]}
                  customTitleStyle={[
                    btn_enable ? null : {color: ResColor.a3E3E3E},
                  ]}
                />
              </View>
            }
          </>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <CustomPBar showProgress={loadingCity || aloading} />
      {dataCity != undefined &&
        dataCity.nearestCityList != undefined &&
        Platform.OS == 'ios' && (
          <View
            style={[styles.pickerBG, {display: iosPicker ? 'flex' : 'none'}]}>
            <TouchableOpacity
              style={{
                backgroundColor: 'transparent',
                height: '100%',
                width: '100%',
              }}
              onPress={() => {
                Helper.HandleVibration();
                setiosPicker(false);
              }}></TouchableOpacity>
            <View
              style={[
                styles.pickerMain,
                {backgroundColor: appTheme.background},
              ]}>
              <View style={styles.stylePickerDone}>
                <TouchableOpacity
                  style={{
                    backgroundColor: ResColor.Green,
                    borderRadius: 8,
                    marginRight: 16,
                  }}
                  onPress={() => {
                    Helper.HandleVibration();
                    setiosPicker(false);
                  }}>
                  <Text style={[styles.styleDone]}>
                    {translate('Intro.lbl_done')}
                  </Text>
                </TouchableOpacity>
              </View>
              <PickerIOS
                selectedValue={selectedCity}
                itemStyle={{
                  backgroundColor: appTheme.background,
                  color: appTheme.text,
                }}
                onValueChange={(itemValue, itemIndex) =>
                  setselectedCity(selectedCity => itemValue)
                }>
                {dataCity.nearestCityList.map((item, index) => {
                  return (
                    <Picker.Item
                      label={item.name}
                      value={item.name}
                      key={index}
                    />
                  );
                })}
              </PickerIOS>
            </View>
          </View>
        )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerWrap: {
    flexDirection: 'row',
    paddingTop: 24,
    paddingHorizontal: 24,
  },
  ButtonViewStyles: {
    flex: 0.1,
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
    marginRight: 8,
  },
  type_icon: {
    height: 24,
    aspectRatio: 1,
    resizeMode: 'stretch',
  },
  type_text_enable: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
    fontWeight: '600',
    marginTop: 4,
    color: ResColor.Green,
  },
  type_text_disable: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
    marginTop: 4,
    color: ResColor.Gray,
  },
  pickerios: {
    height: 48,
    borderRadius: 16,
    backgroundColor: ResColor.SmokeWhite,
    fontSize: 16,
    lineHeight: 24,
    color: ResColor.blackShade,
    width: '100%',
    justifyContent: 'center',
    marginBottom: 12,
  },
  text_PickerSelected: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
    margin: 8,
    width: '85%',
    marginTop: 10,
  },
  pickerOpenios: {
    height: 120,
    backgroundColor: ResColor.SmokeWhite,
    width: '100%',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 0,
  },
  pickerBG: {
    height: '100%',
    backgroundColor: 'transparent',
    width: '100%',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 0,
  },
  pickerMain: {
    backgroundColor: ResColor.SmokeWhite,
    width: '100%',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 0,
    shadowColor: 'black',
    shadowOpacity: 0.15,
  },
  stylePickerDone: {
    width: '100%',
    justifyContent: 'flex-end',
    flexDirection: 'row',
    marginTop: 16,
  },

  styleDone: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
    fontWeight: '700',
    margin: 4,
    marginHorizontal: 20,
    color: ResColor.white,
  },
});

export default AlternetAddress;
