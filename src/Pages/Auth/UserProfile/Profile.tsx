import {useLazyQuery} from '@apollo/client';
import {useNavigation, StackActions} from '@react-navigation/native';
import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  StatusBar,
  Switch,
  Alert,
} from 'react-native';
import commonStyle from '../../../../commonStyle';
import CustomPBar from '../../../Components/CustomPBar';
import {
  logOut,
  getLatestPendingOrder,
  deleteUserAccount,
} from '../../../Queries/queries';
import ProgressiveImage from '../../../Components/ProgressiveImage';
import {
  CLEAR_ORDERED_PRODUCTS,
  DELETE_DATA,
  GLOBAL_DATA,
} from '../../../redux/actionTypes';
import {useDispatch, useSelector} from 'react-redux';
import {getApolloClient} from '../../../Queries/client';
import {translate} from '../../../locales';
import imgResources from '../../../Utils/Image';
import {Routes} from '../../../Utils/NavigationRoutes';
import ResColor from '../../../Utils/Colors';
import Helper from '../../../Utils/Helper';
import {tokenFound} from '../../../Services/service';
import CommonHandlers from '../../../Utils/CommonHandlers';
import {cartDelete} from '../../../redux/cartAction';
import {CartItemCounterAction} from '../../../redux/cartItemCounterAction';
import {version} from '../../../../package.json';
import {FavItemClear} from '../../../redux/wishlistreducers/favAction';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AppContext} from '../../AppContext';
import PermissionHandler from '../../../Utils/PermissionHandler';
import 'moment/src/locale/es';
import moment from 'moment';
import {Badge} from 'react-native-elements';
import {Clear_CARTITEMS} from './../../../redux/CartCacheReducer/CartCacheAction';
import {ClearCHECKOUT} from '../../../redux/CheckoutCacheReducer/CheckoutCacheAction';
import {DELETE_DATETIMESLOT} from './../../../redux/DateTimeSlotReducers/DateTimeSlotAction';
import {DELETE_PAYMETHODS} from './../../../redux/PaymentMethodsReducers/PaymentMethodsAction';
import {removeStoreItem, setItemInStorage} from '../../../Utils/Storage';
import {AddressClear} from '../../../redux/DeliveryAddressReducers/DeliveryAddressAction';
import {getCustomerProfileImage} from './../../../Queries/queries';

const Profile = props => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const global_data = useSelector((state: any) => state.commonReducer);
  const PushData = useSelector((state: any) => state.PushCounterReducer);
  const [PushCounter, setPushCounter] = useState(0);

  //  const [GetuserDetail, { loading, error, data }] = useLazyQuery( userDetail )
  const [userlogout, {loading: loadingL, error: errorl, data: logoutResponse}] =
    logOut();
  const [
    deleteAccount,
    {
      loading: loadingDeleteAccount,
      error: errorDeleteAccount,
      data: deleteAccountResponse,
    },
  ] = deleteUserAccount();
  const [
    getCustomerProfileImageAPI,
    {loading: ProimgLoading, error: ProimgErr, data: ProimgData},
  ] = useLazyQuery(getCustomerProfileImage);

  const [
    getOrder,
    {loading: loadPending, error: errorPending, data: dataPending},
  ] = useLazyQuery(getLatestPendingOrder, {
    variables: {pageSize: 1},
  });

  const notifaction = useSelector(
    (state: any) => state.OrderNotificationReducer,
  );

  useEffect(() => {
    console.log(
      '*************************: Home : PushCounter :****************************',
    );
    var pushcnt = PushData.PUSH_COUNTER_CHECK.filter(
      item => item.token === global_data.email,
    ).length;
    pushcnt > 0
      ? setPushCounter(
          PushData.PUSH_COUNTER_CHECK.filter(
            item => item.token === global_data.email,
          )[0].count,
        )
      : setPushCounter(0);
  }, [PushData]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      //  GetuserDetail()
      getOrder();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    global_data.profileImage == '' && getCustomerProfileImageAPI();
    tokenFound(afterTokenFound);
  }, []);

  useEffect(() => {
    if (ProimgData) {
      dispatch({
        type: GLOBAL_DATA,
        payload: {profileImage: ProimgData.getCustomerProfileImage.img},
      });
    }
  }, [ProimgData]);

  const afterTokenFound = flag => {
    //console.log( 'TokenFound ' + flag );
    flag ? null : navigation.dispatch(StackActions.replace(Routes.AUTHSCREENS));
  };

  useEffect(() => {
    getOrder();
  }, [notifaction]);

  async function resetClient() {
    const client = await getApolloClient();
    client.resetStore();
  }

  useEffect(() => {
    if (logoutResponse) {
      if (logoutResponse.revokeCustomerToken.result) {
        eraseData();
      } else {
        Helper.ShowAlert(translate('profile.msg_fail_to_logout'));
      }
    }
  }, [logoutResponse]);

  function eraseData() {
    dispatch({type: DELETE_DATA});
    resetClient();
    dispatch(cartDelete());

    dispatch({type: CLEAR_ORDERED_PRODUCTS});

    removeStoreItem('CartCacheStatus_customerCart');
    setItemInStorage('CartCacheStatus_isUpdated', '0');
    setItemInStorage('CartCacheStatus_expTime', new Date().toString());

    dispatch(ClearCHECKOUT());
    dispatch(DELETE_DATETIMESLOT());
    dispatch(DELETE_PAYMETHODS());
    dispatch(AddressClear());

    dispatch(CartItemCounterAction(false));
    dispatch(FavItemClear());

    navigation.dispatch(StackActions.replace(Routes.APPSCREENS));
  }

  const deleteAccountAPI = () => {
    Helper.HandleVibration();
    Alert.alert(
      translate('profile.title_delete_accout'),
      translate('profile.msg_delete_user_accout'),
      [
        {
          text: 'No',
          onPress: () => console.log('No Pressed'),
        },
        {text: 'Sí', onPress: () => deleteAccount()},
      ],
    );
  };

  useEffect(() => {
    if (deleteAccountResponse) {
      if (deleteAccountResponse.deleteCustomer.result) {
        //Account Deleted
        eraseData();
      } else {
        Helper.ShowAlert(deleteAccountResponse.deleteCustomer.message);
      }
    }
  }, [deleteAccountResponse]);

  useEffect(() => {
    if (errorPending) {
      CommonHandlers.CommonErrorHandler(errorPending, dispatch, navigation);
    } else if (errorl) {
      errorl && Helper.ShowAlert(`${errorl}`);
    } else if (errorDeleteAccount) {
      errorDeleteAccount && Helper.ShowAlert(`${errorDeleteAccount}`);
    }
  }, [errorPending, errorl, errorDeleteAccount]);

  const goLogout = () => {
    Helper.HandleVibration();
    userlogout({});
  };

  const navigateToNext = (screenid: number) => {
    Helper.HandleVibration();
    switch (screenid) {
      case 1:
        navigation.navigate(Routes.NAVIGATION_TO_ORDERHISTORY); //"OrderHistory"
        break;
      case 2:
        navigation.navigate(Routes.NAVIGATION_TO_ORDEREDPRODUCTS); //"OrderedProduct"
        break;
      case 3:
        //navigation.navigate(Routes.WISHTLIST, { header: true })//"Wishlist"
        break;
      case 5:
        navigation.navigate(Routes.NAVIGATION_TO_PaymentSelection, {
          cartId: '0',
          fromProfile: true,
        }); //"PaymentSelection")
        break;
      case 6:
        navigation.navigate(Routes.NAVIGATION_TO_ADDRESSLIST); //"AddressList")
        break;
      case 7:
        navigation.navigate(Routes.NAVIGATION_TO_CHANGEPASSWORDFORM); //"ChangePasswordForm")
        break;
      case 8:
        navigation.navigate(Routes.NAVIGATION_TO_CONTACTFORM); //"ContactForm")
        break;
      case 9:
        navigation.navigate(Routes.NAVIGATION_TO_NOTIFICATIONLIST);
        break;
      case 10:
        navigation.navigate(Routes.NAVIGATION_TO_UpdateUserprofile);
        break;
      case 11:
        navigation.navigate(Routes.NAVIGATION_TO_CHAT_SCREEN);
        break;
      default:
        break;
    }
  };

  function getFormatedDate(date) {
    let trLocale = require('moment/locale/es');
    moment.updateLocale('es', trLocale);
    return moment(date).format('MMM DD, yyyy');
  }

  const renderDom = (item: any) => {
    if (item.status_code) {
      var bgColor = '';
      var OrderId = item.increment_id.match(/.{1,3}/g).join(' ');
      switch (item.status_code.toLowerCase()) {
        case 'finished':
          bgColor = ResColor.Green;
          break;
        case 'complete':
          bgColor = ResColor.Green;
          break;
        case 'delivered':
          bgColor = ResColor.Green;
          break;
        case 'canceled':
          bgColor = ResColor.pink_product_price;
          break;
        case 'on_the_way':
          bgColor = ResColor.DarkOrange;
          break;
        case 'ready_for_pickup':
          bgColor = ResColor.DarkOrange;
          break;
        default:
          bgColor = ResColor.Orange;
          break;
      }
      return (
        <TouchableOpacity
          key={item.increment_id}
          style={{marginHorizontal: 0, width: '100%', marginBottom: 40}}
          onPress={() => {
            Helper.HandleVibration();
            navigation.navigate(Routes.NAVIGATION_TO_ORDERHISTORYDETAIL, {
              id: item.increment_id,
            });
          }}>
          <View
            style={[
              styles.bg_container,
              {backgroundColor: appTheme.InputBoxBGColor},
            ]}></View>
          <View>
            <View style={styles.container_images}>
              {item.items.map((option, index) => {
                if (index < 4) {
                  return renderProductDom(option, index, item.items.length);
                }
              })}
            </View>
            <View style={styles.item_status_container}>
              <View style={{borderRadius: 8, backgroundColor: bgColor}}>
                <Text style={[styles.text_status]}>{item.status}</Text>
              </View>
              <Text style={[styles.text_Time, {color: appTheme.text}]}>
                {getFormatedDate(item.order_date)}
              </Text>
            </View>
            <View style={styles.item_top_container}>
              <Text
                style={[
                  styles.text_ID,
                  {color: appTheme.text},
                ]}>{`ID: ${OrderId}`}</Text>
              <Text style={[styles.text_price, {color: appTheme.text}]}>
                {Helper.currencyFormat(item.total.grand_total.value)}
              </Text>
            </View>
            <View style={styles.item_top_container}></View>
          </View>
        </TouchableOpacity>
      );
    }
  };

  const renderProductDom = (item: any, index: number, totalCount: number) => {
    return (
      <View style={styles.item_container} key={index}>
        {(index < 3 || totalCount < 5) && (
          <ProgressiveImage
            source={{uri: item.product_small_image + Helper.listImageSize}}
            style={styles.item_image}
          />
        )}
        {totalCount > 4 && index == 3 && (
          <Text style={styles.text_item}>{`+${totalCount - 3}`} </Text>
        )}
      </View>
    );
  };

  const renderItem = item => {
    return renderDom(item);
  };
  const insets = useSafeAreaInsets();
  const {appTheme, setAppTheme} = useContext(AppContext);

  const [isDark, setDark] = useState(appTheme.type === 'dark');

  const toggleScheme = isDarkmode => {
    setDark(isDarkmode);
    isDarkmode ? setAppTheme('dark') : setAppTheme('light');
  };

  return (
    <View style={{flex: 1, backgroundColor: appTheme.background}}>
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle={appTheme.statusBar}
      />
      <ScrollView
        removeClippedSubviews={true}
        showsVerticalScrollIndicator={false}
        style={{
          padding: 16,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}>
        {
          <View>
            <View style={[commonStyle.marginBottom_30, {paddingTop: 30}]}>
              <TouchableOpacity
                style={{flexDirection: 'row', alignItems: 'center', height: 80}}
                onPress={() => navigateToNext(10)}>
                <View style={[styles.imageParentContainer]}>
                  <View
                    style={[
                      styles.imageContainer,
                      {
                        ...Platform.select({
                          ios: {
                            shadowColor: '#000',
                            shadowOffset: {width: 0, height: 2},
                            shadowOpacity: 0.8,
                            shadowRadius: 2,
                          },
                          android: {
                            elevation: 5,
                          },
                        }),
                      },
                    ]}>
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
                  </View>
                </View>

                <View style={styles.container_username}>
                  <Text style={[styles.user_name, {color: appTheme.text}]}>
                    {global_data.Fname} {global_data.Lname}
                  </Text>
                  <Text
                    style={[commonStyle.h6, {color: ResColor.CloseIconColor}]}
                    numberOfLines={1}>
                    {global_data.email}
                  </Text>
                  <Text
                    style={[commonStyle.h6, {color: ResColor.CloseIconColor}]}
                    numberOfLines={1}>
                    {global_data.phone}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            {dataPending &&
              dataPending.customer.orders.items.map((option, index) => {
                return renderItem(option);
              })}
            <View>
              <Text
                style={[
                  commonStyle.profileHeader,
                  commonStyle.fontBold,
                  {color: appTheme.text},
                ]}>
                {/* My purchases */}
                {translate('profile.lbl_mypurchases')}
              </Text>
              <View style={styles.container_cell}>
                <View style={styles.container_cell}>
                  {/* Order History */}
                  <TouchableOpacity
                    onPress={() => navigateToNext(1)}
                    style={[
                      commonStyle.profileContainer,
                      {
                        backgroundColor: appTheme.InputBoxBGColor,
                        flexDirection: 'row',
                        height: 48,
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                      },
                    ]}>
                    <View style={commonStyle.profileOptionIcons}>
                      <Image
                          source={
                            isDark
                                ? imgResources.ic_order_history_dark
                                : imgResources.ic_order_history
                          }
                        style={[commonStyle.profile_icon_image]}
                      />
                    </View>
                    <Text
                      style={[
                        commonStyle.h5,
                        {fontWeight: '600', color: appTheme.text},
                      ]}>
                      {' '}
                      {translate('order.lbl_order_history')}{' '}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      commonStyle.profileContainer,
                      styles.list_container,
                      {backgroundColor: appTheme.InputBoxBGColor},
                    ]}
                    onPress={() => navigateToNext(2)}>
                    <View style={commonStyle.profileOptionIcons}>
                      <Image
                        source={
                          isDark
                              ? imgResources.ic_order_product_dark
                              : imgResources.ic_order_product}
                        style={[commonStyle.profile_icon_image]}
                      />
                    </View>

                    <Text
                      style={[
                        commonStyle.h5,
                        {fontWeight: '600', color: appTheme.text},
                      ]}>
                      {/* Ordered products */}
                      {translate('profile.lbl_ordered_products')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View>
                <Text
                  style={[
                    commonStyle.profileHeader,
                    commonStyle.fontBold,
                    {color: appTheme.text},
                  ]}>
                  {/* My account */}
                  {translate('profile.lbl_myaccount')}
                </Text>
                <View style={styles.container_cell}>
                  {/* Notification */}
                  <TouchableOpacity
                    style={[
                      commonStyle.profileContainer,
                      styles.list_container,
                      {backgroundColor: appTheme.InputBoxBGColor},
                    ]}
                    onPress={() => navigateToNext(9)}>
                    <View style={commonStyle.profileOptionIcons}>
                      {PushCounter != 0 && (
                        <Badge
                          value={PushCounter > 9 ? '9+' : PushCounter}
                          //value={PushCounter}
                          status="error"
                          containerStyle={{
                            position: 'absolute',
                            zIndex: 9,
                            top: 4,
                            right: 4,
                          }}
                        />
                      )}
                      <Image
                        source={isDark?imgResources.ic_notification_setting_dark:imgResources.ic_notification_setting}
                        style={[commonStyle.profile_icon_image]}
                      />
                    </View>
                    <View
                      style={{
                        justifyContent: 'space-between',
                        flexDirection: 'row',
                        flex: 1,
                      }}>
                      <Text
                        style={[
                          commonStyle.h5,
                          {
                            fontWeight: '600',
                            marginTop: 2,
                            color: appTheme.text,
                            textAlignVertical: 'center',
                          },
                        ]}>
                        Notificaciones
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Theme */}
                  <View
                    style={[
                      commonStyle.profileContainer,
                      styles.list_container,
                      {backgroundColor: appTheme.InputBoxBGColor},
                    ]}>
                    <View style={commonStyle.profileOptionIcons}>
                      <Image
                          source={isDark ? imgResources.ic_theme_dark : imgResources.ic_theme_light}
                        style={[commonStyle.profile_icon_image]}
                      />
                    </View>
                    <View
                      style={{
                        justifyContent: 'space-between',
                        flexDirection: 'row',
                        flex: 1,
                      }}>
                      <Text
                        style={[
                          commonStyle.h5,
                          {
                            fontWeight: '600',
                            marginTop: 2,
                            color: appTheme.text,
                            textAlignVertical: 'center',
                          },
                        ]}>
                        {isDark ? 'Modo oscuro' : 'Modo de luz'}
                        {/* {isDark ? 'Dark mode ' : 'Light mode 🌞'} */}
                      </Text>
                      <Switch
                        trackColor={{false: '#767577', true: '#3A5B4B'}}
                        thumbColor={ResColor.Green}
                        style={{
                          marginRight: 15,
                          transform: [
                            {scaleX: Platform.OS == 'ios' ? 0.7 : 0.9},
                            {scaleY: Platform.OS == 'ios' ? 0.7 : 0.9},
                          ],
                        }}
                        value={isDark}
                        onValueChange={toggleScheme}
                      />
                    </View>
                  </View>

                  {/* Addresses */}
                  <TouchableOpacity
                    style={[
                      commonStyle.profileContainer,
                      styles.list_container,
                      {backgroundColor: appTheme.InputBoxBGColor},
                    ]}
                    onPress={() => navigateToNext(6)}>
                    <View style={commonStyle.profileOptionIcons}>
                      <Image
                        source={isDark?imgResources.ic_profile_address_dark:imgResources.ic_profile_address}
                        style={[commonStyle.profile_icon_image]}
                      />
                    </View>

                    <Text
                      style={[
                        commonStyle.h5,
                        {fontWeight: '600', color: appTheme.text},
                      ]}>
                      {/* Addresses */}
                      {translate('address.lbl_addresses')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      commonStyle.profileContainer,
                      styles.list_container,
                      {backgroundColor: appTheme.InputBoxBGColor},
                    ]}
                    onPress={() => navigateToNext(5)}>
                    <View style={commonStyle.profileOptionIcons}>
                      <Image
                        source={isDark?imgResources.ic_profile_cc_dark:imgResources.ic_profile_cc}
                        style={[commonStyle.profile_icon_image]}
                      />
                    </View>

                    <Text
                      style={[
                        commonStyle.h5,
                        {fontWeight: '600', color: appTheme.text},
                      ]}>
                      {/* Credit Cards */}
                      {translate('profile.lbl_credit_card')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      commonStyle.profileContainer,
                      styles.list_container,
                      {backgroundColor: appTheme.InputBoxBGColor},
                    ]}
                    onPress={() => navigateToNext(7)}>
                    <View style={commonStyle.profileOptionIcons}>
                      <Image
                        source={isDark?imgResources.ic_profile_changepassword_dark:imgResources.ic_profile_changepassword}
                        style={[commonStyle.profile_icon_image]}
                      />
                    </View>

                    <Text
                      style={[
                        commonStyle.h5,
                        {fontWeight: '600', color: appTheme.text},
                      ]}>
                      {/* Change Password */}
                      {translate('profile.lbl_change_pwd')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      commonStyle.profileContainer,
                      styles.list_container,
                      {backgroundColor: appTheme.InputBoxBGColor},
                    ]}
                    onPress={async () => {
                      PermissionHandler.openSetting();
                    }}>
                    <View style={commonStyle.profileOptionIcons}>
                      <Image
                          source={isDark ? imgResources.ic_profile_permision_dark : imgResources.ic_profile_permision}
                          style={[commonStyle.profile_icon_image]}
                      />
                    </View>

                    <Text
                      style={[
                        commonStyle.h5,
                        {fontWeight: '600', color: appTheme.text},
                      ]}>
                      {/* Change Permission */}
                      {translate('profile.lbl_change_permision')}
                    </Text>
                  </TouchableOpacity>
                  {/* Delete Account */}
                  <TouchableOpacity
                    onPress={deleteAccountAPI}
                    style={[
                      commonStyle.profileContainer,
                      styles.list_container,
                      {backgroundColor: appTheme.InputBoxBGColor},
                    ]}>
                    <View style={commonStyle.profileOptionIcons}>
                      <Image
                        source={isDark?imgResources.ic_delete_account_dark:imgResources.ic_delete_account_light}
                        style={[commonStyle.profile_icon_image]}
                      />
                    </View>
                    <Text
                      style={[
                        commonStyle.h5,
                        {fontWeight: '600', color: appTheme.text},
                      ]}>
                      {/* Logout */}
                      {translate('profile.lbl_delete_accout')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View>
                <Text
                  style={[
                    commonStyle.profileHeader,
                    commonStyle.fontBold,
                    {marginTop: 40, color: appTheme.text},
                  ]}>
                  {/* Contact */}
                  {translate('profile.lbl_contact')}
                </Text>
                <View style={styles.container_cell}>
                  <TouchableOpacity
                      style={[
                        commonStyle.profileContainer,
                        {
                          flexDirection: 'row',
                          height: 48,
                          justifyContent: 'flex-start',
                          alignItems: 'center',
                          backgroundColor: appTheme.InputBoxBGColor,
                          marginBottom:16,
                        },
                      ]}
                      onPress={() => navigateToNext(11)}>
                    <View style={commonStyle.profileOptionIcons}>
                      <Image
                          source={isDark
                              ? imgResources.ic_chat_dark : imgResources.ic_chat}
                          style={[commonStyle.profile_icon_image]}
                      />
                    </View>

                    <Text
                        style={[
                          commonStyle.h5,
                          {fontWeight: '600', color: appTheme.text},
                        ]}>
                      {/* Contact form */}
                      {translate('profile.lbl_chat')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      commonStyle.profileContainer,
                      {
                        flexDirection: 'row',
                        height: 48,
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        backgroundColor: appTheme.InputBoxBGColor,
                      },
                    ]}
                    onPress={() => navigateToNext(8)}>
                    <View style={commonStyle.profileOptionIcons}>
                      <Image
                        source={isDark?imgResources.ic_profile_contactform_dark:imgResources.ic_profile_contactform}
                        style={[commonStyle.profile_icon_image]}
                      />
                    </View>

                    <Text
                      style={[
                        commonStyle.h5,
                        {fontWeight: '600', color: appTheme.text},
                      ]}>
                      {/* Contact form */}
                      {translate('profile.lbl_contact_form')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => goLogout()}
                    style={[
                      commonStyle.profileContainer,
                      {
                        flexDirection: 'row',
                        height: 48,
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        marginTop: 40,
                        marginBottom: 30,
                        backgroundColor: appTheme.InputBoxBGColor,
                      },
                    ]}>
                    <View style={commonStyle.profileOptionIcons}>
                      <Image
                        source={imgResources.ic_profile_logout}
                        style={[commonStyle.profile_icon_image]}
                      />
                    </View>

                    <Text
                      style={[
                        commonStyle.h5,
                        {fontWeight: '600', color: ResColor.pink_product_price},
                      ]}>
                      {/* Logout */}
                      {translate('profile.lbl_logout')}
                    </Text>
                  </TouchableOpacity>
                  <Text
                    style={{
                      marginBottom: Platform.OS == 'ios' ? 55 : 25,
                      textAlign: 'right',
                      color: appTheme.text,
                    }}>
                    {translate('lbl_version') + ' : ' + version}{' '}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        }
        <CustomPBar showProgress={loadingL || loadingDeleteAccount} />
      </ScrollView>
    </View>
  );
};
export default Profile;

const styles = StyleSheet.create({
  imageParentContainer: {
    marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    elevation: 2,
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.43,
    shadowRadius: 9.51,
    elevation: 15,
  },
  topimage: {
    height: 80,
    width: 80,
    borderRadius: 60,
    alignSelf: 'center',
    resizeMode: 'cover',
  },
  user_name: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    lineHeight: 28,
  },

  list_container: {
    flexDirection: 'row',
    height: 48,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 16,
  },
  profile_image: {
    height: 64,
    width: 64,
    backgroundColor: ResColor.inactiveDots,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },

  container_username: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    padding: 24,
  },
  container_cell: {
    flexDirection: 'column',
    paddingVertical: 16,
  },

  item_container: {
    marginLeft: 16,

    borderRadius: Platform.OS === 'ios' ? 16 : 16,
    width: 68,
    aspectRatio: 1,
    shadowColor: 'black',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: {width: 0, height: 0},
    backgroundColor: ResColor.transparent,
    justifyContent: 'center',
  },
  text_item: {
    lineHeight: 28,
    fontSize: 18,
    color: 'rgba(36, 43, 45, 1)',
    fontWeight: '600',
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
  },
  bg_container: {
    backgroundColor: ResColor.SmokeWhite,
    borderRadius: 16,
    height: 140,
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
  container_images: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  item_status_container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 16,
    marginTop: 20,
    marginBottom: 4,
  },
  text_status: {
    lineHeight: 16,
    padding: 8,
    fontSize: 11,
    textTransform: 'uppercase',
    color: 'white',
    fontWeight: '700',
    fontFamily: 'Inter-Regular',
  },
  text_Time: {
    lineHeight: 16,
    fontSize: 11,
    paddingLeft: 10,
    color: ResColor.blackShade,
    fontWeight: '700',
    fontFamily: 'Inter-Regular',
  },
  text_ID: {
    lineHeight: 24,
    fontSize: 16,
    color: ResColor.blackShade,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
  },
  text_price: {
    lineHeight: 24,
    fontSize: 16,
    color: ResColor.blackShade,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
  },
  item_top_container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 16,
    marginTop: 8,
    marginBottom: 4,
  },
  item_image: {
    aspectRatio: 1,
    resizeMode: 'stretch',
    borderRadius: Platform.OS === 'ios' ? 16 : 16,

    backgroundColor: 'transparent',
  },
});
