import {useLazyQuery} from '@apollo/client';
import {useNavigation} from '@react-navigation/native';
import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Platform,
} from 'react-native';
import commonStyle from '../../../../commonStyle';
import {Layout} from '../../../Components/Layout';
import ProgressiveImage from '../../../Components/ProgressiveImage';
import {useSelector, useDispatch} from 'react-redux';
import {CustomButton} from '../../../Components/CustomButton';
import {translate} from '../../../locales';
import {
  customerAddressList,
  customerAlternateAddressList,
  DeleteCustomerAddress,
  DeleteCustomerAlternateAddress,
} from '../../../Queries/queries';
import {Routes} from '../../../Utils/NavigationRoutes';
import NewAddress from '../UserProfile/NewAddress';
import {Modalize} from 'react-native-modalize';
import {Portal} from 'react-native-portalize';
import ResColor from '../../../Utils/Colors';
import ResImage from '../../../Utils/Image';
import AddressMapSelection from './AddressMapSelection';
import Helper from '../../../Utils/Helper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AppContext} from '../../AppContext';
import {
  ADDRESSAdd,
  ISAddressCacheUpdated,
} from '../../../redux/DeliveryAddressReducers/DeliveryAddressAction';
import {ADDRESSDelete} from './../../../redux/DeliveryAddressReducers/DeliveryAddressAction';
import {
  AddAlternetAddress,
  AlternateADDRESSDelete,
  ClearAlternetAddress,
} from '../../../redux/AlternetAddressReducers/AlternetAddressAction';
import CustomPBar from '../../../Components/CustomPBar';

const AddressList = props => {
  const {appTheme} = useContext(AppContext);
  const [isDark, setDark] = useState(appTheme.type === 'dark');
  useEffect(() => {
    setDark(appTheme.type === 'dark');
  }, [appTheme.type]);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [addressList, setAddressList] = useState([]);
  const [alternetAddressList, setAlternetAddressList] = useState([]);

  const DeliveryAddressReducer = useSelector(
    (state: any) => state.DeliveryAddressReducer,
  );

  const AlternetDeliveryAddressReducer = useSelector(
    (state: any) => state.AlternetDeliveryAddressReducer,
  );

  const [getAddress, {loading, error, data}] =
    useLazyQuery(customerAddressList);
  const [
    getAlternateAddress,
    {
      loading: loadingAddresses1,
      error: errorAddresses1,
      data: dataAlternateAddresses,
    },
  ] = useLazyQuery(customerAlternateAddressList);
  const [deletAdd, {loading: loadingD, error: errorD, data: dataD}] =
    DeleteCustomerAddress();
  const [deletAltAdd, {loading: altLoadingD, error: errorE, data: dataE}] =
    DeleteCustomerAlternateAddress();
  const modalizeRefAddress = React.useRef<Modalize>(null);
  const modalizeRefAddressMap = React.useRef<Modalize>(null);
  const [AddressToMap, setAddressToMap] = useState(null);

  useEffect(() => {
    error && Helper.ShowAlert(`${error}`);
    errorD && Helper.ShowAlert(`${errorD}`);
    errorAddresses1 && Helper.ShowAlert(`${errorAddresses1}`);
  }, [error, errorD, errorAddresses1]);

  const deleteAddress = (addId: number) => {
    Helper.HandleVibration();
    deletAdd({
      variables: {
        aid: addId,
      },
    }).then(dataD => {
      if (dataD) {
        Helper.ShowAlert(translate('addrslist.msg_addres_del_success'), null);
        dispatch(ADDRESSDelete(addId));
        // getAddress()
      } else {
        Helper.ShowAlert(translate('addrslist.msg_fail_del_address'));
      }
      setAddressToMap(AddressToMap => null);
    });
  };

  const deleteAlternateAddress = (addId: number) => {
    Helper.HandleVibration();
    deletAltAdd({
      variables: {
        aid: '' + addId,
      },
    }).then(dataE => {
      if (dataE) {
        if (dataE.data?.removeAlternateAddress?.result) {
          console.log('Res --->>', dataE.data?.removeAlternateAddress?.result);
          getAlternateAddress();
          Helper.ShowAlert(translate('addrslist.msg_addres_del_success'), null);
          dispatch(ClearAlternetAddress());
        } else {
          console.log('error ----');
          Helper.ShowAlert(translate('addrslist.msg_fail_del_address'));
        }
      } else {
        console.log('error ----');
        Helper.ShowAlert(translate('addrslist.msg_fail_del_address'));
      }
      setAddressToMap(AddressToMap => null);
    });
  };

  useEffect(() => {
    setAddressList(DeliveryAddressReducer.ADDRESSITEMS);
  }, [DeliveryAddressReducer]);

  useEffect(() => {
    console.log(
      'AlternetDeliveryAddressReducer ----->>',
      AlternetDeliveryAddressReducer.ALTERNET_ADDRESS_ITEMS,
    );
    if (AlternetDeliveryAddressReducer.ALTERNET_ADDRESS_ITEMS.length > 0) {
      setAlternetAddressList(
        AlternetDeliveryAddressReducer.ALTERNET_ADDRESS_ITEMS,
      );
    } else {
      setAlternetAddressList([]);
      getAlternateAddress();
    }
  }, [AlternetDeliveryAddressReducer]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (
        DeliveryAddressReducer.ADDRESSITEMS &&
        DeliveryAddressReducer.ADDRESSITEMS.length == 0
      ) {
        console.log('On navigation....');
        getAddress();
      } else {
        console.log(
          ' DeliveryAddressReducer.ADDRESSITEMS --->>',
          DeliveryAddressReducer.ADDRESSITEMS,
        );
        if (DeliveryAddressReducer.ADDRESSITEMS.length > 0) {
          if (
            DeliveryAddressReducer.ADDRESSITEMS[0].is_alternate_address ===
            undefined
          ) {
            getAddress();
          }
          console.log(
            'addresslistdata.customer.addresses[0].is_alternate_address --->> ',
            DeliveryAddressReducer.ADDRESSITEMS[0].is_alternate_address,
          );
        }
      }
      // !DeliveryAddressReducer.isUpdated ? getAddress() : null
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (data) {
      data.customer.addresses.map((product, index) => {
        console.log(product.id, ' -----', JSON.stringify(product));
        dispatch(ADDRESSAdd(product, product.id));
        dispatch(ISAddressCacheUpdated(true));
      });
    }
  }, [data]);

  useEffect(() => {
    if (dataAlternateAddresses && dataAlternateAddresses.getAlternateAddress) {
      dispatch(
        AddAlternetAddress(
          dataAlternateAddresses.getAlternateAddress,
          dataAlternateAddresses.getAlternateAddress.alernateaddress_id,
        ),
      );
    }
  }, [dataAlternateAddresses]);

  /**
   * @param item - Items from Response
   */
  const renderDom = (item, isAlternetAdderess) => {
    if (!isAlternetAdderess && item.is_alternate_address) {
      return;
    }
    return (
      <TouchableOpacity
        key={Math.random()}
        style={[
          styles.bg_container,
          {
            backgroundColor: isDark
              ? appTheme.InputBoxBGColor
              : ResColor.SmokeWhite,
          },
        ]}
        onPress={() => {
          Helper.HandleVibration();
          // console.log( JSON.stringify( item.address_type ) )
          if (isAlternetAdderess) {
            navigation.navigate(Routes.NAVIGATION_TO_EDIT_ALTERNET_ADDRESS, {
              address: item,
            });
          } else {
            navigation.navigate(Routes.NAVIGATION_TO_EDITADDRESS, {
              address: item,
            });
          }
        }}>
        <View style={styles.add_top_container}>
          {item.address_type == '1' && (
            <View style={styles.add_inner_container}>
              <ProgressiveImage
                source={
                  isDark
                    ? isAlternetAdderess
                      ? ResImage.ic_profile
                      : ResImage.ic_add_home_de_new
                    : isAlternetAdderess
                    ? ResImage.ic_profile_black
                    : ResImage.ic_add_home_de
                }
                style={styles.type_icon}
                resizeMode="center"
              />
              <Text
                style={[
                  commonStyle.h5,
                  styles.text_add_title,
                  {color: appTheme.text},
                ]}>
                {translate('address.lbl_home')}
              </Text>
            </View>
          )}
          {item.address_type == '2' && (
            <View style={styles.add_inner_container}>
              <ProgressiveImage
                source={
                  isDark
                    ? isAlternetAdderess
                      ? ResImage.ic_profile
                      : ResImage.ic_add_work_new
                    : isAlternetAdderess
                    ? ResImage.ic_profile_black
                    : ResImage.ic_add_work
                }
                style={styles.type_icon}
                resizeMode="center"
              />
              <Text
                style={[
                  commonStyle.h5,
                  styles.text_add_title,
                  {color: appTheme.text},
                ]}>
                {translate('address.lbl_work')}
              </Text>
            </View>
          )}
          {item.address_type != '1' && item.address_type != '2' && (
            <View style={styles.add_inner_container}>
              <ProgressiveImage
                source={
                  isDark
                    ? isAlternetAdderess
                      ? ResImage.ic_profile
                      : ResImage.ic_add_other_new
                    : isAlternetAdderess
                    ? ResImage.ic_profile_black
                    : ResImage.ic_add_other
                }
                style={styles.type_icon}
                resizeMode="center"
              />
              <Text
                style={[
                  commonStyle.h5,
                  styles.text_add_title,
                  {color: appTheme.text},
                ]}>
                {translate('address.lbl_other')}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={{width: 24, height: 24}}
            onPress={() => {
              isAlternetAdderess
                ? deleteAlternateAddress(item.alernateaddress_id)
                : deleteAddress(item.id);
            }}>
            <ProgressiveImage
              source={ResImage.ic_close_red}
              style={styles.close_icon}
              resizeMode="center"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.container_address}>
          {(item.firstname || item.lastname) && (
            <Text style={[styles.text_address_name, {color: appTheme.text}]}>
              {item.firstname} {item.lastname}
            </Text>
          )}
          {(item.apartment_number || item.street) && (
            <Text style={[styles.text_address, {color: appTheme.text}]}>
              {item.street[0]} {item.street[1]} {item.apartment_number}
            </Text>
          )}

          <Text style={[styles.text_address, {color: appTheme.text}]}>
            {item.city} {item.postcode}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderItem = (item, isAlternetAdderess) => {
    return renderDom(item, isAlternetAdderess);
  };
  const insets = useSafeAreaInsets();

  const renderHeader = () => {
    return (
      <View
        style={{
          paddingTop: insets.top + 10,
          paddingBottom: insets.bottom,
        }}>
        <Text
          style={[
            commonStyle.h2,
            commonStyle.fontBold,
            commonStyle.titlePageHeaderText,
            styles.titleinprofile,
            {color: appTheme.text},
          ]}>
          {translate('address.lbl_addresses')}
        </Text>
      </View>
    );
  };

  return (
    <>
      <Layout scroll={true}>
        <StatusBar
          translucent={true}
          backgroundColor={ResColor.transparent}
          barStyle={isDark ? 'light-content' : 'dark-content'}
        />
        <View
          style={{
            paddingLeft: 16,
            paddingRight: 16,
            paddingBottom: 50,
            flex: 1,
          }}>
          {renderHeader()}

          {alternetAddressList && alternetAddressList.length > 0 && (
            <View>
              <Text
                style={[
                  commonStyle.h5,
                  {
                    marginTop: 8,
                    marginBottom: 8,
                    textAlign: 'center',
                    color: appTheme.text,
                    fontWeight: '700',
                  },
                ]}>
                {/* No Address Found */}
                {translate('address.lbl_receiver_address')}
              </Text>
              {renderItem(alternetAddressList[0], true)}
            </View>
          )}

          {addressList &&
            (addressList.length == 0 ? (
              <View>
                <Text
                  style={[
                    commonStyle.h5,
                    {marginTop: 40, textAlign: 'center', color: appTheme.text},
                  ]}>
                  {/* No Address Found */}
                  {translate('addrslist.lbl_noaddrs')}
                </Text>
              </View>
            ) : (
              <View>
                {alternetAddressList && alternetAddressList.length > 0 && (
                  <Text
                    style={[
                      commonStyle.h5,
                      {
                        marginBottom: 8,
                        textAlign: 'center',
                        color: appTheme.text,
                        fontWeight: '700',
                      },
                    ]}>
                    {/* No Address Found */}
                    {translate('address.lbl_addresses')}
                  </Text>
                )}
                {addressList.map((option, index) => {
                  return renderItem(option, false);
                })}
              </View>
            ))}
          <CustomPBar showProgress={altLoadingD} />
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
            onClosed={() => {
              getAddress();
            }}
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
                //setAddressToMap(adrs);
                setAddressToMap(AddressToMap => (AddressToMap = null));
                modalizeRefAddress.current?.close();
                //modalizeRefAddressMap.current?.open();
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
                // setCount(prevCount => prevCount + 1)
                setAddressToMap(AddressToMap => (AddressToMap = null));
                modalizeRefAddressMap.current?.close();
              }}
              CloseBottomsheet={() => {
                modalizeRefAddressMap.current?.close();
                modalizeRefAddress.current?.open();
              }}
            />
          </Modalize>
        </Portal>
      </Layout>
      <View
        style={{position: 'absolute', bottom: 0, width: '100%', padding: 16}}>
        <CustomButton
          title="address.lbl_add_new_address"
          onPress={() => {
            Helper.HandleVibration();
            setAddressToMap(AddressToMap => (AddressToMap = null));
            modalizeRefAddress.current.open();
          }}
          icon={{
            name: 'plus',
            size: 15,
            containerStyle: styles.buttons_containerStyle,
            color: ResColor.white,
          }}
          customButtonStyle={[commonStyle.btn_primary]}
        />
      </View>
    </>
  );
};
const styles = StyleSheet.create({
  buttons_containerStyle: {
    position: 'absolute',
    left: '18%',
    top: '70%',
    fontSize: 20,
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
    backgroundColor: ResColor.SmokeWhite,
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
    paddingLeft: 48,
    paddingRight: 48,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    paddingBottom: 12,
    marginTop: -5,
  },
  titleinprofile: {marginTop: 40, marginBottom: Platform.OS === 'ios' ? 0 : 30},
});

export default AddressList;
