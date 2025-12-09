import {useNavigation} from '@react-navigation/native';
import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';

import {CustomButton} from '../../../../Components/CustomButton';
import CustomInput from '../../../../Components/CustomInput';
import {
  AddAlternateAddress,
  getNearestCityList,
  updateCustomerAddress,
  updateCustomerAlternateAddress,
} from '../../../../Queries/queries';
import CustomPBar from '../../../../Components/CustomPBar';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {translate} from '../../../../locales';
import CustomHeader from '../../../../Components/CustomHeader';
import {useLazyQuery} from '@apollo/client';
import {Picker, PickerIOS} from '@react-native-picker/picker';
import ImageResources from '../../../../Utils/Image';
import ResColor from '../../../../Utils/Colors';
import {Modalize} from 'react-native-modalize';
import {Portal} from 'react-native-portalize';
import AddressMapSelection from '.././AddressMapSelection';
import {useKeyboard} from '../../../../Utils/KeybooardCustom';
import Helper from '../../../../Utils/Helper';
import {AppContext} from '../../../AppContext';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Icon} from 'react-native-elements';
import commonStyle from '../../../../../commonStyle';
import {getItemFromStorage} from '../../../../Utils/Storage';
import {useDispatch} from 'react-redux';
import {
  AddAlternetAddress,
  ClearAlternetAddress,
} from '../../../../redux/AlternetAddressReducers/AlternetAddressAction';

const EditAlternetAddress = props => {
  const {appTheme} = useContext(AppContext);
  const dispatch = useDispatch();
  const [isDark, setDark] = useState(appTheme.type === 'dark');
  useEffect(() => {
    setDark(appTheme.type === 'dark');
  }, [appTheme.type]);

  const [myAddress] = useState(props.route.params.address);
  const navigation = useNavigation();
  const [addressType, setaddressType] = useState(1);
  const [city, setCity] = useState('');
  const [fname, setfname] = useState('');
  const [lname, setlname] = useState('');
  const [appartment, setappartment] = useState('');
  const [urbanization, seturbanization] = useState('');
  const [deliveryNote, setdeliveryNote] = useState('');
  const [postalcode, setpostalcode] = useState('');
  const [receiverId, setReceiverId] = useState('');
  const [note, setnote] = useState('');
  const [btn_enable, setbtnenable] = useState(false);
  const [
    getCityList,
    {loading: loadingCity, error: errorCity, data: dataCity},
  ] = useLazyQuery(getNearestCityList);

  const [updateAdd, {loading: eLoading, error: eError, data: eData}] =
    updateCustomerAlternateAddress();

  const [selectedCity, setselectedCity] = useState(myAddress.nearest_city);
  const [iosPicker, setiosPicker] = useState(false);
  const modalizeRefAddressMap = React.useRef<Modalize>(null);

  const [AddressToMap, setAddressToMap] = useState(null);

  useEffect(() => {
    getCityList();
  }, []);

  useEffect(() => {
    console.log('Address ID ---->>', myAddress);
    setfname(myAddress.firstname);
    setlname(myAddress.lastname);
    setCity(myAddress.city);
    seturbanization(myAddress.street[1]);
    setappartment(myAddress.apartment_number);
    setpostalcode(myAddress.postcode);
    setdeliveryNote(myAddress.street[0]);
    setaddressType(Number(myAddress.address_type));
    setReceiverId(myAddress.receiverId);
  }, [myAddress]);

  const ContinuetoMap = () => {
    Helper.HandleVibration();
    if (!btn_enable) {
      return;
    }
    const variables = {
      aid: parseInt(myAddress.alernateaddress_id),
      firstname: fname,
      lastname: lname,
      city: selectedCity,
      street: deliveryNote,
      urbanization: urbanization,
      address_type: addressType,
      apartment_number: appartment,
      default_shipping: true,
      default_billing: false,
      postcode: postalcode,
      nearest_city: selectedCity,
      isNewAddress: false,
      receiverId: receiverId,
    };

    //setAddressToMap(variables);
    //navigation.goBack();
    //modalizeRefAddressMap.current.open();
    updateAddress(variables);
  };

  const updateAddress = async variables => {
    const storedLat = await getItemFromStorage('lat');
    const storedLng = await getItemFromStorage('lng');
    updateAdd({
      variables: {
        alernateaddress_id: variables.aid,
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
        receiverId: variables.receiverId,
      },
    });
  };

  useEffect(() => {
    console.log('eData address --- ' + JSON.stringify(eData));
    if (eData) {
      if (eData.updateAlternateAddress) {
        console.log('eData address --- ' + JSON.stringify(eData));
        Helper.ShowAlert(translate('addrslist.lbl_addrs_update'), null);
        dispatch(ClearAlternetAddress());
        dispatch(AddAlternetAddress(eData.updateAlternateAddress));
        //props.CloseBottomsheet();
        navigation.goBack();
      }
    }
  }, [eData]);

  useEffect(() => {
    eError && Helper.ShowAlert(`${eError}`);
  }, [eError]);

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
    if (fname != '' && lname != '' && city != '' && urbanization != '') {
      //&& street != '' )
      setbtnenable(true);
    } else {
      setbtnenable(false);
    }
  };

  const [keyboardHeigth] =
    useKeyboard(); /* initialize the hook (optional parameters) */

  const insets = useSafeAreaInsets();

  return (
    <View style={[{flex: 1, backgroundColor: appTheme.background}]}>
      <CustomHeader
        gradientHeader={false}
        gradientHeaderOption={false}
        scrolledValue={false}
      />
      <View style={{paddingHorizontal: 16, flex: 1}}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{flex: 1}}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[
                commonStyle.wrapper,
                {
                  paddingBottom:
                    Platform.OS === 'ios'
                      ? 165
                      : keyboardHeigth == 0
                      ? 130
                      : keyboardHeigth - 50,
                  marginTop: Platform.OS === 'ios' ? 90 : 60,
                  backgroundColor: appTheme.background,
                },
              ]}
              keyboardShouldPersistTaps="handled">
              <Text
                style={[
                  commonStyle.h2,
                  commonStyle.fontBold,
                  commonStyle.titlePageHeaderText,
                  {padding: 0, color: appTheme.text, marginTop: insets.top},
                ]}>
                {translate('address.lbl_new_address')}
              </Text>

              {/* Address Type */}
              <View style={styles.address_container}>
                {/* Home */}
                <TouchableOpacity
                  style={styles.type_container}
                  onPress={() => {
                    Helper.HandleVibration();
                    setaddressType(1);
                  }}>
                  <View
                    style={[
                      styles.address_type,
                      {
                        backgroundColor:
                          addressType == 1
                            ? isDark
                              ? ResColor.Green_03
                              : ResColor.Green_06
                            : appTheme.InputBoxBGColor,
                      },
                    ]}>
                    {
                      <Image
                        source={ImageResources.ic_profile_green}
                        style={styles.type_icon}
                      />
                    }
                  </View>
                  <Text
                    style={
                      addressType == 1
                        ? styles.type_text_enable
                        : styles.type_text_disable
                    }>
                    Receptor
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
                      borderRadius: 16,
                      justifyContent: 'center',
                      backgroundColor: appTheme.InputBoxBGColor,
                      paddingLeft: 10,
                    }}>
                    <Picker
                      selectedValue={selectedCity}
                      mode="dropdown"
                      dropdownIconColor={appTheme.text}
                      onValueChange={(itemValue, itemIndex) =>
                        setselectedCity(selectedCity => itemValue)
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
                        {color: appTheme.text},
                      ]}>
                      {selectedCity == undefined ? 'Select City' : selectedCity}
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
                placeholder={'address.lbl_addrs'}
              />
              <Text style={{marginBottom: 1}}></Text>
              <CustomInput
                labelText={'address.lbl_person_id'}
                value={receiverId}
                onChangeText={value => setReceiverId(value)}
                placeholder={'address.lbl_person_id_details'}
              />
              <Text style={{marginBottom: 1}}></Text>
            </ScrollView>

            <View
              style={{
                position: 'absolute',
                bottom: 25,
                marginTop: 15,
                width: '100%',
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
            <CustomPBar showProgress={eLoading || loadingCity} />
            {dataCity != undefined &&
              dataCity.nearestCityList != undefined &&
              Platform.OS == 'ios' && (
                <View
                  style={[
                    styles.pickerBG,
                    {display: iosPicker ? 'flex' : 'none'},
                  ]}>
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
          </View>
        </TouchableWithoutFeedback>
      </View>

      <Portal>
        <Modalize
          panGestureEnabled={false}
          modalTopOffset={StatusBar.currentHeight + 20}
          ref={modalizeRefAddressMap}
          scrollViewProps={{
            scrollEnabled: false,
            contentContainerStyle: {height: '100%'},
          }}>
          <AddressMapSelection
            Useraddress={AddressToMap}
            CloseBottomsheet={() => {
              modalizeRefAddressMap.current?.close();
              navigation.goBack();
              //modalizeRefAddress.current?.open()
            }}></AddressMapSelection>
        </Modalize>
      </Portal>
    </View>
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
    color: ResColor.Green,
  },

  type_text_disable: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
    marginTop: 4,
    color: ResColor.Gray,
  },
  text_header: {
    marginTop: 8,
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

  pickerBG: {
    height: '100%',
    backgroundColor: 'transparent',
    width: '100%',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 0,
  },
  pickerMain: {
    height: '50%',
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

export default EditAlternetAddress;
