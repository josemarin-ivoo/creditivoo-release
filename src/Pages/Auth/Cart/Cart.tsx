import { useLazyQuery } from '@apollo/client';
import React, { useState, useEffect, useContext } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableHighlight,
  StatusBar,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';

import { SwipeListView, SwipeRow } from 'react-native-swipe-list-view';
import WheelPicker from 'react-native-wheely';
import { Icon } from 'react-native-elements';
import commonStyle from '../../../../commonStyle';
import CustomPBar from '../../../Components/CustomPBar';
import ProgressiveImage from '../../../Components/ProgressiveImage';
import { translate } from '../../../locales/translate';
import {
  applyCouponToCart,
  cartDelete,
  cartList, checkIfHighDimensionProduct,
  updateCartItemsQTY,
} from '../../../Queries/queries';
import Helper from '../../../Utils/Helper';
import ResImage from '../../../Utils/Image';
import { useDispatch, useSelector } from 'react-redux';
import { CartItemCounterAction } from '../../../redux/cartItemCounterAction';
import ResorceColor from '../../../Utils/Colors';
import { CustomButton } from '../../../Components/CustomButton';

import ResColor from '../../../Utils/Colors';
import { AppContext } from '../../AppContext';
import { removeCouponFromCart } from './../../../Queries/queries';
import CommonHandlers from './../../../Utils/CommonHandlers';
import { setDeviceId } from './../../../Queries/queries';
import PermissionHandler from './../../../Utils/PermissionHandler';
import {
  getItemFromStorage,
  getObjectFromStore,
  setObjectInStore,
} from '../../../Utils/Storage';
import { Routes } from '../../../Utils/NavigationRoutes';

import { setItemInStorage } from './../../../Utils/Storage';
import { isNeedtoUpdatePAYDATA } from './../../../redux/PaymentMethodsReducers/PaymentMethodsAction';

import { Modalize } from 'react-native-modalize';
import { ISCHECKOUTCacheUpdated } from '../../../redux/CheckoutCacheReducer/CheckoutCacheAction';
import { AnalyticsBeginCheckout } from '../../../helpers/analyticHelper';
import { TextInput } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Colors from '../../../Utils/Colors';

const Cart = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [outofstock, setoutofstock] = useState(false); //Item outof stock will get remvoe from magento side
  const [GrandTotal, setGrandTotal] = useState('');
  const [ServiceFees, setServiceFees] = useState('');
  const { appTheme } = useContext(AppContext);
  const [Input_coupon_code, setcoupon_code] = useState('');
  const [IsValidCoupon, setIsValidCoupon] = useState(false);
  const [rejectedCoupon, setrejectedCoupon] = useState(false); // Should true when COUPON code is invalid
  const [Discount, setDiscount] = useState('');
  const [minimOrderAmtValidate, setMinimumOrder] = useState(false);
  const [minimumOrderValidateMsg, setMinimumOrderValidateMsg] = useState('');
  const [checkHighDimProduct, { loading: boolean, error: highDimError, data: highDimData }] = useLazyQuery(checkIfHighDimensionProduct);
  const [isHighDimTextVisible, setIsHighDimTextVisible] = useState(true);
  const [highDimTextInfo, setHighDimTextInfo] = useState('');
  const global_data = useSelector((state: any) => state.commonReducer);

  const [CachedCartData, setCachedCartData] = useState<any>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [getCart, { loading: loadingB, data: cartListdataB }] = useLazyQuery(
    cartList,
    { errorPolicy: 'all' },
  );
  const [
    applyCouponToCartAPI,
    { loading: applyCouponLoad, error: applyCouponerror, data: applyCoupondata },
  ] = applyCouponToCart();

  const [
    removeCouponFromCartAPI,
    { loading: remLoad, error: remerr, data: removeCoupondata },
  ] = removeCouponFromCart();

  const [
    updateQTYCartAPI,
    { loading: updateQTYLoad, error: updateQTYerr, data: updateQTYdata },
  ] = updateCartItemsQTY();

  const [cartDeleteFunc, { loading, error, data }] = cartDelete();

  const [setDeviceIdonCart] = setDeviceId();

  const [toggle, setToggle] = useState(true);
  const wheelModalizeRef = React.useRef<Modalize>(null);
  const [prevState, setprevState] = useState(null);

  async function UpdateCacheExpTime(isUpdated) {
    //isUpdated     // 1 -> True     //0 -> False
    await setItemInStorage('CartCacheStatus_isUpdated', isUpdated);
    await setItemInStorage(
      'CartCacheStatus_expTime',
      Helper.addHourstoSystemDate(5).toString(),
    );
  }
  async function CHECKOUTCacheUpdated(isUpdated) {
    var expTime = new Date(new Date().setHours(new Date().getHours() + 5));
    dispatch(ISCHECKOUTCacheUpdated(isUpdated, expTime));
  }

  async function updateCache_customerCart(valuestate) {
    console.log('=======valuestate===============');
    console.log(JSON.stringify(valuestate));

    let tmpdata1 = Object.assign({}, valuestate); // creating copy of state
    let tmpdata = Object.assign({}, valuestate); // creating copy of state

    let tempList = [];
    tmpdata1.customerCart.items.map(v => {
      if (v != null) {
        tempList.push(v);
      }
    });
    tmpdata.customerCart.items = [];
    tmpdata.customerCart.items = tempList;

    var finalItemList = tmpdata1.customerCart.items.map(v => ({
      ...v,
      key: v.id,
    }));

    tmpdata.customerCart.items = [];
    tmpdata.customerCart.items = finalItemList;

    setCachedCartData(tmpdata);

    setMinimumOrder(tmpdata.customerCart.validate_order_amount[0].status);
    setMinimumOrderValidateMsg(
      tmpdata.customerCart.validate_order_amount[0].message,
    );

    await setObjectInStore('CartCacheStatus_customerCart', tmpdata);
  }

  useEffect(() => {
    updateDeviceIdonCart();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      wheelModalizeRef && wheelModalizeRef.current?.close();
      performOperation();
    });
    return unsubscribe;
  }, [navigation]);

  const performOperation = async () => {
    var dtexpTime = await getItemFromStorage('CartCacheStatus_expTime');
    var expTime = new Date(dtexpTime);

    if (expTime < new Date()) {
      console.log(expTime, ' <-- 1 -->');
      getCart();
      dispatch(isNeedtoUpdatePAYDATA(true));
    } else {
      var isUpdated = await getItemFromStorage('CartCacheStatus_isUpdated');
      console.log('isUpdated --> ', isUpdated);
      if (Number(isUpdated) == 1) {
        var CARTITEMS = await getObjectFromStore(
          'CartCacheStatus_customerCart',
        );
        setCachedCartData(CARTITEMS);
      } else {
        console.log('2');
        getCart();
        dispatch(isNeedtoUpdatePAYDATA(true)); // its to update data on Payment method listing page
      }
    }
  };

  useEffect(() => {
    if (cartListdataB) {
      console.log('cartListdataB --> ', JSON.stringify(cartListdataB));

      updateCache_customerCart(cartListdataB);
      UpdateCacheExpTime('1');
      CHECKOUTCacheUpdated(false);
    }
  }, [cartListdataB]);

  useEffect(() => {


    //Helper.ShowAlert(''+JSON.stringify(CachedCartData));

    // Cache data object
    if (CachedCartData) {



      filterArrayElementByHasError(CachedCartData.customerCart.items);
      setMinimumOrder(
        CachedCartData.customerCart.validate_order_amount[0].status,
      );
      setMinimumOrderValidateMsg(
        CachedCartData.customerCart.validate_order_amount[0].message,
      );
      if (CachedCartData.customerCart.items.length <= 0) {
        dispatch(CartItemCounterAction(false));
      } else {
        dispatch(CartItemCounterAction(true));
      }

      //console.log( '55  -- >', CachedCartData.customerCart.prices.grand_total.value )
      CachedCartData
        ? setGrandTotal(
          Helper.currencyFormat(
            CachedCartData.customerCart.prices.grand_total.value,
          ),
        )
        : setGrandTotal(Helper.currencyFormat(0));

      //console.log( '66  -- >', CachedCartData.customerCart.prices.payment_fee.value )

      CachedCartData
        ? setServiceFees(
          Helper.currencyFormat(
            CachedCartData.customerCart.prices.payment_fee.value,
          ),
        )
        : setServiceFees(Helper.currencyFormat(0));

      if (CachedCartData.customerCart.applied_coupons == null) {
        setcoupon_code('');
        setIsValidCoupon(false);
      } else {
        setoutofstock(false);

        setcoupon_code(CachedCartData.customerCart.applied_coupons[0].code);
        setIsValidCoupon(true);

        CachedCartData.customerCart.prices.discounts
          ? setDiscount(
            Helper.currencyFormat(
              CachedCartData.customerCart.prices.discounts[0].amount.value,
            ),
          )
          : setDiscount(Helper.currencyFormat(0));
      }
      apiCheckHighDimProduct();
    }
  }, [CachedCartData]);

  //#region cartDeleteById

  const apiCheckHighDimProduct = () => {

    console.log(CachedCartData.customerCart.id);

    checkHighDimProduct({
      variables: {
        cart_id: CachedCartData.customerCart.id,
      },
    });

    console.log("checkHighDimProduct api called")
  };

  const cartDeleteById = (cartId, ItemId) => {
    Helper.HandleVibration();
    cartDeleteFunc({
      variables: {
        cart_id: cartId,
        cart_item_id: ItemId,
      },
    });
  };
  useEffect(() => {
    //cartDelete
    if (data) {
      var tmp = JSON.stringify(data).replace('{"cart":', '{"customerCart":');
      setprevState(null);

      updateCache_customerCart(JSON.parse(tmp).removeItemFromCart);
      UpdateCacheExpTime('1');
      CHECKOUTCacheUpdated(false);
    }
  }, [data]);

  //#endregion

  //#region RemoveCouponCodeAPICALL

  const clearCouponCode = () => {
    Helper.HandleVibration();
    setoutofstock(false);
    setrejectedCoupon(false);
    if (IsValidCoupon) {
      RemoveCouponCodeAPICALL();
      setIsValidCoupon(false);
    } else {
      setIsValidCoupon(false);
      setcoupon_code('');
    }
  };

  const RemoveCouponCodeAPICALL = () => {
    removeCouponFromCartAPI({
      variables: {
        cart_id: CachedCartData.customerCart.id,
      },
    });
  };

  useEffect(() => {
    if (removeCoupondata) {
      // remove Coupon Just need to udpate Price and Coupon code in cache

      let tmpdata = Object.assign({}, CachedCartData); // creating copy of state
      tmpdata.customerCart.applied_coupons =
        removeCoupondata.removeCouponFromCart.cart.applied_coupons;
      tmpdata.customerCart.prices =
        removeCoupondata.removeCouponFromCart.cart.prices;
      tmpdata.customerCart.validate_order_amount =
        removeCoupondata.removeCouponFromCart.cart.validate_order_amount;

      updateCache_customerCart(tmpdata);
      UpdateCacheExpTime('1');
      CHECKOUTCacheUpdated(false);
    }
  }, [removeCoupondata]);

  //#endregion

  //#region applyCouponToCartAPI
  const CallapplyCouponToCartAPI = () => {
    Helper.HandleVibration();
    if (Input_coupon_code == '') {
      console.log('====================================');
      console.log(Input_coupon_code);
      console.log('====================================');
      //   alert(translate('order.lbl_ordervalidate'));
      return;
    }
    applyCouponToCartAPI({
      variables: {
        cart_id: CachedCartData.customerCart.id,
        coupon_code: Input_coupon_code,
      },
    });
  };

  useEffect(() => {
    if (applyCoupondata) {
      // Apply Coupon Just need to udpate Price and Coupon code in cache
      let tmpdata = Object.assign({}, CachedCartData); // creating copy of state
      tmpdata.customerCart.applied_coupons =
        applyCoupondata.applyCouponToCart.cart.applied_coupons;
      tmpdata.customerCart.prices =
        applyCoupondata.applyCouponToCart.cart.prices;
      tmpdata.customerCart.validate_order_amount =
        applyCoupondata.applyCouponToCart.cart.validate_order_amount;

      updateCache_customerCart(tmpdata);
      UpdateCacheExpTime('1');
      CHECKOUTCacheUpdated(false);
    }
  }, [applyCoupondata]);

  //#endregion

  useEffect(() => {
    if (error) {
      console.log('error');
      getCart();
      CommonHandlers.CommonErrorHandler(error, dispatch, navigation);
    } else if (remerr) {
      console.log('remerr');
      CommonHandlers.CommonErrorHandler(remerr, dispatch, navigation);
    } else if (updateQTYerr) {
      console.log('updateQTYerr');
      CommonHandlers.CommonErrorHandler(updateQTYerr, dispatch, navigation);
    } else if (applyCouponerror) {
      console.log('applyCouponerror');

      applyCouponerror &&
        Alert.alert(translate('home.lbl_alert'), applyCouponerror.message, [
          {
            text: 'OK',
            onPress: () => {
              setcoupon_code('');
              setIsValidCoupon(false);
              setrejectedCoupon(false);
              setoutofstock(false);
            },
          },
        ]);
    }
  }, [error, remerr, applyCouponerror, updateQTYerr]);

  const updateDeviceIdonCart = async () => {
    const hasPermission = await PermissionHandler.hasLocationPermission();

    if (hasPermission) {
      global_data.token && PermissionHandler.getCurrentLatLong();
    }
    const lat = Number(await getItemFromStorage('latitude'));
    const long = Number(await getItemFromStorage('longitude'));

    console.log('Cart lat long google......');

    setDeviceIdonCart({
      variables: {
        device_id: Helper.getUniqueId(),
        latitude: lat,
        longitude: long,
      },
    });
  };

  const filterArrayElementByHasError = array => {
    var has_errorob = array.filter(element => {
      return element && element.has_error === true;
    });
    has_errorob.length > 0
      ? setoutofstock(has_errorob[0].has_error)
      : setoutofstock(false);
    return has_errorob;
  };

  const [itemIdtoUpdateinCart, setItemIdtoUpdateinCart] = useState(0);

  const renderDom = (item, index) => {
    return (
      <SwipeRow leftOpenValue={0} rightOpenValue={-85} disableLeftSwipe={false}>
        <View
          style={[
            {
              alignItems: 'center',
              bottom: 0,
              justifyContent: 'center',
              position: 'absolute',
              top: 0,
              width: 85,
              backgroundColor: ResColor.disable_clr,
              right: 0,
              marginBottom: 21,
              marginLeft: 10,
            },
          ]}>
          <TouchableOpacity
            style={{ padding: 8 }}
            onPress={() => {
              console.log(CachedCartData.customerCart.id, item.id),
                console.log('=== data ===');
              cartDeleteById(CachedCartData.customerCart.id, item.id);
            }}>
            <Image source={ResImage.ic_close} resizeMode="stretch" />
          </TouchableOpacity>
        </View>
        <View
          key={index}
          style={[
            styles.renderDomContainer,
            { backgroundColor: appTheme.background },
          ]}>
          <View style={{ flex: 0.3 }}>
            <ProgressiveImage
              source={{
                uri: item.product.small_image.url + Helper.listImageSize,
              }}
              style={{ width: 88, height: 88, borderRadius: 8 }}
              resizeMode="stretch"
            />
          </View>
          <View style={{ flex: 0.7 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
              }}>
              <Text
                numberOfLines={2}
                style={[
                  commonStyle.h6,
                  { maxWidth: '90%', color: appTheme.text },
                ]}>
                {item.product.name}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center' }}
                onPress={() => {
                  setItemIdtoUpdateinCart(item.id);
                  setSelectedIndex(0);
                  wheelModalizeRef.current.open();
                }}>
                <Text
                  style={[
                    commonStyle.h6,
                    commonStyle.fontBold,
                    { color: ResColor.greenBackground, marginRight: 8 },
                  ]}>
                  {/*Qty*/}
                  {translate('cart.lbl_qty')}: {item.quantity}
                </Text>
                <Image source={ResImage.ic_arrow_down} resizeMode="stretch" />
              </TouchableOpacity>
              <View>
                <Text
                  style={[
                    commonStyle.h6,
                    commonStyle.fontBold,
                    { color: appTheme.text, marginRight: 12 },
                  ]}>
                  {Helper.currencyFormat(item.prices.row_total.value)}
                </Text>
              </View>
            </View>
            {item.has_error && (
              <View>
                <Text
                  style={[
                    commonStyle.h6,
                    commonStyle.fontBold,
                    { color: 'red' },
                  ]}>
                  {/*Qty*/}
                  {item.errors[0].message}
                </Text>
              </View>
            )}
          </View>
        </View>
      </SwipeRow>
    );
  };

  useEffect(() => {
    //Update item Qty on cart
    if (updateQTYdata) {
      var tmp = JSON.stringify(updateQTYdata).replace(
        '{"cart":',
        '{"customerCart":',
      );

      updateCache_customerCart(JSON.parse(tmp).updateCartItems);
      UpdateCacheExpTime('1');
      CHECKOUTCacheUpdated(false);
    }
  }, [updateQTYdata]);

  const renderSwipeItem = data => renderDom(data.item, data.index);

  const formatcouponCOde = textValue => {
    setoutofstock(true);
    setcoupon_code(textValue);
    setrejectedCoupon(false);
  };

  useEffect(() => {
    if (highDimData) {
      var obj = JSON.parse(JSON.stringify(highDimData));
      var isHighDimProduct: boolean = obj.highdimension[0].highdimension2.is_high_dimension;
      setIsHighDimTextVisible(isHighDimProduct);
      if (isHighDimProduct) {
        setHighDimTextInfo(obj.highdimension[0].highdimension2.text);
      } else {
        setHighDimTextInfo('');
      }
    }
  }, [highDimData]);

  useEffect(() => {
    console.log("high dim error data" + JSON.stringify(highDimError))
  }, [highDimError]);

  const handleKeyDown = () => {
    console.log('========= Enter =========');
    CallapplyCouponToCartAPI();
  };

  const Header = () => {
    return (
      <View style={headerstyles.headerContainer}>
        <View style={headerstyles.titleContainer}>
          <Text style={[commonStyle.h5,
          commonStyle.fontBold, { color: appTheme.text }]}>{translate('cart.lbl_cart_title')}</Text>
        </View>
        {/*<TouchableHighlight onPress={()=>{}} underlayColor="transparent">
            <ProgressiveImage
                source={appTheme.ic_share_new}
                style={{width: 24, height: 24, marginRight: 20}}
                resizeMode="stretch"
            />
          </TouchableHighlight>*/}
        {/* add Frodriguez Botón Wishlist (derecha) */}
        <TouchableOpacity
          onPress={() => {
            Helper.HandleVibration();
            (navigation as any).navigate(Routes.WISHTLIST);
          }}
          style={headerstyles.wishlistBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.8}>
          <Image
            source={
              (appTheme as any)?.type === 'green'
                ? ResImage.ic_wishlist_white
                : ResImage.ic_wishlist_green
            }
            style={headerstyles.wishlistIcon}
            resizeMode="stretch"
          />
        </TouchableOpacity>
        {/* end Frodriguez */}
      </View>
    );
  };

  return (
    <View
      style={[styles.mainContainer, { backgroundColor: appTheme.background }]}>
      <>
        <StatusBar
          translucent={true}
          barStyle={appTheme.statusBar}
          backgroundColor={Colors.greenBackground}
        />
        <View>
          <Header />
        </View>
        {/* <View
          style={{
            position: 'absolute',
            top: 0,
            width: '100%',
            zIndex: 99,
            backgroundColor:
              appTheme.type !== 'dark'
                ? appTheme.background
                : 'rgba(0, 0, 0, .99)',
          }}>
          <Text
            style={[
              commonStyle.h5,
              commonStyle.fontBold,
              {
                textAlign: 'center',
                color: appTheme.text,
                marginTop: Platform.OS === 'ios' ? 60 : 40,
                paddingBottom: 18,
              },
            ]}>
             Cart
            {translate('cart.lbl_cart_title')}
          </Text>
        </View>*/}

        {/*<KeyboardAwareScrollView>*/}

        <View style={{ flex: 1 }}>
          <View
            style={{
              paddingLeft: 16,
              paddingEnd: 16,
              marginBottom: 15,
            }}>
            {(CachedCartData && CachedCartData.customerCart.items.length > 0) ||
              (data && data.removeItemFromCart.cart.items > 0) ? (
              <View>
                {
                  <SwipeListView
                    disableLeftSwipe={true}
                    data={CachedCartData.customerCart.items}
                    onRowOpen={(rowKey, rowMap) => {
                      var prev = prevState;
                      if (prev != null) {
                        if (prev !== rowKey) {
                          rowMap[prev].closeRow();
                        }
                      }
                      setprevState(rowKey);
                    }}
                    renderItem={renderSwipeItem}
                    keyboardDismissMode="none"
                  />
                }
                {/* {
                  <View>
                    {isHighDimTextVisible && <Text style={styles.centeredText}>{highDimTextInfo}</Text>}
                  </View>
                } */}
                {
                  <View
                    style={{
                      borderRadius: 16,
                      marginBottom: 25,
                      flexDirection: 'row',
                      backgroundColor: IsValidCoupon
                        ? appTheme.type === 'dark'
                          ? appTheme.InputBoxBGColor
                          : ResColor.Green_06
                        : appTheme.InputBoxBGColor,
                      height: 48,
                      flex: 1,
                      alignItems: 'center',
                    }}>
                    {/* <Text style={[commonStyle.h4, commonStyle.fontBold, { color: appTheme.text, paddingRight: 16, marginBottom: 15 }]} >Ingresar código de Promo
                                        </Text> */}
                    <View
                      style={{
                        height: 48,
                        width: IsValidCoupon ? '92%' : '82%',
                      }}>
                      <TextInput
                        style={[
                          {
                            fontSize: 16,
                            textAlign: 'left',
                            height: '100%',
                            paddingLeft: 10,
                          },
                          IsValidCoupon
                            ? { fontWeight: '700', color: ResColor.Green }
                            : {
                              color: rejectedCoupon
                                ? ResColor.pink_product_price
                                : appTheme.text,
                            },
                        ]}
                        maxLength={15}
                        keyboardType="default"
                        returnKeyType="done"
                        onSubmitEditing={handleKeyDown}
                        placeholder={translate('coupon.couponPlaceholder')}
                        underlineColorAndroid="transparent"
                        value={Input_coupon_code}
                        placeholderTextColor={appTheme.placeholderTextColor}
                        textAlignVertical="center"
                        onChangeText={value => formatcouponCOde(value)}
                        autoCapitalize="characters"
                        editable={!IsValidCoupon}
                      />

                      {/* <CustomInput
                        customOStyle={[
                          {
                            fontSize: 16,
                            textAlign: 'left',
                          },
                          IsValidCoupon
                            ? {fontWeight: '700', color: ResColor.Green}
                            : {
                                color: rejectedCoupon
                                  ? ResColor.pink_product_price
                                  : appTheme.text,
                              },
                        ]}
                        maxLength={6}
                        value={Input_coupon_code}
                        inputContainerStyle={{
                          borderColor: ResColor.transparent,
                        }}
                        onKeyPress={keyPress =>
                          console.log('keyPress', keyPress)
                        }
                        placeholder={'coupon.couponPlaceholder'}
                        placeholderTextColor={appTheme.placeholderTextColor}
                        textAlignVertical="center"
                        onChangeText={value => formatcouponCOde(value)}
                        autoCapitalize="characters"
                        editable={!IsValidCoupon}
                      /> */}
                    </View>
                    {IsValidCoupon && (
                      <TouchableOpacity onPress={clearCouponCode}>
                        <Image
                          source={ResImage.ic_close}
                          resizeMode="stretch"
                        />
                      </TouchableOpacity>
                    )}
                    {/* {!IsValidCoupon && Input_coupon_code != '' && (
                      <TouchableOpacity
                        style={{}}
                        onPress={() => {
                          CallapplyCouponToCartAPI();
                        }}>
                        <ProgressiveImage
                          style={{height: 38}}
                          source={ResImage.ic_buttonplus}
                        />
                      </TouchableOpacity>
                    )} */}
                  </View>
                }
              </View>
            ) : loadingB ? null : (
              <Text
                style={[
                  commonStyle.h5,
                  {
                    color: appTheme.text,
                    textAlign: 'center',
                    paddingVertical: 8,
                  },
                ]}>
                {/* Cart is empty */}
                {translate('cart.lbl_empty_cart')}
              </Text>
            )}
          </View>
        </View>

        {/* </KeyboardAwareScrollView> */}


        {CachedCartData && CachedCartData.customerCart.items.length > 0 && (
          <View style={{ padding: 16 }}>
            {minimumOrderValidateMsg.length > 0 && (
              <Text
                style={[
                  commonStyle.h5,
                  {
                    color: 'red',
                    textAlign: 'center',
                    paddingVertical: 8,
                  },
                ]}>
                {minimumOrderValidateMsg}
              </Text>
            )}

            <View
              style={[
                {
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8,
                },
              ]}>
              <Text
                style={[
                  commonStyle.h6,
                  { color: appTheme.placeholderTextColor, fontWeight: '700' },
                ]}>
                Monto inicial
              </Text>
              <Text
                style={[
                  commonStyle.h6,
                  { color: appTheme.placeholderTextColor },
                ]}>{`${CachedCartData
                  ? Helper.currencyFormat(
                    CachedCartData.customerCart.prices.subtotal_excluding_tax
                      .value,
                  )
                  : Helper.currencyFormat(0)
                  }`}</Text>
            </View>

            {IsValidCoupon && (
              <View
                style={[
                  {
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8,
                  },
                ]}>
                <Text
                  style={[
                    commonStyle.h6,
                    { color: appTheme.placeholderTextColor, fontWeight: '700' },
                  ]}>
                  Código de Promo
                </Text>
                <Text
                  style={[
                    commonStyle.h6,
                    { color: ResColor.pink_product_price, fontWeight: '700' },
                  ]}>{`${Discount}`}</Text>
              </View>
            )}
            {ServiceFees != '$0.00' && (
              <View
                style={[
                  {
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8,
                  },
                ]}>
                <Text
                  style={[
                    commonStyle.h6,
                    { color: appTheme.placeholderTextColor, fontWeight: '700' },
                  ]}>
                  Servicio
                </Text>
                <Text
                  style={[
                    commonStyle.h6,
                    { color: appTheme.placeholderTextColor, fontWeight: '700' },
                  ]}>{`${ServiceFees}`}</Text>
              </View>
            )}
            <View
              style={{
                borderBottomColor:
                  appTheme.type === 'dark' ? 'white' : ResColor.Gray,
                borderBottomWidth: 1,
                marginTop: 5,
                marginBottom: 8,
              }}
            />
            <View
              style={[
                {
                  marginBottom: 8,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                },
              ]}>
              <Text
                style={[
                  commonStyle.h6,
                  { color: appTheme.text, fontWeight: '700' },
                ]}>
                {translate('cart.lbl_sub_total')}
              </Text>
              <Text
                style={[
                  commonStyle.h6,
                  { color: ResColor.pink_product_price, fontWeight: '700' },
                ]}>
                {GrandTotal}
              </Text>
            </View>
            <CustomButton
              title="cart.lbl_checkout"
              disabled={!minimOrderAmtValidate || outofstock}
              customButtonStyle={[
                !minimOrderAmtValidate || outofstock
                  ? commonStyle.btn_disabled
                  : commonStyle.btn_primary,
              ]}
              onPress={() => {
                Helper.HandleVibration();

                AnalyticsBeginCheckout(
                  Input_coupon_code,
                  CachedCartData,
                  global_data.email,
                );
                console.log('NAV_TO_CHECKOUT_CART', JSON.stringify(CachedCartData, null, 2));
                navigation.navigate(Routes.NAVIGATION_TO_CHECKOUT, {
                  cData: CachedCartData,
                  highDimText: highDimTextInfo,
                });
              }}
            />
          </View>
        )}
        <CustomPBar
          showProgress={
            loadingB || loading || applyCouponLoad || remLoad || updateQTYLoad
          }
        />
      </>
      <Modalize
        panGestureEnabled={false}
        tapGestureEnabled={false}
        ref={wheelModalizeRef}
        adjustToContentHeight={toggle}>
        <View
          style={[
            { backgroundColor: appTheme.background },
            appTheme.type == 'dark'
              ? null
              : { borderTopLeftRadius: 24, borderTopRightRadius: 24 },
          ]}>
          <View style={{ marginHorizontal: 24 }}>
            {
              <View style={[styles.filterHeaderContainer, { marginTop: 16 }]}>
                <View style={[{ flexGrow: 0, flexShrink: 1, flexBasis: 'auto' }]}>
                  <TouchableOpacity
                    onPress={() => {
                      Helper.HandleVibration();
                      wheelModalizeRef.current.close();
                    }}
                    style={{ padding: 5 }}>
                    <Icon
                      name="times"
                      type="font-awesome-5"
                      size={24}
                      color={
                        appTheme.type == 'dark'
                          ? ResColor.white
                          : ResColor.black
                      }
                    />
                  </TouchableOpacity>
                </View>
                <View style={[{ flex: 0.4 }]}>
                  <Text
                    style={[
                      commonStyle.h5,
                      commonStyle.fontBold,
                      { textAlign: 'right', right: -10, color: appTheme.text },
                    ]}>
                    Cantidad
                  </Text>
                </View>
                <View style={[{ flex: 0.4 }]}>
                  {
                    <TouchableHighlight
                      underlayColor="transparent"
                      onPress={() => {
                        Helper.HandleVibration();
                        wheelModalizeRef.current.close();

                        updateQTYCartAPI({
                          variables: {
                            cart_id: CachedCartData.customerCart.id,
                            cart_item_id: itemIdtoUpdateinCart,
                            quantity: selectedIndex + 1,
                          },
                        });
                      }}>
                      <Text
                        style={[
                          commonStyle.h6,
                          commonStyle.fontBold,
                          {
                            textAlign: 'right',
                            color:
                              appTheme.type == 'green'
                                ? ResorceColor.white
                                : ResColor.Green,
                          },
                        ]}>
                        {translate('orderaccepted.lbl_done')}
                      </Text>
                    </TouchableHighlight>
                  }
                </View>
              </View>
            }
            <View style={{ marginBottom: 10 }}>
              <WheelPicker
                selectedIndicatorStyle={{
                  backgroundColor: appTheme.InputBoxBGColor,
                }}
                selectedIndex={selectedIndex}
                itemTextStyle={{
                  fontSize: 18,
                  lineHeight: 28,
                  fontFamily: 'Inter-Regular',
                  color: appTheme.type == 'dark' ? 'white' : 'black`',
                }}
                // itemStyle={{ backgroundColor: 'red' }}
                options={['1', '2', '3', '4', '5']}
                onChange={index => setSelectedIndex(index)}
              />
            </View>
          </View>
        </View>
      </Modalize>
    </View>
  );
};

const styles = StyleSheet.create({
  renderDomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  mainContainer: { flex: 1, backgroundColor: ResorceColor.white },
  filterHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  centeredText: {
    textAlign: 'center',
    color: ResorceColor.cancleclr,
    marginBottom: 15,
  },

});

const headerstyles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    height: 60,
    marginTop: Platform.OS === 'ios' ? 60 : 20,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  iconContainer: {
    position: 'absolute',
    right: 10,
  },
  // added Frodriguez
  wishlistBtn: {
    position: 'absolute',
    right: 12,
    padding: 6,
    borderRadius: 16,
  },
  wishlistIcon: {
    width: 22,
    height: 22,
  },
  // ended Frodriguez
});


export default Cart;
