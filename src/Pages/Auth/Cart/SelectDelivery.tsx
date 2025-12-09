import {useLazyQuery} from '@apollo/client';
import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StatusBar,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableHighlight,
} from 'react-native';
import commonStyle from '../../../../commonStyle';
import CustomPBar from '../../../Components/CustomPBar';
import Helper from '../../../Utils/Helper';
import ProgressiveImage from '../../../Components/ProgressiveImage';
import {useSelector, useDispatch} from 'react-redux';
import {CustomButton} from '../../../Components/CustomButton';
import {translate} from '../../../locales';
import {
  customerAddressList,
  DeliveryShippingMethod,
  getDeliveryTime,
  setAddress,
  setDeliveryTime
} from '../../../Queries/queries';
import ResImage from '../../../Utils/Image';
import colorResource from '../../../Utils/Colors';
import {Icon} from 'react-native-elements';
import {Modalize} from 'react-native-modalize';
import NewAddress from '../UserProfile/NewAddress';
import {Portal} from 'react-native-portalize';
import AddressMapSelection from '../UserProfile/AddressMapSelection';

import {AppContext} from '../../AppContext';
import {ADDRESSAdd} from '../../../redux/DeliveryAddressReducers/DeliveryAddressAction';
import {ISAddressONCart} from './../../../redux/CheckoutCacheReducer/CheckoutCacheAction';
import {isNeedtoUpdatePAYDATA} from './../../../redux/PaymentMethodsReducers/PaymentMethodsAction';

const SelectDelivery = props => {
  const {appTheme} = useContext(AppContext);
  const [isDark, setDark] = useState(appTheme.type === 'dark');
  useEffect(() => {
    setDark(appTheme.type === 'dark');
  }, [appTheme.type]);
  const dispatch = useDispatch();
  const DeliveryAddressReducer = useSelector(
    (state: any) => state.DeliveryAddressReducer,
  );

  const [getAddress, {loading, error, data}] =
    useLazyQuery(customerAddressList);
  const [setAdd, {loading: aLoading, error: aError, data: aData}] =
    setAddress();

  const [selectedId, setselectedId] = useState(null);
  const [cdID, setCartId] = useState(props.cartId);
  const modalizeRefAddress = React.useRef<Modalize>(null);
  const modalizeRefAddressMap = React.useRef<Modalize>(null);
  const [AddressToMap, setAddressToMap] = useState(null);
  const [addressList, setAddressList] = useState([]);
  const [getAvailableSlot, { loading:slotLoading, error:dateTimeError, data:timeSlotData }] = useLazyQuery( getDeliveryTime );
  const [setDateTime, { loading: timeSlotLoading, error: dateTimeApiError, data: datetimeApiResponse }] = setDeliveryTime();
  const [setDeliveryShippingMethod, { loading:shipLoading, error: dError, data: dData }] = DeliveryShippingMethod();// if develivery order
  const [selectedAddress, setSelectedAddress] = useState(null);

  useEffect(() => {
    if (data) {
      data.customer.addresses.map((product, index) => {
        dispatch(ADDRESSAdd(product, product.id));
      });
    }
  }, [data]);

  useEffect(() => {
    if (aData) {
      dispatch(ISAddressONCart(true));
      dispatch(isNeedtoUpdatePAYDATA(true));
      let filterDeliveryData = addressList.filter(
        data => data.id == selectedId,
      );
      setSelectedAddress(filterDeliveryData[0]);

      setDeliveryShippingMethod( {
        variables: {
          cart_id: cdID,
        }
      });
    }
  }, [aData]);

  useEffect(() => {
    if (dData) {
      getAvailableSlot()
    }
  }, [dData]);

  useEffect(() => {
    if (dateTimeApiError != null && typeof dateTimeApiError != undefined) {
      console.log("time slot saved response" + dateTimeApiError);
    } else if (datetimeApiResponse != null && typeof datetimeApiResponse != undefined) {
      console.log("time slot saved response" + datetimeApiResponse);
      props.CloseBottomsheet(selectedId, selectedAddress);
    }
  }, [dateTimeApiError, datetimeApiResponse]);

  useEffect(() => {
    setAddressList(DeliveryAddressReducer.ADDRESSITEMS);
  }, [DeliveryAddressReducer]);

  useEffect(() => {
    // console.log(timeSlotData);
    // console.log("time error" + dateTimeError);
    dateTimeError && Helper.ShowAlertWithCallback(dateTimeError.message, {
      onPress: () => {
        Helper.HandleVibration();
        props.CloseBottomsheet(null)
      }
    });

    if(timeSlotData!=null){
      setDeliveryDateAndTime();
    }
  }, [dateTimeError, timeSlotData]);


  // useEffect( () =>{
  //   if(timeSlotData){
  //     console.log("my1 api date  ========>" + JSON.stringify(timeSlotData.deliveryTime[0].date))
  //     console.log("my1 api time slot========>" + JSON.stringify(timeSlotData.deliveryTime[0].slots[0].from))
  //   }
  // },[timeSlotData]);


  const selectAddress = (addressId: number) => {
    Helper.HandleVibration();
    setselectedId(addressId);
  };

  const goBack = () => {
    if (selectedId == null) {
      return;
    }
    Helper.HandleVibration();
    setAdd({
      variables: {
        cID: cdID,
        addressId: selectedId,
      },
    });

  };

  useEffect(() => {
    error && Helper.ShowAlert(`${error}`);
    aError && Helper.ShowAlert(`${aError}`);
  }, [error, aError]);

  /**
   * @param item - Items from Response
   */
  const renderDom = (item: any) => {
    return (
      <TouchableOpacity
        style={[
          styles.bg_container,
          {
            backgroundColor:
              selectedId == item.id
                ? isDark
                  ? colorResource.Green_03
                  : colorResource.Green_06
                : appTheme.InputBoxBGColor,
          },
        ]}
        onPress={() => {
          selectAddress(item.id);
        }}>
        <View style={styles.add_top_container}>
          {item.address_type == '1' && (
            <View style={styles.add_inner_container}>
              <ProgressiveImage
                source={
                  selectedId == item.id
                    ? ResImage.ic_add_home_de_selected
                    : isDark
                    ? ResImage.ic_add_home_de_new
                    : ResImage.ic_add_home_de
                }
                style={styles.type_icon}
                resizeMode="center"
              />
              <Text
                style={[
                  commonStyle.h5,
                  styles.text_add_title,
                  {
                    color:
                      selectedId == item.id
                        ? colorResource.Green
                        : isDark
                        ? appTheme.text
                        : colorResource.blackShade,
                  },
                ]}>
                {translate('address.lbl_home')}
              </Text>
            </View>
          )}
          {item.address_type == '2' && (
            <View style={styles.add_inner_container}>
              <ProgressiveImage
                source={
                  selectedId == item.id
                    ? ResImage.ic_add_work_selected
                    : isDark
                    ? ResImage.ic_add_work_new
                    : ResImage.ic_add_work
                }
                style={styles.type_icon}
                resizeMode="center"
              />
              <Text
                style={[
                  commonStyle.h5,
                  styles.text_add_title,
                  {
                    color:
                      selectedId == item.id
                        ? colorResource.Green
                        : isDark
                        ? appTheme.text
                        : colorResource.blackShade,
                  },
                ]}>
                {translate('address.lbl_work')}
              </Text>
            </View>
          )}
          {item.address_type != '1' && item.address_type != '2' && (
            <View style={styles.add_inner_container}>
              <ProgressiveImage
                source={
                  selectedId == item.id
                    ? ResImage.ic_add_other_selected
                    : isDark
                    ? ResImage.ic_add_other_new
                    : ResImage.ic_add_other
                }
                style={styles.type_icon}
                resizeMode="center"
              />
              <Text
                style={[
                  commonStyle.h5,
                  styles.text_add_title,
                  {
                    color:
                      selectedId == item.id
                        ? colorResource.Green
                        : isDark
                        ? appTheme.text
                        : colorResource.blackShade,
                  },
                ]}>
                {translate('address.lbl_other')}
              </Text>
            </View>
          )}
          {selectedId == item.id && (
            <ProgressiveImage
              source={ResImage.ic_checked_green}
              style={styles.close_icon}
            />
          )}
        </View>
        <View style={styles.container_address}>
          {(item.firstname || item.lastname) && (
            <Text
              style={[
                styles.text_address_name,
                {
                  color:
                    selectedId == item.id
                      ? colorResource.Green
                      : isDark
                      ? appTheme.text
                      : colorResource.blackShade,
                },
              ]}>
              {item.firstname} {item.lastname}
            </Text>
          )}
          {(item.apartment_number || item.street) && (
            <Text
              style={[
                styles.text_address_name,
                {
                  color:
                    selectedId == item.id
                      ? colorResource.Green
                      : isDark
                      ? appTheme.text
                      : colorResource.Gray,
                },
              ]}>
              {item.street[0]} {item.street[1]} {item.apartment_number}
            </Text>
          )}
          <Text
            style={[
              styles.text_address_name,
              {
                color:
                  selectedId == item.id
                    ? colorResource.Green
                    : isDark
                    ? appTheme.text
                    : colorResource.Gray,
              },
            ]}>
            {item.city} {item.postcode}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderItem = ({item}) => {
    return renderDom(item);
  };


  const setDeliveryDateAndTime = () => {
    //Helper.HandleVibration();
    setDateTime({
      variables: {
        deliveryDate: timeSlotData.deliveryTime[0].date,
        deliveryFrom: timeSlotData.deliveryTime[0].slots[0].from,
        deliveryTo: timeSlotData.deliveryTime[0].slots[0].to,
      }
    })

    console.log("api called");
  }

  return (
    <SafeAreaView
      style={[
        {flex: 1, backgroundColor: appTheme.background},
        isDark ? null : {borderTopLeftRadius: 24, borderTopRightRadius: 24},
      ]}>
      <View style={styles.headerWrap}>
        <View
          style={[styles.ButtonViewStyles, {marginLeft: -15, marginBottom: 5}]}>
          <TouchableHighlight
            onPress={() => {
              Helper.HandleVibration();
              props.CloseBottomsheet(null);
            }}
            underlayColor={colorResource.transparent}
            style={{padding: 5}}>
            <Icon
              name="times"
              type="font-awesome-5"
              size={24}
              color={isDark ? colorResource.white : colorResource.black}
            />
            {/* <Image
                            source={ResImage.ic_close_modal}
                     style={[commonStyle.he_wi_24]} /> */}
          </TouchableHighlight>
        </View>
      </View>

      <StatusBar
        translucent={true}
        backgroundColor={colorResource.transparent}
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />

      <ScrollView style={commonStyle.padding_16}>
        <View>
          <Text style={[commonStyle.profileHeader, {color: appTheme.text}]}>
            {translate('selectdelivery.lbl_select_address')}
          </Text>

          <TouchableOpacity
            style={[
              commonStyle.profileContainer,
              commonStyle.flexDir_Row,
              commonStyle.justifyContent_flex_start,
              {
                padding: 12,
                marginTop: 8,
                alignItems: 'center',
                backgroundColor: appTheme.InputBoxBGColor,
              },
            ]}
            onPress={() => {
              Helper.HandleVibration();
              setAddressToMap(AddressToMap => (AddressToMap = null));
              modalizeRefAddress.current?.open();
            }}>
            <ProgressiveImage
              source={isDark ? ResImage.ic_Plus : ResImage.ic_plus_gray}
              style={{paddingRight: 8}}></ProgressiveImage>
            <Text
              style={[
                commonStyle.h5,
                {
                  color: isDark
                    ? colorResource.disable_clr
                    : colorResource.Gray,
                },
              ]}>
              {translate('selectdelivery.lbl_add_new_address')}
            </Text>
          </TouchableOpacity>
        </View>
        {addressList &&
          (addressList.length == 0 ? (
            <View>
              <Text
                style={[
                  commonStyle.h5,
                  {
                    marginTop: 40,
                    textAlign: 'center',
                    color: isDark
                      ? colorResource.disable_clr
                      : colorResource.Gray,
                  },
                ]}>
                {/* No Address Found */}
                {translate('addrslist.lbl_noaddrs')}
              </Text>
            </View>
          ) : (
            <FlatList
              data={addressList}
              renderItem={renderItem}
              numColumns={1}
              keyExtractor={(item, index) => item.id}
              extraData={selectedId}
              style={{flex: 1, paddingTop: 40}}
            />
          ))}
      </ScrollView>
      <View style={{marginBottom: 25, padding: 16}}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <View style={{flex: 1}}>
            <CustomButton
              title="checkout.lbl_continue_checkout"
              onPress={() => goBack()}
              // ]}
              customButtonStyle={[
                selectedId != null
                  ? commonStyle.btn_primary
                  : (commonStyle.btn_disabled,
                    isDark
                      ? {backgroundColor: colorResource.a1E1E1E}
                      : commonStyle.btn_disabled),
              ]}
              customTitleStyle={[
                selectedId != null ? null : {color: colorResource.a3E3E3E},
              ]}
            />
          </View>
        </View>
      </View>

      <Portal>
        <Modalize
          panGestureEnabled={false}
          modalTopOffset={StatusBar.currentHeight + 20}
          ref={modalizeRefAddress}
          onOpen={() => {
            setAddressToMap(AddressToMap => (AddressToMap = null));
          }}
          onOpened={() => {
            setAddressToMap(AddressToMap => (AddressToMap = null));
          }}
          onClosed={() => getAddress()}
          scrollViewProps={{
            scrollEnabled: false,
            contentContainerStyle: {height: '100%'},
          }}>
          <NewAddress
            CloseBottomsheet={() => {
              modalizeRefAddress.current?.close();
            }}
            addressfromMap={AddressToMap}
            ContinuetoMap={adrs => {
              //setAddressToMap( adrs )
              setAddressToMap(AddressToMap => (AddressToMap = null));
              modalizeRefAddress.current?.close();
              //modalizeRefAddressMap.current?.open()
              getAddress();
            }}
          />
        </Modalize>
      </Portal>
      <Portal>
        <Modalize
          panGestureEnabled={false}
          modalTopOffset={StatusBar.currentHeight + 20}
          ref={modalizeRefAddressMap}
          onClosed={() => getAddress()}
          scrollViewProps={{
            scrollEnabled: false,
            contentContainerStyle: {height: '100%'},
          }}>
          <AddressMapSelection
            Useraddress={AddressToMap}
            Saved={() => {
              setAddressToMap(AMap => (AMap = null));
              modalizeRefAddressMap.current?.close();
            }}
            CloseBottomsheet={() => {
              modalizeRefAddressMap.current?.close();
              modalizeRefAddress.current?.open();
            }}
          />
        </Modalize>
      </Portal>

      <CustomPBar showProgress={loading || aLoading|| slotLoading || timeSlotLoading|| shipLoading} />
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

  page_sub_title: {
    fontSize: 20,
    lineHeight: 28,
    fontFamily: 'Gilroy-Regular',
    fontWeight: '700',
  },

  type_icon: {
    width: 24,
    height: 24,
  },
  close_icon: {
    width: 24,
    height: 24,
  },

  btn_submit: {
    fontWeight: '600',
    color: 'white',
  },
  text_header: {
    marginTop: 8,
  },
  bg_container: {
    backgroundColor: colorResource.SmokeWhite,
    justifyContent: 'center',
    alignContent: 'center',
    borderRadius: 16,
    flexDirection: 'column',
    marginBottom: 24,
  },
  add_top_container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 30,
    margin: 16,
    marginTop: 12,
    marginBottom: 4,
  },
  add_inner_container: {
    width: '80%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  text_add_title: {
    paddingLeft: 8,
    fontWeight: '700',
  },
  text_address: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
    fontWeight: '400',
  },
  text_address_name: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
    fontWeight: '600',
  },
  container_address: {
    paddingLeft: 50,
    paddingRight: 48,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    paddingBottom: 12,
    marginTop: -7,
  },
});

export default SelectDelivery;
