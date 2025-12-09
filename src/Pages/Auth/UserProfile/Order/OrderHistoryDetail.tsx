import {useLazyQuery} from '@apollo/client';
import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import commonStyle from '../../../../../commonStyle';
import CustomPBar from '../../../../Components/CustomPBar';
import ProgressiveImage from '../../../../Components/ProgressiveImage';
import Helper from '../../../../Utils/Helper';
import {translate} from '../../../../locales';
import {cancelOrder, orderDetailInfo} from '../../../../Queries/queries';
import CustomHeader from '../../../../Components/CustomHeader';
import colorResource from '../../../../Utils/Colors';
import ImageResource from '../../../../Utils/Image';
import {useNavigation} from '@react-navigation/native';
import {Routes} from '../../../../Utils/NavigationRoutes';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import {AppContext} from '../../../AppContext';
import {Icon} from 'react-native-elements';
import {Linking} from 'react-native';
import 'moment/src/locale/es';
import moment from 'moment';
import CommonHandlers from './../../../../Utils/CommonHandlers';
import {useDispatch} from 'react-redux';
import {Text} from 'react-native';

const OrderHistoryDetail = props => {
  const StoreConfig_data = useSelector(
    (state: any) => state.StoreConfigReducer,
  );
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [OrderId] = useState(props.route.params.id);
  const [orderDetail, {loading, error, data}] = useLazyQuery(orderDetailInfo);
  const [
    InitcancelOrder,
    {loading: CancelLoad, error: cancelErr, data: Canceldata},
  ] = cancelOrder();
  const [cancancelOrder, setCancancelOrder] = useState(false);
  const notifaction = useSelector(
    (state: any) => state.OrderNotificationReducer,
  );

  const [statusColor, setstatusColor] = useState(colorResource.Orange);
  const [orderStatus, setorderStatus] = useState('Preparing');
  var [isPickup, setisPickup] = useState(false);
  const [orderStatusCode, setorderStatusCode] = useState('');
  const [OrderDisplayId, setOrderDisplayId] = useState('');

  useEffect(() => {
    console.log(
      `***********StoreConfig_data**************: ${JSON.stringify(
        StoreConfig_data.storeConfig.storeConfig.storeConfig
          .contact_us_phone_number,
      )}`,
    );
  }, []);

  useEffect(() => {
    console.log(
      '*************************: orderDetail : notifaction :****************************',
    );
    orderDetail({
      variables: {
        orderID: OrderId,
      },
    });
  }, [notifaction]);

  useEffect(() => {
    setOrderDisplayId(OrderId.match(/.{1,3}/g).join(' '));

    orderDetail({
      variables: {
        orderID: OrderId,
      },
    });
  }, [OrderId]);

  useEffect(() => {
    error && Helper.ShowAlert(`${error}`);
    cancelErr &&
      CommonHandlers.CommonErrorHandler(cancelErr, dispatch, navigation);
  }, [error, cancelErr]);

  useEffect(() => {
    if (Canceldata) {
      setCancancelOrder(false);

      orderDetail({
        variables: {
          orderID: OrderId,
        },
      });
      navigation.navigate(Routes.NAVIGATION_TO_ORDERCANCEL);
    }
  }, [Canceldata]);

  useEffect(() => {
    if (data) {
      console.log(JSON.stringify(data));
      data.customer.orders.items.length > 0 &&
        setorderStatus(data.customer.orders.items[0].status);
      data.customer.orders.items.length > 0 &&
        setorderStatusCode(data.customer.orders.items[0].status_code);
      data.customer.orders.items.length > 0 &&
        setisPickup(
          data.customer.orders.items[0].shipping_method.includes(
            'In-Store Pickup',
          ),
        );
      data &&
        data.customer.orders.items.length > 0 &&
        setCancancelOrder(data.customer.orders.items[0].can_cancel);
    }
  }, [data]);

  useEffect(() => {
    switch (orderStatusCode.toLowerCase()) {
      case 'finished':
        setstatusColor(colorResource.Green);
        break;
      case 'complete':
        setstatusColor(colorResource.Green);
        break;
      case 'delivered':
        setstatusColor(colorResource.Green);
        break;
      case 'canceled':
        setstatusColor(colorResource.pink_product_price);
        break;
      case 'rejected':
        setstatusColor(colorResource.pink_product_price);
        break;
      case 'on_the_way':
        setstatusColor(colorResource.DarkOrange);
        break;
      case 'ready_for_pickup':
        setstatusColor(colorResource.DarkOrange);
        break;
      case 'holded':
        setstatusColor(colorResource.DarkOrange);
        break;
      default:
        setstatusColor(colorResource.Orange);
        break;
    }
  }, [orderStatusCode]);

  const renderDom = (item: any) => {
    return (
      <View key={item.product_sku} style={styles.renderDomMainContainer}>
        <View style={styles.renderDomImageContainer}>
          <ProgressiveImage
            source={{uri: item.product_thumbnail + Helper.listImageSize}}
            style={styles.item_image}
          />
        </View>
        <View style={[commonStyle.flex_1, commonStyle.padding_8]}>
          <Text style={[commonStyle.h6, {color: appTheme.text}]}>
            {item.product_name}
          </Text>
          <View style={styles.renderDomQtyContainer}>
            <Text
              style={[
                commonStyle.h6,
                {color: appTheme.text},
                commonStyle.fontBold,
              ]}>
              {/*QTY*/} {translate('cart.lbl_qty')}: {item.quantity_ordered}
            </Text>
            <Text
              style={[
                commonStyle.h6,
                commonStyle.fontBold,
                {color: appTheme.text},
              ]}>
              {Helper.currencyFormat(
                item.product_sale_price.value * item.quantity_ordered,
              )}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  function getFormatedDate(date) {
    let trLocale = require('moment/locale/es');
    moment.updateLocale('es', trLocale);
    return moment(date).format('MMM DD, yyyy');
  }

  const Ordercancel = () => {
    Helper.HandleVibration();
    InitcancelOrder({
      variables: {
        incrementId: data.customer.orders.items[0].number,
      },
    });
  };
  const insets = useSafeAreaInsets();
  const {appTheme} = useContext(AppContext);
  const [isDark, setDark] = useState(appTheme.type === 'dark');
  useEffect(() => {
    setDark(appTheme.type === 'dark');
  }, [appTheme.type]);

  return (
    <View
      style={[styles.MainContainer, {backgroundColor: appTheme.background}]}>
      <CustomHeader
        gradientHeader={false}
        gradientHeaderOption={false}
        scrolledValue={false}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{paddingTop: insets.top, paddingBottom: insets.bottom + 20}}>
        <View style={[styles.Order_Title_Status]}>
          <Text
            style={[
              commonStyle.h2,
              commonStyle.fontBold,
              commonStyle.titlePageHeaderText,
              {marginTop: 30, color: appTheme.text},
            ]}>
            {translate('order.lbl_order')}{' '}
          </Text>
          <Text
            style={[
              styles.text_order_id,
              {
                marginTop: 30,
                color:
                  appTheme.type == 'green'
                    ? colorResource.Gray
                    : colorResource.CloseIconColor,
              },
            ]}>
            {OrderDisplayId}
          </Text>
        </View>
        {/* Main Content */}
        <View style={styles.MainViewContainer}>
          {data && data.customer.orders.items.length > 0 && (
            <View>
              <View style={styles.Order_Title_Status}>
                <Text
                  style={[styles.text_heading_text, {color: appTheme.text}]}>
                  {' '}
                  {/* Status */} {translate('order.lbl_status')}{' '}
                </Text>
                <View style={{borderRadius: 8, backgroundColor: statusColor}}>
                  <Text style={styles.text_status}>{orderStatus}</Text>
                </View>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-evenly',
                  width: '100%',
                  marginTop: 16,
                }}>
                <View
                  style={{
                    height: 4,
                    flex: isPickup ? 0.32 : 0.24,
                    borderRadius: 8,
                    backgroundColor:
                      orderStatusCode !== 'pending_payment_review' ||
                      orderStatusCode !== 'pending'
                        ? statusColor
                        : colorResource.disable_clr,
                  }}
                />
                <View
                  style={{
                    height: 4,
                    flex: isPickup ? 0.32 : 0.24,
                    borderRadius: 8,
                    backgroundColor:
                      orderStatusCode == 'delivered' ||
                      orderStatusCode == 'complete' ||
                      orderStatusCode == 'ready_for_pickup' ||
                      orderStatusCode == 'on_the_way' ||
                      orderStatusCode == 'holded' ||
                      orderStatusCode == 'preparing' ||
                      orderStatusCode == 'processing' ||
                      orderStatusCode == 'rejected' ||
                      orderStatusCode == 'canceled'
                        ? statusColor
                        : colorResource.disable_clr,
                  }}
                />
                <View
                  style={{
                    height: 4,
                    flex: isPickup ? 0.32 : 0.24,
                    borderRadius: 8,
                    backgroundColor:
                      orderStatusCode == 'complete' ||
                      orderStatusCode == 'delivered'
                        ? statusColor
                        : colorResource.disable_clr,
                  }}
                />

                {!isPickup && (
                  <View
                    style={{
                      height: 4,
                      flex: 0.24,
                      borderRadius: 8,
                      backgroundColor:
                        orderStatusCode == 'delivered' ||
                        orderStatusCode == 'complete' ||
                        orderStatusCode == 'delivered'
                          ? statusColor
                          : colorResource.disable_clr,
                    }}
                  />
                )}
              </View>

              {/* Call Section */}
              {orderStatusCode != 'complete' &&
                orderStatusCode != 'delivered' &&
                orderStatusCode != 'canceled' &&
                orderStatusCode != 'rejected' && (
                  <View style={{paddingTop: 48}}>
                    <TouchableOpacity
                      style={{
                        borderRadius: 16,
                        backgroundColor: isDark
                          ? colorResource.Green_03
                          : appTheme.type == 'green'
                          ? colorResource.Green
                          : 'rgba(0,168,107,0.09)',
                        height: 48,
                        marginTop: 8,
                        alignContent: 'center',
                        alignItems: 'center',
                      }}
                      onPress={() => {
                        Linking.openURL(
                          `tel:${StoreConfig_data.storeConfig.storeConfig.storeConfig.contact_us_phone_number}`,
                        );
                      }}>
                      <View style={{flexDirection: 'row'}}>
                        <Text
                          style={[
                            commonStyle.h5,
                            {
                              fontWeight: '700',
                              padding: 12,
                              color:
                                appTheme.type == 'green'
                                  ? colorResource.white
                                  : colorResource.Green,
                            },
                          ]}>
                          Llamar a Servicio al Cliente
                        </Text>
                        {
                          <Icon
                            style={{marginTop: 15}}
                            name="phone"
                            type="font-awesome-5"
                            size={16}
                            color={
                              appTheme.type == 'green'
                                ? colorResource.white
                                : colorResource.Green
                            }
                          />
                        }
                      </View>
                    </TouchableOpacity>
                  </View>
                )}

              {/* Order Date */}
            {/*  <View style={{paddingTop: 48}}>
                <Text
                  style={[styles.text_heading_text, {color: appTheme.text}]}>
                  {' '}
                   Date  {translate('order.lbl_date')}{' '}
                </Text>
                <View
                  style={{
                    borderRadius: 8,
                    backgroundColor: isDark
                      ? appTheme.InputBoxBGColor
                      : colorResource.SmokeWhite,
                    height: 48,
                    padding: 8,
                    marginTop: 8,
                  }}>
                  <Text
                    adjustsFontSizeToFit={true}
                    style={[
                      commonStyle.h5,
                      {fontWeight: '600', color: appTheme.text, marginTop: 4},
                    ]}>
                    {getFormatedDate(
                      data.customer.orders.items[0].delivery_date,
                    )}{' '}
                    - Recibir antes de las
                    {data.customer.orders.items[0].delivery_time
                      .split('-')[1]
                      .replace('h', ':')}
                  </Text>
                </View>
              </View>*/}

              {/* Product Listing */}
              <View style={{paddingTop: 48, paddingLeft: 10}}>
                <Text
                  style={[
                    styles.text_heading_text,
                    {textTransform: 'capitalize', color: appTheme.text},
                  ]}>
                  {/* Products */}
                  {translate('order.lbl_products')}
                </Text>
                <View style={{paddingTop: 16}}>
                  {data.customer.orders.items[0].items.map((option, index) => {
                    if (index < 4) {
                      return renderDom(option);
                    }
                  })}
                </View>
              </View>

              {/* Shipping Address */}
              {data.customer.orders.items[0].shipping_address && (
                <View style={{paddingTop: 8}}>
                  <Text
                    style={[styles.text_heading_text, {color: appTheme.text}]}>
                    {' '}
                    {/* Shipping address */}{' '}
                    {translate('order.lbl_shipping_address')}{' '}
                  </Text>
                  <View
                    style={{
                      borderRadius: 8,
                      backgroundColor: isDark
                        ? appTheme.InputBoxBGColor
                        : colorResource.SmokeWhite,
                      marginTop: 8,
                    }}>
                    <View style={styles.add_top_container}>
                      {data.customer.orders.items[0].shipping_address
                        .address_type == '1' && (
                        <View style={styles.add_inner_container}>
                          <ProgressiveImage
                            source={
                              isDark
                                ? ImageResource.ic_add_home_de_new
                                : ImageResource.ic_add_home_de
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
                      {data.customer.orders.items[0].shipping_address
                        .address_type == '2' && (
                        <View style={styles.add_inner_container}>
                          <ProgressiveImage
                            source={
                              isDark
                                ? ImageResource.ic_add_work_new
                                : ImageResource.ic_add_work
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
                      {data.customer.orders.items[0].shipping_address
                        .address_type != '1' &&
                        data.customer.orders.items[0].shipping_address
                          .address_type != '2' && (
                          <View style={styles.add_inner_container}>
                            <ProgressiveImage
                              source={
                                isDark
                                  ? ImageResource.ic_add_other_new
                                  : ImageResource.ic_add_other
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
                    </View>
                    <View style={styles.container_address}>
                      {(data.customer.orders.items[0].shipping_address
                        .firstname ||
                        data.customer.orders.items[0].shipping_address
                          .lastname) && (
                        <Text
                          style={[
                            styles.text_address_name,
                            {color: appTheme.text},
                          ]}>
                          {
                            data.customer.orders.items[0].shipping_address
                              .firstname
                          }{' '}
                          {
                            data.customer.orders.items[0].shipping_address
                              .lastname
                          }
                        </Text>
                      )}
                      {(data.customer.orders.items[0].shipping_address
                        .apartment_number ||
                        data.customer.orders.items[0].shipping_address
                          .street) && (
                        <Text
                          style={[styles.text_address, {color: appTheme.text}]}>
                          {
                            data.customer.orders.items[0].shipping_address
                              .street[0]
                          }{' '}
                          {
                            data.customer.orders.items[0].shipping_address
                              .street[1]
                          }{' '}
                          {
                            data.customer.orders.items[0].shipping_address
                              .apartment_number
                          }
                        </Text>
                      )}
                      <Text
                        style={[styles.text_address, {color: appTheme.text}]}>
                        {data.customer.orders.items[0].shipping_address.city},{' '}
                        {
                          data.customer.orders.items[0].shipping_address
                            .postcode
                        }
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Representative Address */}
              {data.customer.orders.items[0].alternateAddress && (
                <View style={{paddingTop: 8}}>
                  <Text
                    style={[styles.text_heading_text, {color: appTheme.text}]}>
                    {' '}
                    {/* Shipping address */}{' '}
                    {translate('order.lbl_representative_address')}{' '}
                  </Text>
                  <View
                    style={{
                      borderRadius: 8,
                      backgroundColor: isDark
                        ? appTheme.InputBoxBGColor
                        : colorResource.SmokeWhite,
                      marginTop: 8,
                    }}>
                    <View style={styles.add_top_container}>
                      {
                        <View style={styles.add_inner_container}>
                          <ProgressiveImage
                            source={
                              isDark
                                ? ImageResource.ic_profile
                                : ImageResource.ic_profile_dark
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
                            {translate('address.lbl_representative')}
                          </Text>
                        </View>
                      }
                    </View>
                    <View style={styles.container_address}>
                      {(data.customer.orders.items[0].alternateAddress
                        .firstname ||
                        data.customer.orders.items[0].alternateAddress
                          .lastname) && (
                        <Text
                          style={[
                            styles.text_address_name,
                            {color: appTheme.text},
                          ]}>
                          {
                            data.customer.orders.items[0].alternateAddress
                              .firstname
                          }{' '}
                          {
                            data.customer.orders.items[0].alternateAddress
                              .lastname
                          }
                        </Text>
                      )}
                      {(data.customer.orders.items[0].alternateAddress
                        .apartment_number ||
                        data.customer.orders.items[0].alternateAddress
                          .street) && (
                        <Text
                          style={[styles.text_address, {color: appTheme.text}]}>
                          {
                            data.customer.orders.items[0].alternateAddress
                              .street[0]
                          }{' '}
                          {
                            data.customer.orders.items[0].alternateAddress
                              .street[1]
                          }{' '}
                          {
                            data.customer.orders.items[0].alternateAddress
                              .apartment_number
                          }
                        </Text>
                      )}
                      <Text
                        style={[styles.text_address, {color: appTheme.text}]}>
                        {data.customer.orders.items[0].alternateAddress.city},{' '}
                        {
                          data.customer.orders.items[0].alternateAddress
                            .postcode
                        }
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Payment */}
              {data.customer.orders.items[0].payment_methods[0] && (
                <View style={{paddingTop: 48}}>
                  <Text
                    style={[
                      styles.text_heading_text,
                      {paddingLeft: 10, color: appTheme.text},
                    ]}>
                    {/* Payment */}
                    {translate('order.lbl_payment')}
                  </Text>
                  <View
                    style={{
                      borderRadius: 8,
                      backgroundColor: isDark
                        ? appTheme.InputBoxBGColor
                        : colorResource.SmokeWhite,
                      marginTop: 8,
                      flexDirection: 'row',
                      alignItems: 'center',
                      height: 50,
                    }}>
                    {data.customer.orders.items[0].payment_methods[0].type ==
                      'cashondelivery' && (
                      <ProgressiveImage
                        source={ImageResource.ic_Cash}
                        style={[
                          commonStyle.padding_10,
                          commonStyle.marginHorizontal_10,
                        ]}></ProgressiveImage>
                    )}
                    {data.customer.orders.items[0].payment_methods[0].type ==
                      'zelle' && (
                      <ProgressiveImage
                        source={ImageResource.ic_zelle}
                        style={[
                          commonStyle.padding_10,
                          commonStyle.marginHorizontal_10,
                        ]}></ProgressiveImage>
                    )}
                    {data.customer.orders.items[0].payment_methods[0].type ==
                      'hs_bank_transfer' && (
                      <ProgressiveImage
                        source={ImageResource.ic_boli}
                        style={[
                          commonStyle.padding_10,
                          commonStyle.marginHorizontal_10,
                        ]}></ProgressiveImage>
                    )}
                    {data.customer.orders.items[0].payment_methods[0].type ==
                      'movil' && (
                      <ProgressiveImage
                        source={ImageResource.ic_movil}
                        style={[
                          commonStyle.padding_10,
                          commonStyle.marginHorizontal_10,
                        ]}></ProgressiveImage>
                    )}
                    {data.customer.orders.items[0].payment_methods[0].type ==
                      'stripe_payments' && (
                      <ProgressiveImage
                        source={ImageResource.ic_Card}
                        style={[
                          commonStyle.padding_10,
                          commonStyle.marginHorizontal_10,
                        ]}></ProgressiveImage>
                    )}
                    {data.customer.orders.items[0].payment_methods[0].type ==
                      'hs_paypal' && (
                      <ProgressiveImage
                        source={ImageResource.ic_paypal}
                        style={[
                          commonStyle.padding_10,
                          commonStyle.marginHorizontal_10,
                        ]}></ProgressiveImage>
                    )}
                    <Text
                      style={[
                        commonStyle.h5,
                        commonStyle.fontSemiBold,
                        {color: appTheme.text},
                      ]}>
                      {' '}
                      {data.customer.orders.items[0].payment_methods[0].name}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}
          {!loading && data == undefined && (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                height: Dimensions.get('window').height,
              }}>
              <Text
                style={[
                  commonStyle.h5,
                  commonStyle.padding_16,
                  {color: appTheme.text},
                ]}>
                {translate('order.lbl_no_order_found')}
              </Text>
            </View>
          )}
          <CustomPBar showProgress={loading || CancelLoad} />
        </View>
        {data && data.customer.orders.items.length > 0 && (
          <View
            style={{
              marginTop: 32,
              marginBottom: Platform.OS == 'ios' ? 42 : 25,
              backgroundColor: isDark
                ? appTheme.InputBoxBGColor
                : colorResource.SmokeWhite,
              width: '100%',
            }}>
            {
              <View
                style={{
                  marginHorizontal: 16,
                  flexDirection: 'column',
                  marginTop: 10,
                }}>
                <View
                  style={[
                    {
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    },
                  ]}>
                  <Text
                    style={[
                      commonStyle.h6,
                      {color: appTheme.text, fontWeight: '600'},
                    ]}>
                    Monto inicial
                  </Text>
                  <Text style={[commonStyle.h6, {color: appTheme.text}]}>
                    {Helper.currencyFormat(
                      data.customer.orders.items[0].total.subtotal.value,
                    )}
                  </Text>
                </View>
              </View>
            }
            {data.customer.orders.items[0].total.total_shipping.value !=
              '0' && (
              <View
                style={{
                  flexDirection: 'column',
                  marginHorizontal: 16,
                  marginTop: 10,
                }}>
                <View
                  style={[
                    {
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    },
                  ]}>
                  <Text
                    style={[
                      commonStyle.h6,
                      {color: appTheme.text, fontWeight: '600'},
                    ]}>
                    {translate('checkout.lbl_deliveryfee')}{' '}
                  </Text>
                  <Text
                    style={[
                      commonStyle.h6,
                      {color: appTheme.text},
                    ]}>{`${Helper.currencyFormat(
                    data.customer.orders.items[0].total.total_shipping.value,
                  )}`}</Text>
                </View>
              </View>
            )}
            {data.customer.orders.items[0].total.payment_fee.value != '0' && (
              <View
                style={{
                  flexDirection: 'column',
                  marginHorizontal: 16,
                  marginTop: 10,
                }}>
                <View
                  style={[
                    {
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    },
                  ]}>
                  <Text
                    style={[
                      commonStyle.h6,
                      {color: appTheme.text, fontWeight: '600'},
                    ]}>
                    Servicio
                  </Text>
                  <Text
                    style={[
                      commonStyle.h6,
                      {color: appTheme.text},
                    ]}>{`${Helper.currencyFormat(
                    data.customer.orders.items[0].total.payment_fee.value,
                  )}`}</Text>
                </View>
              </View>
            )}
            {data.customer.orders.items[0].total.discounts.length > 0 && (
              <View
                style={{
                  flexDirection: 'column',
                  marginBottom: 10,
                  marginHorizontal: 16,
                  marginTop: 10,
                }}>
                <View
                  style={[
                    {
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    },
                  ]}>
                  <Text
                    style={[
                      commonStyle.h6,
                      {color: appTheme.text, fontWeight: '700'},
                    ]}>
                    Código de Descuento
                  </Text>
                  <Text
                    style={[
                      commonStyle.h6,
                      {
                        color: colorResource.pink_product_price,
                        fontWeight: '700',
                      },
                    ]}>{`${Helper.currencyFormat(
                    data.customer.orders.items[0].total.discounts[0].amount
                      .value,
                  )}`}</Text>
                </View>
              </View>
            )}
            <View
              style={{
                borderBottomColor: isDark ? 'white' : colorResource.Gray,
                borderBottomWidth: 1,
                marginTop: 5,
                marginBottom: 10,
                marginHorizontal: 16,
              }}
            />
            <View
              style={{flexDirection: 'row', margin: 12, marginHorizontal: 16}}>
              <View style={{flex: 0.45}}>
                {data.customer.orders.items[0].can_cancel && (
                  <TouchableOpacity
                    style={{
                      padding: 12,
                      backgroundColor: colorResource.cancleclr,
                      alignItems: 'center',
                      borderRadius: 16,
                    }}
                    onPress={Ordercancel}>
                    <Text
                      style={[
                        commonStyle.h5,
                        commonStyle.fontSemiBold,
                        {color: colorResource.white},
                      ]}>
                      {translate('order.lbl_cancel')}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              <View
                style={{
                  flexDirection: 'column',
                  justifyContent: 'space-evenly',
                  flex: 0.6,
                }}>
                <Text
                  style={[
                    commonStyle.h6,
                    commonStyle.fontNormal,
                    {color: colorResource.CloseIconColor, textAlign: 'right'},
                  ]}>
                  {' '}
                  {/* Total amount */}
                  {/* {translate( 'order.lbl_total_amt' )} */}
                  {translate('cart.lbl_sub_total')}
                </Text>
                <Text
                  style={[
                    commonStyle.h5,
                    commonStyle.fontBold,
                    {textAlign: 'right', color: appTheme.text},
                  ]}>
                  {Helper.currencyFormat(
                    data.customer.orders.items[0].total.grand_total.value,
                  )}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default OrderHistoryDetail;

const styles = StyleSheet.create({
  text_order_id: {
    fontSize: 20,
    lineHeight: 28,
    fontFamily: 'Gilroy-Regular',
    fontWeight: '700',
    padding: 16,
  },
  text_heading_text: {
    fontSize: 20,
    lineHeight: 28,
    fontFamily: 'Gilroy-Bold',
    fontWeight: '700',
    color: colorResource.blackShade,
    marginLeft: -10,
  },
  item_image: {
    aspectRatio: 1,
    resizeMode: 'stretch',
    borderRadius: Platform.OS === 'ios' ? 16 : 8,
    padding: 10,
    paddingVertical: 10,
    // backgroundColor: 'transparent',
    backgroundColor: colorResource.transparent,
    height: 88,
    // aspectRatio: 1, borderRadius: 26
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

  renderDomMainContainer: {
    flexDirection: 'row',
    marginHorizontal: 0,
    height: 88,
    width: '100%',
    marginBottom: 40,
  },
  renderDomImageContainer: {
    backgroundColor: colorResource.transparent,
    height: 88,
    aspectRatio: 1,
    borderRadius: 26,
  },
  renderDomQtyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  MainContainer: {flex: 1},
  Order_Title_Status: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 18,
    paddingRight: 16,
  },

  MainViewContainer: {padding: 16, flex: 1},
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
    paddingBottom: 4,
    fontWeight: '400',
  },
  text_address_name: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
    paddingBottom: 4,
    fontWeight: '600',
  },
  container_address: {
    paddingLeft: 48,
    paddingRight: 48,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    paddingBottom: 12,
  },
  type_icon: {
    width: 24,
    height: 24,
  },
});
