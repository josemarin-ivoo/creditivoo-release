import {useNavigation} from '@react-navigation/native';
import React, {useContext, useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TouchableHighlight,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import commonStyle from '../../../../../commonStyle';
import ProgressiveImage from '../../../../Components/ProgressiveImage';
import {useDispatch, useSelector} from 'react-redux';
import {translate} from '../../../../locales';
import ResImage from '../../../../Utils/Image';
import colorResource from '../../../../Utils/Colors';
import {Icon, Image} from 'react-native-elements';
import {
  deleteCard,
  GetCards,
  getPaymentMethods,
  setPaymentMethodOnCartCod,
  setPaymentMethodOnCartstripe,
} from './../../../../Queries/queries';
import CustomPBar from '../../../../Components/CustomPBar';
import base64 from 'react-native-base64';
import {useLazyQuery} from '@apollo/client';
import {Modalize} from 'react-native-modalize';
import {Portal} from 'react-native-portalize';
import AddPaymentMethod from './AddPaymentMethod';
import Helper from '../../../../Utils/Helper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import NewPaySlips from './NewPaySlips';
import {AppContext} from '../../../AppContext';
import {
  AddPAYCards,
  PAYMETHODSAdd,
  ISPAYMETHODSCacheUpdated,
} from './../../../../redux/PaymentMethodsReducers/PaymentMethodsAction';
import {
  getObjectFromStore,
  setItemInStorage,
} from './../../../../Utils/Storage';

function renderTitle(isDark: boolean, title: any) {
  return (
    <View
      style={{
        marginHorizontal: 12,
        height: 25,
        alignContent: 'center',
      }}>
      <Text
        numberOfLines={1}
        style={[
          commonStyle.h5,
          commonStyle.fontBold,
          {
            justifyContent: 'center',
            textAlignVertical: 'center',
            color: isDark ? colorResource.disable_clr : colorResource.black,
            flexShrink: 1,
            marginTop: 0,
          },
        ]}>
        {title}
      </Text>
    </View>
  );
}

const PaymentSelection = props => {
  const navigation = useNavigation();
  const {appTheme} = useContext<any>(AppContext);

  const PaymentMethodsReducers = useSelector(
    (state: any) => state.PaymentMethodsReducers,
  );
  const dispatch = useDispatch();

  // const [cartID, setCartId] = useState( props.cartId );
  const [PayCardData, setPayCardData] = useState(null);
  const [CachedcardData, setCachedcardData] = useState<any>(null);
  const [CachedpayMethodData, setCachedpayMethodData] = useState<any>(null);

  const [GetCardsD, {error, data: cardData}] = useLazyQuery(GetCards);
  const [setCod, {loading: codLoading, error: codError, data: codData}] =
    setPaymentMethodOnCartCod();
  const [setstripe, {loading: strpLoading, error: strpError, data: strpData}] =
    setPaymentMethodOnCartstripe();
  const [
    DelCardAPI,
    {loading: DelCardLoading, error: DelCardError, data: DelCardData},
  ] = deleteCard();

  const [getPaymentMethodsAPI, {error: payMethodError, data: payMethodData}] =
    useLazyQuery(getPaymentMethods);

  const modalizeRefNewPayment = React.useRef<Modalize>(null);
  const modalizeRefNewPaySlips = React.useRef<Modalize>(null);
  const [payType, setPayType] = useState('');

  function UpdateCacheExpTime(isUpdated, forceUpdate) {
    var expTime = new Date().setMinutes(new Date().getMinutes() + 30);
    dispatch(ISPAYMETHODSCacheUpdated(isUpdated, expTime, forceUpdate));
  }

  useEffect(() => {
    var expTime = new Date(PaymentMethodsReducers.expTime);
    var date2 = new Date();
    if (expTime.getTime() < date2.getTime()) {
      GetCardsD();
    } else {
      if (
        !PaymentMethodsReducers.isNeedtoUpdateDATA &&
        PaymentMethodsReducers.isUpdated
      ) {
        setCachedpayMethodData(PaymentMethodsReducers.PAYMethodsData);
        setCachedcardData(PaymentMethodsReducers.CardsData);
      } else {
        setTimeout(async () => {
          var CARTITEMS = await getObjectFromStore(
            'CartCacheStatus_customerCart',
          );
          setCachedpayMethodData(CARTITEMS);
        }, 10);
        GetCardsD();
      }
    }
  }, []);

  useEffect(() => {
    if (
      !PaymentMethodsReducers.isNeedtoUpdateDATA &&
      PaymentMethodsReducers.isUpdated
    ) {
      setCachedpayMethodData(PaymentMethodsReducers.PAYMethodsData);
      setCachedcardData(PaymentMethodsReducers.CardsData);
    } else {
      console.log('Online Calleed --');
      GetCardsD();
    }
  }, [PaymentMethodsReducers]);

  useEffect(() => {
    if (cardData) {
      console.log('cardData -->', cardData);
      getPaymentMethodsAPI();

      setCachedcardData(cardData);
      UpdateCacheExpTime(true, false);
      dispatch(AddPAYCards(cardData));
    }
  }, [cardData]);

  useEffect(() => {
    if (payMethodData) {
      console.log('payMethodData --> ', JSON.stringify(payMethodData));
      setCachedpayMethodData(payMethodData);

      dispatch(PAYMETHODSAdd(payMethodData));
    }
  }, [payMethodData]);

  //#region getPaymentDetailsAPI
  useEffect(() => {
    payType != '' && modalizeRefNewPaySlips.current?.open();
  }, [payType]);

  //#endregion

  useEffect(() => {
    if (DelCardData) {
      console.log('====== DelCardData ======');
      console.log(JSON.stringify(DelCardData));
      UpdateCacheExpTime(false, true);
    }
  }, [DelCardData]);

  useEffect(() => {
    if (error) {
      UpdateCacheExpTime(false, false);
      Helper.ShowAlert(`${error}`);
    } else if (strpError) {
      Helper.ShowAlert(`${strpError}`);
    } else if (codError) {
      Helper.ShowAlert(`${codError}`);
    } else if (payMethodError) {
      UpdateCacheExpTime(false, false);
      Helper.ShowAlert(`${payMethodError}`);
    } else if (DelCardError) {
      UpdateCacheExpTime(false, true);
      Helper.ShowAlert(`${DelCardError}`);
    }
  }, [error, strpError, codError, payMethodError, DelCardError]);

  const setCODOption = () => {
    Helper.HandleVibration();
    setCod({
      variables: {
        cart_id: props.cartId,
        payment_methodCode: 'cashondelivery',
      },
    });
  };

  //setPaymentMethodOnCartCod
  useEffect(() => {
    if (codData) {
      if (codData.setPaymentMethodOnCart) {
        paymentselected('cash', null);
      }
    }
  }, [codData]);

  const setstripeOption = itemMarker => {
    if (!props?.route?.params?.fromProfile) {
      setPayCardData(itemMarker);
      let cc_token = base64.decode(itemMarker.id);
      let cardNumber = itemMarker.card_number.replace(
        /[&\/\\#,+()$~%.'":*?<>{}]/g,
        '',
      );
      let cc_final_token = cc_token + ':' + itemMarker.brand + ':' + cardNumber;
      setstripe({
        variables: {
          cart_id: props.cartId,
          payment_methodCode: 'stripe_payments',
          cc_save: true,
          cc_stripejs_token: cc_final_token,
        },
      });
    }
  };

  useEffect(() => {
    if (strpData) {
      if (strpData.setPaymentMethodOnCart.cart) {
        paymentselected('card', PayCardData);
      }
    }
  }, [strpData]);

  const paymentselected = (type: any, details) => {
    if (!props?.route?.params?.fromProfile) {
      props.CloseBottomsheet(type, details);
    }
  };

  const renderDom = (itemMarker: any, index) => {
    let img = ResImage.ic_Card;
    switch (itemMarker.brand) {
      case 'visa':
        img = ResImage.ic_visa;
        break;
      case 'mastercard':
        img = ResImage.ic_mastercard;
        break;
      case 'amex':
        img = ResImage.ic_amex;
        break;
      default:
        img = ResImage.ic_Card;
        break;
    }

    return (
      <TouchableOpacity
        key={index}
        onPress={() => {
          Helper.HandleVibration();
          setstripeOption(itemMarker);
        }}>
        <View
          style={[
            styles.itemContainer,
            {
              backgroundColor: appTheme.InputBoxBGColor,
            },
          ]}>
          <View style={{flexDirection: 'row'}}>
            <ProgressiveImage
              source={img}
              style={[commonStyle.paddingRight_8, commonStyle.marginTop_8]}
            />
            <View style={{flex: 0.9}}>
              <Text
                style={[
                  commonStyle.h5,
                  commonStyle.fontBold,
                  commonStyle.paddingLeft_10,
                  {
                    color: appTheme.text,
                    justifyContent: 'center',
                    textAlignVertical: 'center',
                    alignItems: 'center',
                    textTransform: 'capitalize',
                  },
                  Platform.OS == 'ios' ? {marginTop: 5} : {},
                ]}>
                {itemMarker.brand}
              </Text>
              <Text
                style={[
                  commonStyle.h6,
                  commonStyle.fontNormal,
                  styles.cardNumberText,
                  {
                    color:
                      appTheme.type === 'dark'
                        ? colorResource.disable_clr
                        : colorResource.Gray,
                  },
                ]}>
                {itemMarker.card_number}
              </Text>
            </View>
            {props?.route?.params?.fromProfile && (
              <TouchableOpacity
                style={{padding: 8, flex: 0.1, backgroundColor: 'transparent'}}
                onPress={() => {
                  Alert.alert(
                    '¡¡Confirmar!!',
                    '¿Estás seguro de que quieres eliminar esta tarjeta?',
                    [
                      {
                        text: 'No',
                        style: 'cancel',
                      },
                      {
                        text: 'sí',
                        onPress: () => {
                          DelCardAPI({
                            variables: {
                              id: itemMarker.id,
                            },
                          });
                        },
                      },
                    ],
                  );
                }}>
                <Image
                  style={{width: 25, height: 25}}
                  source={ResImage.ic_close_red}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.mainContainer,
        {backgroundColor: appTheme.background},
        appTheme.type === 'dark'
          ? null
          : {borderTopLeftRadius: 24, borderTopRightRadius: 24},
      ]}>
      {props?.route?.params?.fromProfile ? (
        <View style={styles.ButtonViewStylesProfile}>
          <TouchableHighlight
            style={{paddingRight: 10, paddingLeft: 10}}
            onPress={() => {
              Helper.HandleVibration();
              navigation.goBack();
            }}
            underlayColor={colorResource.transparent}>
            <Icon
              name="arrow-left"
              type="font-awesome-5"
              color={
                appTheme.type === 'dark'
                  ? colorResource.white
                  : colorResource.black
              }
              onPress={() => {
                Helper.HandleVibration();
                navigation.goBack();
              }}
            />
          </TouchableHighlight>
        </View>
      ) : (
        <View style={styles.headerWrap}>
          <View style={[styles.ButtonViewStyles, {marginLeft: -13}]}>
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
                color={
                  appTheme.type === 'dark'
                    ? colorResource.white
                    : colorResource.black
                }
              />
            </TouchableHighlight>
          </View>
        </View>
      )}

      <StatusBar
        translucent={true}
        backgroundColor={colorResource.transparent}
        barStyle={appTheme.type === 'dark' ? 'light-content' : 'dark-content'}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{
          height: 0,
          paddingTop: props?.route?.params?.fromProfile
            ? Platform.OS === 'ios'
              ? insets.top + 15
              : insets.top
            : 0,
          paddingBottom: props?.route?.params?.fromProfile ? insets.bottom : 0,
        }}>
        <Text
          style={[
            commonStyle.h2,
            commonStyle.fontBold,
            props?.route?.params?.fromProfile
              ? styles.titleTextwithpage
              : styles.titleTextwithmodal,
            {color: appTheme.text},
          ]}>
          {props?.route?.params?.fromProfile
            ? translate('profile.lbl_credit_card')
            : translate('order.lbl_payment')}
        </Text>

        {/* Credit Card */}
        {CachedpayMethodData &&
          CachedpayMethodData.customerCart.available_payment_methods.some(
            item => 'stripe_payments' === item.code,
          ) && (
            <>
              <TouchableOpacity
                onPress={() => {
                  Helper.HandleVibration();
                  props?.route?.params?.fromProfile
                    ? modalizeRefNewPayment.current?.open()
                    : props.openAddpay();
                }}>
                <View
                  style={[
                    styles.itemContainer,
                    {
                      backgroundColor: appTheme.InputBoxBGColor,
                    },
                  ]}>
                  <View style={{flexDirection: 'row'}}>
                    <ProgressiveImage
                      source={ResImage.ic_Card}
                      style={[commonStyle.paddingRight_8]}></ProgressiveImage>
                    <Text
                      style={[
                        commonStyle.h5,
                        commonStyle.fontBold,
                        commonStyle.paddingLeft_10,
                        {
                          color: appTheme.text,
                          justifyContent: 'center',
                          textAlignVertical: 'center',
                          alignItems: 'center',
                          textTransform: 'capitalize',
                          width: '85%',
                        },
                        Platform.OS == 'ios' ? {marginTop: 5} : {},
                      ]}>
                      {translate('payment.lbl_add_pay_method')}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
              {CachedcardData &&
                CachedcardData.cardList &&
                CachedcardData.cardList.map((itemMarker, index) =>
                  renderDom(itemMarker, index),
                )}
            </>
          )}
        {/* In Cash payment */}
        {CachedpayMethodData &&
          CachedpayMethodData.customerCart.available_payment_methods.some(
            item => 'cashondelivery' === item.code,
          ) &&
          !props?.route?.params?.fromProfile && (
            <TouchableOpacity onPress={setCODOption}>
              <View
                style={[
                  styles.itemContainer,
                  {
                    backgroundColor: appTheme.InputBoxBGColor,
                    flex: 1,
                    alignItems: 'center',
                    height: 72,
                  },
                ]}>
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                  }}>
                  <ProgressiveImage
                    resizeMode={'cover'}
                    source={ResImage.ic_Cash}
                    style={[commonStyle.paddingRight_8]}
                  />
                  <View style={{marginTop: 6}}>
                    {renderTitle(
                      appTheme.type === 'dark',
                      CachedpayMethodData.customerCart.available_payment_methods.find(
                        item => 'cashondelivery' === item.code,
                      )?.title,
                    )}
                  </View>
                  {/* {renderPaymentItem(
                    appTheme,
                    CachedpayMethodData,
                    ResImage.ic_Cash,
                  )} */}
                </View>
              </View>
            </TouchableOpacity>
          )}
        {/* Zelle */}
        {CachedpayMethodData &&
          CachedpayMethodData.customerCart.available_payment_methods.some(
            item => 'zelle' === item.code,
          ) &&
          !props?.route?.params?.fromProfile && (
            <TouchableOpacity
              onPress={() => {
                Helper.HandleVibration();
                setPayType('zelle');
              }}>
              <View
                style={[
                  styles.itemContainer,
                  {
                    backgroundColor: appTheme.InputBoxBGColor,
                    flex: 1,
                    alignItems: 'center',
                    height: 72,
                  },
                ]}>
                <View style={{flex: 1, flexDirection: 'row'}}>
                  <ProgressiveImage
                    resizeMode={'cover'}
                    source={ResImage.ic_zelle}
                    style={[commonStyle.paddingRight_8]}
                  />

                  <View style={{marginTop: 6}}>
                    {renderTitle(
                      appTheme.type === 'dark',
                      CachedpayMethodData.customerCart.available_payment_methods.find(
                        item => 'zelle' === item.code,
                      )?.title,
                    )}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
        {/* Banesco Panamá*/}
        {CachedpayMethodData &&
          CachedpayMethodData.customerCart.available_payment_methods.some(
            item => 'banesco' === item.code,
          ) &&
          !props?.route?.params?.fromProfile && (
            <TouchableOpacity
              onPress={() => {
                Helper.HandleVibration();
                setPayType('banesco');
              }}>
              <View
                style={[
                  styles.itemContainer,
                  {
                    backgroundColor: appTheme.InputBoxBGColor,
                    flex: 1,
                    alignItems: 'center',
                    height: 72,
                  },
                ]}>
                <View style={{flex: 1, flexDirection: 'row'}}>
                  <ProgressiveImage
                    resizeMode={'cover'}
                    source={ResImage.ic_banesco}
                    style={[commonStyle.paddingRight_8]}
                  />

                  <View style={{marginTop: 6}}>
                    {renderTitle(
                      appTheme.type === 'dark',
                      CachedpayMethodData.customerCart.available_payment_methods.find(
                        item => 'banesco' === item.code,
                      )?.title,
                    )}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
        {/* Paypal */}
        {CachedpayMethodData &&
          CachedpayMethodData.customerCart.available_payment_methods.some(
            item => 'hs_paypal' === item.code,
          ) &&
          !props?.route?.params?.fromProfile && (
            <TouchableOpacity
              onPress={() => {
                Helper.HandleVibration();
                setPayType('hs_paypal');
              }}>
              <View
                style={[
                  styles.itemContainer,
                  {
                    backgroundColor: appTheme.InputBoxBGColor,
                    flex: 1,
                    alignItems: 'center',
                    height: 72,
                  },
                ]}>
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                  }}>
                  <ProgressiveImage
                    resizeMode={'cover'}
                    source={ResImage.ic_paypal}
                    style={[commonStyle.paddingRight_8]}
                  />
                  <View style={{marginTop: 6}}>
                    {renderTitle(
                      appTheme.type === 'dark',
                      CachedpayMethodData.customerCart.available_payment_methods.find(
                        item => 'hs_paypal' === item.code,
                      )?.title,
                    )}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
        {/* Movil */}
        {CachedpayMethodData &&
          CachedpayMethodData.customerCart.available_payment_methods.some(
            item => 'movil' === item.code,
          ) &&
          !props?.route?.params?.fromProfile && (
            <TouchableOpacity
              onPress={() => {
                Helper.HandleVibration();
                setPayType('movil');
              }}>
              <View
                style={[
                  styles.itemContainer,
                  {
                    backgroundColor: appTheme.InputBoxBGColor,
                    flex: 1,
                    alignItems: 'center',
                    height: 72,
                  },
                ]}>
                <View style={{flex: 1, flexDirection: 'row'}}>
                  <ProgressiveImage
                    source={ResImage.ic_movil}
                    style={[commonStyle.paddingRight_8, commonStyle.he_wi_40]}
                  />
                  <View style={{marginTop: 6}}>
                    {renderTitle(
                      appTheme.type === 'dark',
                      CachedpayMethodData.customerCart.available_payment_methods.find(
                        item => 'movil' === item.code,
                      )?.title,
                    )}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
        {/* Bolivares */}
        {CachedpayMethodData &&
          CachedpayMethodData.customerCart.available_payment_methods.some(
            item => 'hs_bank_transfer' === item.code,
          ) &&
          !props?.route?.params?.fromProfile && (
            <TouchableOpacity
              onPress={() => {
                Helper.HandleVibration();
                setPayType('hs_bank_transfer');
              }}>
              <View
                style={[
                  styles.itemContainer,
                  {
                    backgroundColor: appTheme.InputBoxBGColor,
                    flex: 1,
                    alignItems: 'center',
                    height: 72,
                  },
                ]}>
                <View style={{flex: 1, flexDirection: 'row'}}>
                  <ProgressiveImage
                    resizeMode={'cover'}
                    source={ResImage.ic_boli}
                    style={[{marginLeft: 8}]}
                    // style={[commonStyle.paddingRight_8, commonStyle.he_wi_24]}
                  />
                  {renderTitle(
                    appTheme.type === 'dark',
                    CachedpayMethodData.customerCart.available_payment_methods.find(
                      item => 'hs_bank_transfer' === item.code,
                    )?.title,
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
      </ScrollView>

      <Portal>
        <Modalize
          panGestureEnabled={false}
          modalTopOffset={StatusBar.currentHeight + 20}
          ref={modalizeRefNewPayment}
          scrollViewProps={{
            scrollEnabled: false,
            contentContainerStyle: {height: '100%'},
          }}>
          <AddPaymentMethod
            CloseBottomsheet={() => modalizeRefNewPayment.current?.close()}
          />
        </Modalize>
      </Portal>

      <Portal>
        <Modalize
          panGestureEnabled={false}
          modalTopOffset={StatusBar.currentHeight + 20}
          ref={modalizeRefNewPaySlips}
          onClose={() => {
            setPayType('');
          }}
          scrollViewProps={{
            scrollEnabled: false,
            contentContainerStyle: {height: '100%'},
          }}>
          <NewPaySlips
            payType={payType}
            payMethodData={CachedpayMethodData}
            cartid={props.cartId}
            CardSaved={async t => {
              await setItemInStorage('CartCacheStatus_isUpdated', '0');
              await setItemInStorage(
                'CartCacheStatus_expTime',
                Helper.addHourstoSystemDate(5).toString(),
              );

              modalizeRefNewPaySlips.current?.close();
              props.CloseBottomsheet(t, null);
            }}
            CloseBottomsheet={() => {
              modalizeRefNewPaySlips.current?.close();
            }}
          />
        </Modalize>
      </Portal>

      <CustomPBar showProgress={codLoading || strpLoading || DelCardLoading} />
    </View>
  );
};

const styles = StyleSheet.create({
  cardNumberText: {paddingLeft: 13},
  noEnoughPay: {color: colorResource.paymentCardSelected, paddingLeft: 5},
  mainContainer: {flex: 1},
  titleTextwithpage: {
    color: colorResource.black,
    paddingTop: 0,
    paddingBottom: 10,
    paddingLeft: 22,
    paddingRight: 20,
    marginTop: Platform.OS === 'ios' ? 25 : 60,
  },
  titleTextwithmodal: {
    color: colorResource.black,
    paddingTop: 0,
    paddingBottom: 10,
    paddingLeft: 22,
    paddingRight: 20,
    marginTop: 10,
  },
  btnContainer: {paddingLeft: 24, paddingRight: 24, marginBottom: 20},
  btnTouchablecontainer: {padding: 12, marginTop: 8, alignItems: 'center'},
  itemContainer: {
    paddingLeft: 20,
    alignItems: 'center',
    borderRadius: 16,
    flexDirection: 'row',
    marginVertical: 8,
    marginHorizontal: 24,
    height: 72,
  },
  ButtonViewStyles: {
    flex: 0.1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ButtonViewStylesProfile: {
    flex: 0.1,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingHorizontal: 14,
    // marginBottom:20,
    position: 'absolute',
    marginTop: 30,
    top: 10,
    zIndex: 9999,
  },
  headerWrap: {
    flexDirection: 'row',
    paddingTop: 25,
    paddingHorizontal: 24,
  },
});

export default PaymentSelection;
