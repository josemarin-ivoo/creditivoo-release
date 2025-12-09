import {useNavigation, StackActions} from '@react-navigation/native';
import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Platform,
  AppState,
  Switch,
} from 'react-native';
import commonStyle from '../../../../commonStyle';
import CustomPBar from '../../../Components/CustomPBar';
import Helper from '../../../Utils/Helper';
import ProgressiveImage from '../../../Components/ProgressiveImage';
import {useDispatch, useSelector} from 'react-redux';
import {translate} from '../../../locales';
import {
  cartInventory,
  customerAddressList,
  customerAlternateAddressList,
  GetDeliveryCharge,
  GetServiceCharge,
  placeOrder,
  sendLocationToServer,
  setAddress,
  setAlternateAddress,
} from '../../../Queries/queries';
import CustomHeader from '../../../Components/CustomHeader';
import ResImage from '../../../Utils/Image';
import colorResource from '../../../Utils/Colors';
import {Modalize} from 'react-native-modalize';
import {Portal} from 'react-native-portalize';
import SelectDelivery from './SelectDelivery';
import DateandTimeSelection from './DateandTimeSelection';
// import stripe from 'tipsi-stripe';
import {Routes} from '../../../Utils/NavigationRoutes';
import PickUpPointSelection from './PickUpPointSelection';
import PaymentSelection from './Payment/PaymentSelection';
import CommonHandlers from '../../../Utils/CommonHandlers';
import Moment from 'moment';
import {cartDelete} from '../../../redux/cartAction';
import {useLazyQuery, useQuery} from '@apollo/client';
import {CustomButton} from '../../../Components/CustomButton';
import AddPaymentMethod from './Payment/AddPaymentMethod';
import {CartItemCounterAction} from '../../../redux/cartItemCounterAction';
// import Helper from './../../../Utils/Helper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Geolocation from 'react-native-geolocation-service';

import {AppContext} from '../../AppContext';
import {check, PERMISSIONS, RESULTS, request} from 'react-native-permissions';
import PermissionHandler from '../../../Utils/PermissionHandler';
import {
  AnalyticsEvent,
  AnalyticslogPurchase,
} from './../../../helpers/analyticHelper';
import TrackEvents from '../../../Utils/TrackingEvent';
import 'moment/src/locale/es';
import moment from 'moment';
import {
  ClearCHECKOUT,
  InventoryDATA,
  ISAddressONCart,
  ISCHECKOUTCacheUpdated,
} from './../../../redux/CheckoutCacheReducer/CheckoutCacheAction';
import {Clear_CARTITEMS} from '../../../redux/CartCacheReducer/CartCacheAction';
import {DELETE_DATETIMESLOT} from '../../../redux/DateTimeSlotReducers/DateTimeSlotAction';
import {
  DELETE_PAYMETHODS,
  isNeedtoUpdatePAYDATA,
} from '../../../redux/PaymentMethodsReducers/PaymentMethodsAction';
import {
  getItemFromStorage,
  getObjectFromStore,
  removeStoreItem,
  setObjectInStore,
} from '../../../Utils/Storage';
import {setItemInStorage} from './../../../Utils/Storage';
import Colors from '../../../Utils/Colors';
import TermsAndConditions from './TermsAndConditions';
import NewAddress from '../UserProfile/NewAddress';
import AlternetAddress from '../UserProfile/AlternetAddress';
import {
  AddAlternetAddress,
  ClearAlternetAddress,
} from '../../../redux/AlternetAddressReducers/AlternetAddressAction';
import ResorceColor from "../../../Utils/Colors";

// stripe.setOptions({
//   publishableKey: Helper.stripeKey,
//   androidPayMode: Helper.androidPayMode,
// });

const locRefreshTimeInMin = 1440;

const Checkout = props => {
  const [cartData, setcartData] = useState(props.route.params.cData);
  const [highDimText, setHighDimText] = useState(props.route.params.highDimText);
  const [isChecked, setIsChecked] = useState(false);
  // const [paymentCards, setpaymentCards] = useState( props.route.params.cardData )
  //console.log( props.route.params )
  // const [DeliveryTimeData, setDeliveryTimeData] = useState( props.roue.param.DeliveryTimeData )
  const {appTheme} = useContext(AppContext);

  const [isDark, setDark] = useState(appTheme.type === 'dark');
  useEffect(() => {
    setDark(appTheme.type === 'dark');
  }, [appTheme.type]);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  // const [cartDeliveryAddID, setcartDeliveryAddID] = useState( null );
  const [deliveryAdd, setDeliveryAdd] = useState(null);
  const [pickupPoint, setpickupPoint] = useState(null);
  const [selectedDate, setselectedDate] = useState(null);
  const [selectedSlot, setselectedSlot] = useState(null);
  const [Paymenttype, setPaymentType] = useState(null);
  const [PaymentOption, setPaymentOption] = useState(null);
  const [DeliveryCharge, setDeliveryCharge] = useState('$0.00');
  const [Discount, setDiscount] = useState('$0.00');
  const [ServiceFees, setServiceFees] = useState('$0.00');

  const [GrandTotal, setGrandTotal] = useState('$0.00');
  const [isDeliveryAvailable, setisDeliveryAvailable] = useState(false);
  const [ispickupavailable, setispickupavailable] = useState(false);
  const [location, setLocation] = useState(null);
  const [isAlternetAddress, setAlternetAddress] = useState(false);
  const [alternetAddressVal, setAlternetAddressVal] = useState('');
  const [AddressToMap, setAddressToMap] = useState(null);

  const global_data = useSelector((state: any) => state.commonReducer);

  const modalizeRefDelivery = React.useRef<Modalize>(null);
  const modalizeRefTime = React.useRef<Modalize>(null);
  const modalizeRefPickup = React.useRef<Modalize>(null);
  const modalizeRefPayment = React.useRef<Modalize>(null);
  const modalizeRefNewPayment = React.useRef<Modalize>(null);
  const modalizeRefTermsAndConditions = React.useRef<Modalize>(null);
  const modalizeRefAddress = React.useRef<Modalize>(null);

  const [
    getAddress,
    {loading: loadingAddresses, error: errorAddresses, data: dataAddresses},
  ] = useLazyQuery(customerAddressList);

  const [
    getAlternateAddress,
    {
      loading: loadingAddresses1,
      error: errorAddresses1,
      data: dataAlternateAddresses,
    },
  ] = useLazyQuery(customerAlternateAddressList);

  const [setPlaceOrder, {loading, error, data: PurchaseOrderdata}] =
    placeOrder();

  const [setAdd, {loading: aLoading, error: aError, data: aData}] =
    setAlternateAddress();

  const [
    saveLocation,
    {loading: locationLoading, error: locationError, data: locationData},
  ] = sendLocationToServer();

  const [CachedCartInvData, setCachedCartInvData] = useState(null);
  const [
    GetcartInventory,
    {loading: CartLoading, error: CartError, data: CartInvData},
  ] = useLazyQuery(cartInventory);
  const [
    getDeliveryCharges,
    {loading: loadingB, error: errorB, data: deliveryData},
  ] = useLazyQuery(GetDeliveryCharge, {errorPolicy: 'all'});
  const [
    GetServiceCharges,
    {loading: loadingservice, error: errorservice, data: ServiceChargeData},
  ] = useLazyQuery(GetServiceCharge, {errorPolicy: 'all'});

  const CheckoutCacheReducer = useSelector(
    (state: any) => state.CheckoutCacheReducer,
  );

  function UpdateCacheExpTime(isUpdated) {
    var expTime = new Date(new Date().setHours(new Date().getHours() + 5));
    dispatch(ISCHECKOUTCacheUpdated(isUpdated, expTime));
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log(
        'check our CheckoutCacheReducer.isUpdated--',
        CheckoutCacheReducer,
      );
      console.log('cartData --> ', JSON.stringify(cartData));
      var expTime = new Date(CheckoutCacheReducer.expTime);
      var date2 = new Date();
      if (expTime.getTime() < date2.getTime()) {
        console.log(
          'expTime and get callled GetcartInventory -->',
          expTime.getTime(),
          date2.getTime(),
        );
        GetcartInventory();
      } else {
        if (CheckoutCacheReducer.isUpdated) {
          setCachedCartInvData(CheckoutCacheReducer.InventoryITEMS);
        } else {
          console.log('Online GetcartInventory --');
          GetcartInventory();
        }
      }
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    //console.log( 'CheckoutCacheReducer --', JSON.stringify( CheckoutCacheReducer ) );
    var expTime = new Date(CheckoutCacheReducer.expTime);
    var date2 = new Date();
    if (expTime.getTime() < date2.getTime()) {
      console.log('expTime and get callled GetcartInventory -->', expTime);
      GetcartInventory();
    } else {
      if (CheckoutCacheReducer.isUpdated) {
        setCachedCartInvData(CheckoutCacheReducer.InventoryITEMS);
      } else {
        GetcartInventory();
      }
    }
  }, [CheckoutCacheReducer]);

  // useEffect(() => {
  //   AppState.addEventListener('change', handlePermissionCheck);
  //   return () => {
  //     AppState.removeEventListener('change', handlePermissionCheck);
  //   };
  // }, []);

  // useEffect(() => {
  //   getAddress();
  // }, []);

  useEffect(() => {
    getAlternateAddress();
  }, []);

  useEffect(() => {
    if (dataAlternateAddresses && dataAlternateAddresses.getAlternateAddress) {
      if (
        dataAlternateAddresses.getAlternateAddress.is_alternate_address === true
      ) {
        setAlternetAddressVal(
          dataAlternateAddresses.getAlternateAddress.firstname.toString() +
            ' ' +
            dataAlternateAddresses.getAlternateAddress.lastname.toString(),
        );
        dispatch(ClearAlternetAddress());
        dispatch(
          AddAlternetAddress(
            dataAlternateAddresses.getAlternateAddress,
            dataAlternateAddresses.getAlternateAddress.alernateaddress_id,
          ),
        );
      }
    } else {
      dispatch(ClearAlternetAddress());
      setAlternetAddressVal('');
    }
  }, [dataAlternateAddresses]);

  // useEffect(() => {
  //   let isAddressFound = false;

  //   if (dataAddresses) {
  //     dataAddresses.customer.addresses.map((product, index) => {
  //       console.log(
  //         'Addresses data value ---->> ',
  //         dataAddresses.customer.addresses[index].is_alternate_address,
  //       );
  //       console.log('get address response --->>', product);
  //       if (
  //         dataAddresses.customer.addresses[index].is_alternate_address === true
  //       ) {
  //         alternateAddressPosition = index;
  //         isAddressFound = true;
  //         setAlternetAddressVal(
  //           dataAddresses.customer.addresses[index].firstname.toString() +
  //             ' ' +
  //             dataAddresses.customer.addresses[index].lastname.toString(),
  //         );
  //         dispatch(ClearAlternetAddress());
  //         dispatch(
  //           AddAlternetAddress(
  //             dataAddresses.customer.addresses[alternateAddressPosition],
  //             dataAddresses.customer.addresses[alternateAddressPosition].id,
  //           ),
  //         );
  //       }
  //     });
  //     if (isAddressFound === false) {
  //       alternateAddressPosition = 0;
  //       dispatch(ClearAlternetAddress());
  //       setAlternetAddressVal('');
  //     }
  //   } else {
  //     alternateAddressPosition = 0;
  //     isAddressFound = false;
  //     dispatch(ClearAlternetAddress());
  //     setAlternetAddressVal('');
  //   }
  // }, [dataAddresses]);

  useEffect(() => {
    if (aData) {
      //dispatch(ISAddressONCart(true));
      //dispatch(isNeedtoUpdatePAYDATA(true));
      //let filterDeliveryData = addressList.filter( data => data.id == selectedId )
      //props.CloseBottomsheet( selectedId, filterDeliveryData[0] )
    }
  }, [aData]);

  useEffect(() => {
    console.log('Alternet Address Val data value ---->> ', alternetAddressVal);
  }, [alternetAddressVal]);

  useEffect(() => {
    if (CachedCartInvData) {
      setisDeliveryAvailable(
        CachedCartInvData.cartInventory.is_delivery_available,
      );
      setispickupavailable(CachedCartInvData.cartInventory.is_pickup_available);
    }
  }, [CachedCartInvData]);

  useEffect(() => {
    if (CartInvData) {
      //  console.log( 'CartInvData --', JSON.stringify( CartInvData ) );
      setCachedCartInvData(CartInvData);
      UpdateCacheExpTime(true);
      dispatch(InventoryDATA(CartInvData));
    }
  }, [CartInvData]);

  const openDeliveryInfo = () => {
    if (cartData) {
      Helper.HandleVibration();
      modalizeRefDelivery.current?.open();
    }
  };

  const processPurchaseOrder = async () => {
    //console.log( cartData.customerCart.id )
    Helper.HandleVibration();
    let isDatafilled = true;

    if (isDeliveryAvailable && ispickupavailable) {
      if (deliveryAdd == null && pickupPoint == undefined) {
        isDatafilled = false;
      } else {
        isDatafilled = true;
      }
    } else if (isDeliveryAvailable && deliveryAdd == null) {
      isDatafilled = false;
    } else if (ispickupavailable && pickupPoint == undefined) {
      isDatafilled = false;
    } else if (isAlternetAddress) {
      if (alternetAddressVal === '') {
        isDatafilled = false;
      } else {
        isDatafilled = true;
      }
    }


    /*if (selectedDate == null) {
      isDatafilled = false;
    }*/
    if (Paymenttype == null) {
      isDatafilled = false;
    }

    if (isDatafilled) {
      setPlaceOrder({
        variables: {
          cart_id: cartData.customerCart.id,
        },
      });
    } else {
      Helper.ShowAlert(translate('order.lbl_ordervalidate'));
    }
  };

  useEffect(() => {
    if (PurchaseOrderdata) {
      global_data.token ? handleLOCATIONPermission() : null;
      dispatch(cartDelete());

      removeStoreItem('CartCacheStatus_customerCart');
      setItemInStorage('CartCacheStatus_isUpdated', '0');
      setItemInStorage('CartCacheStatus_expTime', new Date().toString());

      dispatch(CartItemCounterAction(false));
      dispatch(ClearCHECKOUT());
      dispatch(DELETE_DATETIMESLOT());
      dispatch(DELETE_PAYMETHODS());
      if (PurchaseOrderdata.placeOrder) {
        //AnalyticsEvent( TrackEvents.PURCHASE, { 'userEmail': global_data.email, 'cartId ': cartData.customerCart.id, 'CURRENCY': 'USD', 'COUPON': '' } );
        AnalyticslogPurchase(
          cartData,
          PurchaseOrderdata.placeOrder.order.order_number,
        );

        navigation.dispatch(
          StackActions.replace(Routes.NAVIGATION_TO_ORDERACCEPTED),
        );
      }
    }
  }, [PurchaseOrderdata]);

  useEffect(() => {
    // console.log(location);
  }, [location]);

  useEffect(() => {
    processCartData();
  }, [cartData]);
  const processCartData = async () => {
    //    cartData ? console.log( '12345  ', JSON.stringify( Helper.currencyFormat( cartData.customerCart.prices.payment_fee.value ) ) ) : console.log( 'asdjhak' )
    //console.log( '12' )
    cartData
      ? setGrandTotal(
          Helper.currencyFormat(cartData.customerCart.prices.grand_total.value),
        )
      : setGrandTotal(Helper.currencyFormat(0));

    cartData
      ? setServiceFees(
          Helper.currencyFormat(cartData.customerCart.prices.payment_fee.value),
        )
      : setServiceFees(Helper.currencyFormat(0));

    cartData.customerCart.prices.discounts
      ? setDiscount(
          Helper.currencyFormat(
            cartData.customerCart.prices.discounts[0].amount.value,
          ),
        )
      : setDiscount(Helper.currencyFormat(0));
  };

  useEffect(() => {
    if (deliveryData) {
      // console.log( 'deliveryData', JSON.stringify( deliveryData ) )
      deliveryData.customerCart.shipping_addresses.length > 0 &&
        deliveryData.customerCart.shipping_addresses[0]
          .selected_shipping_method &&
        setDeliveryCharge(
          Helper.currencyFormat(
            deliveryData.customerCart.shipping_addresses[0]
              .selected_shipping_method.amount.value,
          ),
        );
      //console.log( '14', )

      setGrandTotal(
        Helper.currencyFormat(
          deliveryData.customerCart.prices.grand_total.value,
        ),
      );
    } else {
      setDeliveryCharge(Helper.currencyFormat(0));
    }
  }, [deliveryData]);

  useEffect(() => {
    if (ServiceChargeData) {
      setServiceFees(
        Helper.currencyFormat(
          ServiceChargeData.customerCart.prices.payment_fee.value,
        ),
      );
      setGrandTotal(
        Helper.currencyFormat(
          ServiceChargeData.customerCart.prices.grand_total.value,
        ),
      );
    }
  }, [ServiceChargeData]);

  const handleCustomerAuthentication = async clientSecret => {
    // try {
    //   const result = await stripe.authenticatePaymentIntent({
    //     clientSecret: clientSecret,
    //   });
    //   if (result.error) return Helper.ShowAlert(result.error);
    //   if ((result && result.status == 'succeeded') || 'requires_confirmation') {
    //     //call again place order API
    //     processPurchaseOrder();
    //   }
    // } catch (e) {
    //   console.log('exception called');
    //   Helper.ShowAlert(e);
    // }
  };

  useEffect(() => {
    CartError && Helper.ShowAlert(CartError);
  }, [CartError]);

  useEffect(() => {
    if (error && typeof error.message != 'undefined') {
      const msg = error.message;
      console.log('Eror msg -------->>', msg);
      if (
        msg.indexOf('Unable to place order: Authentication Required: ') !== 0
      ) {
        CommonHandlers.CommonErrorHandler(error, dispatch, navigation);
      } else {
        if (error && typeof error.message != 'undefined') {
          const msg = error.message;

          if (
            msg.indexOf('Unable to place order: Authentication Required: ') ===
            0
          ) {
            let paymentIntent = msg
              .substring(
                'Unable to place order: Authentication Required: '.length,
              )
              .split(',');
            handleCustomerAuthentication(paymentIntent[0]);
          }
        }
      }
    } else if (error) {
      CommonHandlers.CommonErrorHandler(error, dispatch, navigation);
    }

    if (aError) {
      aError && Helper.ShowAlert(`${aError}`);
    }
  }, [error, aError]);

  const openPaymentSelection = () => {
    if (cartData) {
      Helper.HandleVibration();
      modalizeRefPayment.current?.open();
    }
  };

  const OpenDateTimeSelection = () => {
    if (cartData) {
      Helper.HandleVibration();
      modalizeRefTime.current?.open();
    }
  };

  const openPickUpPointSelection = () => {
    if (cartData) {
      Helper.HandleVibration();
      modalizeRefPickup.current?.open();
    }
  };

  function getDateMonthandYear(date) {
    let trLocale = require('moment/locale/es');
    moment.updateLocale('es', trLocale);
    return moment(date).format('MMMM Do YYYY');
  }

  function gettime(from) {
    let trLocale = require('moment/locale/es');
    moment.updateLocale('es', trLocale);
    let a = moment(from, 'HH:mm');
    return moment(a).format('LT');
  }
  const insets = useSafeAreaInsets();
  // console.log(insets, "Checkout page insets");

  const toggleCheckBox = () => {
    Helper.HandleVibration();
    setIsChecked(!isChecked);
  };

  const handleLOCATIONPermission = async () => {
    const nowDT = new Date();

    const hasPermission = await PermissionHandler.hasLocationPermission();
    if (hasPermission) {
      await PermissionHandler.getCurrentLatLong();

      if (hasPermission) {
        await removeStoreItem('locationData');
        const data = await getObjectFromStore('locationData');

        const storedLat = await getItemFromStorage('lat');
        const storedLng = await getItemFromStorage('lng');
        const lastLocDate = await data.lastLocDate;

        if (lastLocDate !== '' || lastLocDate !== null) {
          const lastStoredDate = new Date(
            lastLocDate?.toString() || nowDT.toString(),
          );

          const locationData = {
            latitude: await getItemFromStorage('lat'),
            longitude: await getItemFromStorage('lng'),
            lastLocDate: new Date(nowDT.toString()),
            city: await getItemFromStorage('cityNameVal'),
          };
          await setObjectInStore('locationData', locationData);
          await sendLocationDataToServer(
            await getItemFromStorage('lat'),
            await getItemFromStorage('lng'),
            'placeorder',
            await getItemFromStorage('cityNameVal'),
            'true',
          );
        }
      }
    }
  };

  const sendLocationDataToServer = async (lat, lng, event, city, isMobile) => {
    saveLocation({
      variables: {
        lat: lat,
        lng: lng,
        event: event,
        city: city,
        isMobile: isMobile,
      },
    });
  };

  useEffect(() => {
    console.log('Data returned from location service ------->>', locationError);
    //locationError && Helper.ShowAlert(`${error}`);
  }, [locationError]);

  useEffect(() => {
    console.log('Data returned from location service ------->>', locationData);
  }, [locationData]);

  const toggleAlternateAddress = isAlternetAdd => {
    setAlternetAddress(isAlternetAdd);
  };

  useEffect(() => {
    if (dataAlternateAddresses && dataAlternateAddresses.getAlternateAddress) {
      if (alternetAddressVal !== '') {
        setAdd({
          variables: {
            cID: cartData.customerCart.id,
            addressId:
              '' +
              dataAlternateAddresses.getAlternateAddress.alernateaddress_id.toString(),
            is_set: isAlternetAddress,
          },
        });
        //setpickupPoint(null);
        //setDeliveryAdd(null);
        // if (isAlternetAddress) {
        //   getDeliveryCharges();
        // } else {
        //   setAlternetAddressVal('');
        // }
      } else {
        console.log(
          'else part there is no value for setting alternate address',
        );
      }
    }
  }, [isAlternetAddress]);

  return (
    <View style={{flex: 1, backgroundColor: appTheme.background}}>
      <CustomHeader
        gradientHeader={false}
        gradientHeaderOption={false}
        scrolledValue={false}
      />
      <StatusBar
        translucent={true}
        backgroundColor={colorResource.transparent}
        barStyle={appTheme.statusBar}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={[
          commonStyle.padding_16,
          commonStyle.paddingBottom_50,
          {
            paddingTop: insets.top + 20,
            paddingBottom: insets.bottom,
            backgroundColor: appTheme.background,
          },
        ]}>
        <Text
          style={[
            commonStyle.h2,
            commonStyle.fontBold,
            {
              color: appTheme.text,
              paddingLeft: 0,
              paddingTop: 40,
              paddingBottom: 16,
              paddingRight: 16,
            },
          ]}>
          {translate('cart.lbl_checkout')}
        </Text>
        <View>
          <Text style={[commonStyle.profileHeader]}>
            {translate('order.lbl_delivery_method')}
          </Text>
          {/* {
                     !isDeliveryAvailable && !ispickupavailable && <Text style={{fontSize: 15, lineHeight: 22,color:'red',fontFamily: 'Inter-Regular',}}> Sin la caja disponible en su cesta productos</Text>
                    } */}

          {isDeliveryAvailable && !deliveryAdd && (
            <View style={{opacity: !isDeliveryAvailable ? 0.5 : 1.0}}>
              <TouchableOpacity
                disabled={!isDeliveryAvailable}
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
                  openDeliveryInfo();
                }}>
                <ProgressiveImage
                  source={appTheme.ic_Plus}
                  style={{paddingRight: 8}}
                />
                <Text
                  style={[
                    commonStyle.h5,
                    {
                      color: isDark
                        ? colorResource.disable_clr
                        : colorResource.Gray,
                      marginLeft: 4,
                    },
                  ]}>
                  {translate('checkout.lbl_delivery')}
                </Text>
                {/* {translate('checkout.lbl_delivery')}  */}
              </TouchableOpacity>
            </View>
          )}
          {deliveryAdd && (
            <View>
              <TouchableOpacity
                style={[
                  styles.bg_container,
                  {backgroundColor: appTheme.InputBoxBGColor},
                ]}
                onPress={() => {
                  openDeliveryInfo();
                }}>
                <View style={[styles.add_top_container]}>
                  {deliveryAdd.address_type == '1' && (
                    <View style={styles.add_inner_container}>
                      <ProgressiveImage
                        source={
                          isDark
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
                          {color: appTheme.text},
                        ]}>
                        {translate('address.lbl_home')}
                      </Text>
                    </View>
                  )}
                  {deliveryAdd.address_type == '2' && (
                    <View style={styles.add_inner_container}>
                      <ProgressiveImage
                        source={
                          isDark
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
                          {color: appTheme.text},
                        ]}>
                        {' '}
                        {translate('address.lbl_work')}
                      </Text>
                    </View>
                  )}
                  {deliveryAdd.address_type != '1' &&
                    deliveryAdd.address_type != '2' && (
                      <View style={styles.add_inner_container}>
                        <ProgressiveImage
                          source={
                            isDark
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
                            {color: appTheme.text},
                          ]}>
                          {' '}
                          {translate('address.lbl_other')}{' '}
                        </Text>
                      </View>
                    )}
                  <ProgressiveImage
                    source={ResImage.ic_pen}
                    style={{
                      width: 24,
                      height: 24,
                      paddingRight: 8,
                      alignSelf: 'flex-end',
                    }}></ProgressiveImage>
                </View>

                <View style={styles.container_address}>
                  {(deliveryAdd.firstname || deliveryAdd.lastname) && (
                    <Text
                      style={[
                        styles.text_address_name,
                        {color: appTheme.text},
                      ]}>
                      {deliveryAdd.firstname} {deliveryAdd.lastname}
                    </Text>
                  )}
                  {(deliveryAdd.apartment_number || deliveryAdd.street) && (
                    <Text style={[styles.text_address, {color: appTheme.text}]}>
                      {deliveryAdd.street[0]} {deliveryAdd.street[1]}{' '}
                      {deliveryAdd.apartment_number}
                    </Text>
                  )}
                  <Text style={[styles.text_address, {color: appTheme.text}]}>
                    {deliveryAdd.city}, {deliveryAdd.postcode}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {!pickupPoint && ispickupavailable && (
            <View style={{opacity: !ispickupavailable ? 0.5 : 1.0}}>
              <TouchableOpacity
                disabled={!ispickupavailable}
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
                  openPickUpPointSelection();
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
                  {' '}
                  {translate('checkout.lbl_pickup')}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          {pickupPoint && (
            <TouchableOpacity
              style={[
                styles.bg_container,
                {backgroundColor: appTheme.InputBoxBGColor},
              ]}
              onPress={() => {
                openPickUpPointSelection();
              }}>
              <View style={styles.add_top_container}>
                <View style={styles.add_inner_container}>
                  <ProgressiveImage
                    source={isDark ? ResImage.ic_store_new : ResImage.ic_store}
                    style={styles.type_icon}
                    resizeMode="center"
                  />
                  <Text
                    style={[
                      commonStyle.h5,
                      styles.text_add_title,
                      {
                        color: isDark
                          ? colorResource.disable_clr
                          : colorResource.black,
                      },
                    ]}>
                    {pickupPoint.pickup_location_code}
                  </Text>
                </View>
                <ProgressiveImage
                  source={ResImage.ic_pen}
                  style={[
                    commonStyle.he_wi_24,
                    {paddingRight: 8, alignSelf: 'flex-end'},
                  ]}
                />
              </View>
              <View style={styles.container_address}>
                <Text
                  style={[
                    styles.text_address_name,
                    {
                      color: isDark
                        ? colorResource.disable_clr
                        : colorResource.Gray,
                    },
                  ]}>
                  {pickupPoint.street}
                </Text>
                <Text
                  style={[
                    styles.text_address,
                    {
                      color: isDark
                        ? colorResource.disable_clr
                        : colorResource.Gray,
                    },
                  ]}>
                  {pickupPoint.city}, {pickupPoint.postcode}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {
            <View>
              <TouchableOpacity
                disabled={true}
                style={[
                  {
                    justifyContent: 'space-between',
                    flexDirection: 'row',
                    flex: 1,
                    borderRadius: 16,
                    paddingTop: 12,
                    paddingBottom: 12,
                    paddingStart: 12,
                    paddingEnd: 8,
                    marginTop: 8,
                    alignItems: 'center',
                    backgroundColor: appTheme.InputBoxBGColor,
                  },
                ]}
                onPress={() => {
                  //openPickUpPointSelection();
                }}>
                <Text
                  style={[
                    commonStyle.h5,
                    {
                      color: isDark
                        ? colorResource.disable_clr
                        : colorResource.Gray,
                    },
                  ]}>
                  {translate('checkout.lbl_receipient_can_receive_order')}
                </Text>
                <Switch
                  trackColor={{false: '#767577', true: '#3A5B4B'}}
                  thumbColor={colorResource.Green}
                  style={{
                    transform: [
                      {scaleX: Platform.OS == 'ios' ? 0.7 : 0.9},
                      {scaleY: Platform.OS == 'ios' ? 0.7 : 0.9},
                    ],
                  }}
                  value={isAlternetAddress}
                  onValueChange={toggleAlternateAddress}
                />
              </TouchableOpacity>
            </View>
          }
          {isAlternetAddress && alternetAddressVal !== '' && (
            <TouchableOpacity
              disabled={true}
              style={[
                styles.bg_container,
                {backgroundColor: appTheme.InputBoxBGColor},
              ]}
              onPress={() => {
                //modalizeRefAddress.current?.open();
              }}>
              <View style={styles.add_top_container}>
                <View style={styles.add_inner_container}>
                  <ProgressiveImage
                    source={
                      isDark ? ResImage.ic_profile : ResImage.ic_profile_dark
                    }
                    style={styles.type_icon}
                    resizeMode="center"
                  />
                  <Text
                    style={[
                      commonStyle.h5,
                      {
                        color: isDark
                          ? colorResource.disable_clr
                          : colorResource.black,
                        fontWeight: '800',
                        marginStart: 8,
                      },
                    ]}>
                    {dataAlternateAddresses.getAlternateAddress.firstname +
                      ' ' +
                      dataAlternateAddresses.getAlternateAddress.lastname}
                  </Text>
                </View>
                {/* <ProgressiveImage
                  source={ResImage.ic_pen}
                  style={[
                    commonStyle.he_wi_24,
                    {paddingRight: 8, alignSelf: 'flex-end'},
                  ]}
                /> */}
              </View>
              <View style={styles.container_address}>
                <Text
                  style={[
                    styles.text_address_name,
                    {
                      color: isDark
                        ? colorResource.disable_clr
                        : colorResource.Gray,
                    },
                  ]}>
                  {dataAlternateAddresses.getAlternateAddress.street[0]}{' '}
                  {dataAlternateAddresses.getAlternateAddress.street[1]}
                </Text>
                <Text
                  style={[
                    styles.text_address,
                    {
                      color: isDark
                        ? colorResource.disable_clr
                        : colorResource.Gray,
                    },
                  ]}>
                  {dataAlternateAddresses.getAlternateAddress.city}
                  {dataAlternateAddresses.getAlternateAddress.postcode &&
                    ' , ' + dataAlternateAddresses.getAlternateAddress.postcode}
                </Text>
              </View>
              <View
                style={{flexDirection: 'row', marginStart: 8, marginBottom: 8}}>
                <ProgressiveImage
                  source={ResImage.ic_info}
                  style={[
                    commonStyle.he_wi_24,
                    {paddingRight: 16, alignSelf: 'flex-end'},
                  ]}
                />
                <Text
                  style={[
                    styles.text_address,
                    {color: appTheme.text, marginStart: 8},
                  ]}>
                  {translate('address.lbl_address_note')}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          {isAlternetAddress && alternetAddressVal === '' && (
            <View>
              <Text
                style={[
                  commonStyle.profileHeader,
                  {color: appTheme.text, marginTop: 8},
                ]}>
                {translate('checkout.lbl_receipient_address')}
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
                    //{translate('selectdelivery.lbl_add_new_address')}
                  ]}>
                  {translate('recipient.lbl_add_recipient')}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/*{
            <View
              style={{
                paddingTop: 40,
                opacity:
                  !deliveryAdd && !pickupPoint && !isAlternetAddress
                    ? 0.5
                    : 1.0,
              }}
              pointerEvents={
                !deliveryAdd && !pickupPoint && !isAlternetAddress
                  ? 'none'
                  : 'auto'
              }>
              <Text
                style={[
                  commonStyle.profileHeader,
                  commonStyle.fontBold,
                  {
                    paddingBottom: 10,
                    color: isDark
                      ? colorResource.disable_clr
                      : colorResource.black,
                  },
                ]}>
                {translate('checkout.lbl_delivery_title')}
              </Text>
              {selectedDate && (
                <TouchableOpacity
                  key={selectedDate.toString()}
                  style={[styles.container_slot, {}]}
                  onPress={() => {
                    OpenDateTimeSelection();
                  }}>
                  <View
                    style={[
                      commonStyle.profileContainer,
                      commonStyle.padding_12,
                      commonStyle.flexDir_Row,
                      commonStyle.justifyContent_flex_start,
                      {
                        backgroundColor: appTheme.InputBoxBGColor,
                        width: '100%',
                        flex: 0.3,
                      },
                    ]}>
                    <ProgressiveImage
                      source={{
                        uri: isDark
                          ? selectedSlot.dark_icon
                          : selectedSlot.icon,
                      }}
                      style={[styles.type_icon, {paddingLeft: 32}]}
                      resizeMode="center"
                    />
                    <View style={{paddingLeft: 6, paddingRight: 35, flex: 0.8}}>
                      <Text
                        style={[styles.text_TimeSlot, {color: appTheme.text}]}>
                        {getDateMonthandYear(selectedDate)}
                      </Text>
                      <Text
                        style={[
                          styles.text_TimeSlotTime,
                          {
                            color: isDark
                              ? colorResource.disable_clr
                              : colorResource.Gray,
                          },
                        ]}>
                        {selectedSlot.name} : {gettime(selectedSlot.from)} -{' '}
                        {gettime(selectedSlot.to)}
                      </Text>
                    </View>
                    <View style={{flex: 0.3}}>
                      <ProgressiveImage
                        source={ResImage.ic_pen}
                        style={[
                          commonStyle.he_wi_24,
                          {marginRight: 4, alignSelf: 'flex-end'},
                        ]}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              {!selectedDate && (
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
                    OpenDateTimeSelection();
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
                    {' '}
                    {translate('checkout.lbl_set_delivery_window')}{' '}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          }*/}
          <View
            style={{
              paddingTop: 10,
              opacity:
                !deliveryAdd && !pickupPoint && !isAlternetAddress ? 0.5 : 1.0,
            }}
            pointerEvents={
              !deliveryAdd && !pickupPoint && !isAlternetAddress
                ? 'none'
                : 'auto'
            }>
            <Text
              style={[
                commonStyle.profileHeader,
                commonStyle.fontBold,
                {paddingBottom: 0, color: appTheme.text},
              ]}>
              {translate('order.lbl_payment')}
            </Text>
            {
              <TouchableOpacity
                style={{marginBottom: 80}}
                onPress={() => {
                  openPaymentSelection();
                }}>
                {!Paymenttype && (
                  <View
                    style={[
                      commonStyle.profileContainer,
                      commonStyle.flexDir_Row,
                      commonStyle.flexDir_Row,
                      commonStyle.justifyContent_flex_start,
                      {
                        padding: 12,
                        marginTop: 8,
                        alignItems: 'center',
                        backgroundColor: appTheme.InputBoxBGColor,
                      },
                    ]}>
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
                      {translate('checkout.lbl_select_payment')}
                    </Text>
                  </View>
                )}
                {Paymenttype == 'cash' && (
                  <View
                    style={[
                      styles.cashitemContainer,
                      commonStyle.padding_12,
                      {backgroundColor: appTheme.InputBoxBGColor},
                    ]}>
                    <ProgressiveImage
                      source={ResImage.ic_Cash}
                      style={[styles.type_icon, {paddingLeft: 15}]}
                      resizeMode="center"></ProgressiveImage>
                    <View style={{paddingLeft: 6}}>
                      <Text
                        style={[
                          commonStyle.h5,
                          commonStyle.fontBold,
                          {paddingLeft: 6, color: appTheme.text},
                        ]}>
                        {translate('payment.lbl_incash')}
                      </Text>
                    </View>
                    <View style={{flex: 1, alignItems: 'flex-end'}}>
                      <ProgressiveImage
                        source={ResImage.ic_pen}
                        style={[
                          commonStyle.he_wi_24,
                          {marginRight: 4, alignSelf: 'flex-end'},
                        ]}
                      />
                    </View>
                  </View>
                )}
                {Paymenttype == 'card' && (
                  <View
                    style={[
                      styles.cashitemContainer,
                      commonStyle.padding_12,
                      {
                        backgroundColor: appTheme.InputBoxBGColor,
                      },
                    ]}>
                    {PaymentOption.brand == 'visa' && (
                      <ProgressiveImage
                        source={ResImage.ic_visa}
                        style={[styles.type_icon, {paddingLeft: 15}]}
                      />
                    )}
                    {PaymentOption.brand == 'mastercard' && (
                      <ProgressiveImage
                        source={ResImage.ic_mastercard}
                        style={[styles.type_icon, {paddingLeft: 15}]}
                      />
                    )}
                    {PaymentOption.brand == 'amex' && (
                      <ProgressiveImage
                        source={ResImage.ic_amex}
                        style={[styles.type_icon, {paddingLeft: 15}]}
                      />
                    )}

                    <View style={{flex: 1, marginLeft: 6}}>
                      <Text
                        style={[
                          commonStyle.h5,
                          commonStyle.fontBold,
                          {
                            paddingLeft: 6,
                            color: appTheme.text,
                            textTransform: 'capitalize',
                          },
                        ]}>
                        {PaymentOption.brand}
                      </Text>
                      <Text
                        style={[
                          commonStyle.h6,
                          commonStyle.fontNormal,
                          styles.cardNumberText,
                          {
                            color: isDark
                              ? colorResource.disable_clr
                              : colorResource.Gray,
                          },
                        ]}>
                        {PaymentOption.card_number}
                      </Text>
                    </View>
                    <View style={{flex: 1, alignItems: 'flex-end'}}>
                      <ProgressiveImage
                        source={ResImage.ic_pen}
                        style={[
                          commonStyle.he_wi_24,
                          {marginRight: 4, alignSelf: 'flex-end'},
                        ]}
                      />
                    </View>

                    <View></View>
                  </View>
                )}
                {Paymenttype == 'movil' && (
                  <View
                    style={[
                      styles.cashitemContainer,
                      commonStyle.padding_12,
                      {backgroundColor: appTheme.InputBoxBGColor},
                    ]}>
                    <ProgressiveImage
                      source={ResImage.ic_movil}
                      style={[styles.type_icon, {paddingLeft: 15}]}
                      resizeMode="center"></ProgressiveImage>
                    <View style={{paddingLeft: 6}}>
                      <Text
                        style={[
                          commonStyle.h5,
                          commonStyle.fontBold,
                          {paddingLeft: 6, color: appTheme.text},
                        ]}>
                        {translate('NewPaymentMethods.movilTitle')}
                      </Text>
                    </View>
                    <View style={{flex: 1, alignItems: 'flex-end'}}>
                      <ProgressiveImage
                        source={ResImage.ic_pen}
                        style={[
                          commonStyle.he_wi_24,
                          {marginRight: 4, alignSelf: 'flex-end'},
                        ]}
                      />
                    </View>
                  </View>
                )}
                {Paymenttype == 'hs_paypal' && (
                  <View
                    style={[
                      styles.cashitemContainer,
                      commonStyle.padding_12,
                      {backgroundColor: appTheme.InputBoxBGColor},
                    ]}>
                    <ProgressiveImage
                      source={ResImage.ic_paypal}
                      style={[styles.type_icon, {paddingLeft: 15}]}
                      resizeMode="center"></ProgressiveImage>
                    <View style={{paddingLeft: 6}}>
                      <Text
                        style={[
                          commonStyle.h5,
                          commonStyle.fontBold,
                          {paddingLeft: 6, color: appTheme.text},
                        ]}>
                        {translate('NewPaymentMethods.paypalTitle')}
                      </Text>
                    </View>
                    <View style={{flex: 1, alignItems: 'flex-end'}}>
                      <ProgressiveImage
                        source={ResImage.ic_pen}
                        style={[
                          commonStyle.he_wi_24,
                          {marginRight: 4, alignSelf: 'flex-end'},
                        ]}
                      />
                    </View>
                  </View>
                )}
                {Paymenttype == 'zelle' && (
                  <View
                    style={[
                      styles.cashitemContainer,
                      commonStyle.padding_12,
                      {backgroundColor: appTheme.InputBoxBGColor},
                    ]}>
                    <ProgressiveImage
                      source={ResImage.ic_zelle}
                      style={[styles.type_icon, {paddingLeft: 15}]}
                      resizeMode="center"></ProgressiveImage>
                    <View style={{paddingLeft: 6}}>
                      <Text
                        style={[
                          commonStyle.h5,
                          commonStyle.fontBold,
                          {paddingLeft: 6, color: appTheme.text},
                        ]}>
                        {translate('NewPaymentMethods.zelleTitle')}
                      </Text>
                    </View>
                    <View style={{flex: 1, alignItems: 'flex-end'}}>
                      <ProgressiveImage
                        source={ResImage.ic_pen}
                        style={[
                          commonStyle.he_wi_24,
                          {marginRight: 4, alignSelf: 'flex-end'},
                        ]}
                      />
                    </View>
                  </View>
                )}
                {Paymenttype == 'banesco' && (
                  <View
                    style={[
                      styles.cashitemContainer,
                      commonStyle.padding_12,
                      {backgroundColor: appTheme.InputBoxBGColor},
                    ]}>
                    <ProgressiveImage
                      source={ResImage.ic_banesco}
                      style={[styles.type_icon, {paddingLeft: 15}]}
                      resizeMode="center"></ProgressiveImage>
                    <View style={{paddingLeft: 6}}>
                      <Text
                        style={[
                          commonStyle.h5,
                          commonStyle.fontBold,
                          {paddingLeft: 6, color: appTheme.text},
                        ]}>
                        {translate('NewPaymentMethods.banescoTitle')}
                      </Text>
                    </View>
                    <View style={{flex: 1, alignItems: 'flex-end'}}>
                      <ProgressiveImage
                        source={ResImage.ic_pen}
                        style={[
                          commonStyle.he_wi_24,
                          {marginRight: 4, alignSelf: 'flex-end'},
                        ]}
                      />
                    </View>
                  </View>
                )}
                {Paymenttype == 'hs_bank_transfer' && (
                  <View
                    style={[
                      styles.cashitemContainer,
                      commonStyle.padding_12,
                      {backgroundColor: appTheme.InputBoxBGColor},
                    ]}>
                    <ProgressiveImage
                      source={ResImage.ic_boli}
                      style={[styles.type_icon, {paddingLeft: 15}]}
                      resizeMode="center"></ProgressiveImage>
                    <View style={{paddingLeft: 6}}>
                      <Text
                        style={[
                          commonStyle.h5,
                          commonStyle.fontBold,
                          {paddingLeft: 6, color: appTheme.text},
                        ]}>
                        {translate('NewPaymentMethods.bolivaresTitle')}
                      </Text>
                    </View>
                    <View style={{flex: 1, alignItems: 'flex-end'}}>
                      <ProgressiveImage
                        source={ResImage.ic_pen}
                        style={[
                          commonStyle.he_wi_24,
                          {marginRight: 4, alignSelf: 'flex-end'},
                        ]}
                      />
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            }
          </View>
        </View>
      </ScrollView>
      {
        <View>
          {highDimText.length>0 && <Text style={styles.centeredText}>{highDimText}</Text>}
        </View>
      }

      {cartData && cartData.customerCart.items.length > 0 && (
        <View
          style={[
            commonStyle.padding_16,
            {
              backgroundColor: isDark
                ? appTheme.InputBoxBGColor
                : colorResource.SmokeWhite,
              marginBottom: 20,
            },
          ]}>
          {
            <View style={{flexDirection: 'column'}}>
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
                  Monto inicial
                </Text>
                <Text style={[commonStyle.h6, {color: appTheme.text}]}>
                  {Helper.currencyFormat(
                    cartData.customerCart.prices.subtotal_excluding_tax.value,
                  )}
                </Text>
              </View>
            </View>
          }
          {cartData &&
            cartData.customerCart.shipping_addresses &&
            DeliveryCharge != '$0.00' && (
              <View style={{flexDirection: 'column'}}>
                {/* <View style={[styles.amountContainer, , commonStyle.marginVertical_10]}> */}
                <View
                  style={[
                    {
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    },
                  ]}>
                  <Text style={[commonStyle.h6, {color: appTheme.text}]}>
                    {translate('checkout.lbl_deliveryfee')}{' '}
                  </Text>
                  <Text style={[commonStyle.h6, {color: appTheme.text}]}>
                    {DeliveryCharge}
                  </Text>
                </View>
              </View>
            )}
          {cartData && ServiceFees != '$0.00' && (
            <View style={{flexDirection: 'column'}}>
              <View
                style={[
                  {
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  },
                ]}>
                <Text style={[commonStyle.h6, {color: appTheme.text}]}>
                  Servicio
                </Text>
                <Text style={[commonStyle.h6, {color: appTheme.text}]}>
                  {ServiceFees}
                </Text>
              </View>
            </View>
          )}
          {Discount !== '' && Discount != '$0.00' && (
            <View style={{flexDirection: 'column', marginBottom: 10}}>
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
                  Código de Promo
                </Text>
                <Text
                  style={[
                    commonStyle.h6,
                    {
                      color: colorResource.pink_product_price,
                      fontWeight: '700',
                    },
                  ]}>
                  {Discount}
                </Text>
              </View>
            </View>
          )}

          <View
            style={[styles.amountContainer, {marginBottom: 15, marginLeft: 2}]}>
            <Text
              style={[
                commonStyle.h6,
                commonStyle.fontBold,
                ,
                {color: appTheme.text},
              ]}>
              {/* {translate( 'order.lbl_total_amt' )} */}
              {/* Sub total */}Total
            </Text>
            <Text
              style={[
                commonStyle.h6,
                commonStyle.fontBold,
                {color: colorResource.pink_product_price},
              ]}>
              {GrandTotal}
            </Text>
          </View>

          <CustomButton
            title="checkout.lbl_finish_and_order"
            onPress={() => {
              //place Order
              processPurchaseOrder();
            }}
            customButtonStyle={[commonStyle.btn_primary, commonStyle.fontBold]}
          />
        </View>
      )}
      <Portal>
        <Modalize
          panGestureEnabled={false}
          modalTopOffset={StatusBar.currentHeight + 20}
          ref={modalizeRefTermsAndConditions}
          //onClosed={() => modalizeRefTermsAndConditions.current?.open()}
          scrollViewProps={{
            scrollEnabled: false,
            contentContainerStyle: {height: '100%'},
          }}>
          <TermsAndConditions
            CloseBottomsheet={() =>
              modalizeRefTermsAndConditions.current?.close()
            }></TermsAndConditions>
        </Modalize>
      </Portal>

      <Portal>
        <Modalize
          panGestureEnabled={false}
          tapGestureEnabled={false}
          modalTopOffset={StatusBar.currentHeight + 20}
          ref={modalizeRefDelivery}
          scrollViewProps={{
            scrollEnabled: false,
            contentContainerStyle: {height: '100%'},
          }}>
          <SelectDelivery
            cartId={cartData.customerCart.id}
            CloseBottomsheet={(deliveryAddID, deliveryaddress) => {
              modalizeRefDelivery.current?.close();
              setpickupPoint(null);
              //setcartDeliveryAddID( deliveryAddID )
              setDeliveryAdd(deliveryaddress);
              getDeliveryCharges();
            }}></SelectDelivery>
        </Modalize>
      </Portal>

      <Portal>
        <Modalize
          panGestureEnabled={false}
          modalTopOffset={StatusBar.currentHeight + 20}
          ref={modalizeRefTime}
          scrollViewProps={{
            scrollEnabled: false,
            contentContainerStyle: {height: '100%'},
          }}>
          <DateandTimeSelection
            cartId={cartData.customerCart.id}
            isPickup={pickupPoint ? true : false}
            CloseBottomsheet={(selectedDate, selectedTimeSlot) => {
              modalizeRefTime.current?.close();
              setselectedDate(selectedDate);
              setselectedSlot(selectedTimeSlot);
              getDeliveryCharges();
            }}
          />
        </Modalize>
      </Portal>

      <Portal>
        <Modalize
          panGestureEnabled={false}
          modalTopOffset={StatusBar.currentHeight + 20}
          ref={modalizeRefPickup}
          scrollViewProps={{
            scrollEnabled: false,
            contentContainerStyle: {height: '100%'},
          }}>
          <PickUpPointSelection
            cartId={cartData.customerCart.id}
            data={
              CachedCartInvData &&
              CachedCartInvData.cartInventory.available_pickup_locations.filter(
                item => item.latitude !== null && item.longitude != null,
              )
            }
            CloseBottomsheet={selectedpickupPoint => {
              modalizeRefPickup.current?.close();
              setDeliveryAdd(null);
              setpickupPoint(selectedpickupPoint);
            }}
          />
        </Modalize>
      </Portal>

      <Portal>
        <Modalize
          panGestureEnabled={false}
          modalTopOffset={StatusBar.currentHeight + 20}
          ref={modalizeRefPayment}
          scrollViewProps={{
            scrollEnabled: false,
            contentContainerStyle: {height: '100%'},
          }}>
          <PaymentSelection
            cartId={cartData.customerCart.id}
            fromProfile={false}
            CloseBottomsheet={(Paymenttype, PaymentDetails) => {
              GetServiceCharges();
              modalizeRefPayment.current?.close();
              setPaymentType(Paymenttype);
              setPaymentOption(PaymentDetails);
            }}
            openAddpay={() => {
              modalizeRefPayment.current?.close();
              modalizeRefNewPayment.current?.open();
            }}
          />
        </Modalize>
      </Portal>

      <Portal>
        <Modalize
          panGestureEnabled={false}
          modalTopOffset={StatusBar.currentHeight + 20}
          ref={modalizeRefNewPayment}
          onClosed={() => modalizeRefPayment.current?.open()}
          scrollViewProps={{
            scrollEnabled: false,
            contentContainerStyle: {height: '100%'},
          }}>
          <AddPaymentMethod
            CloseBottomsheet={() =>
              modalizeRefNewPayment.current?.close()
            }></AddPaymentMethod>
        </Modalize>
      </Portal>

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
            //setAlternetAddressValsetAlternetAddressVal('abc');
            //getAddress();
            getAlternateAddress();
          }}
          scrollViewProps={{
            scrollEnabled: false,
            contentContainerStyle: {height: '100%'},
          }}>
          <AlternetAddress
            CloseBottomsheet={() => {
              modalizeRefAddress.current?.close();
            }}
            addressfromMap={AddressToMap}
            ContinuetoMap={adrs => {
              //console.log('address --->> ', adrs);
              //setAddressToMap(adrs);
              //getAddress();
              getAlternateAddress();
              modalizeRefAddress.current?.close();
            }}
          />
        </Modalize>
      </Portal>

      <CustomPBar
        showProgress={loading || CartLoading || loadingAddresses || aLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  cardNumberText: {paddingLeft: 7},
  cashitemContainer: {
    paddingLeft: 15,
    paddingTop: 15,
    paddingBottom: 15,
    borderRadius: 16,
    flexDirection: 'row',
    marginVertical: 8,
  },
  page_sub_title: {
    fontSize: 20,
    lineHeight: 28,
    fontFamily: 'Gilroy-Regular',
    fontWeight: '700',
  },

  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    marginTop: 8,
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
    paddingLeft: 10,
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
    paddingLeft: 50,
    paddingRight: 48,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    paddingBottom: 12,
  },
  container_slot: {
    justifyContent: 'center',
    alignContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',

    marginBottom: 16,
    borderRadius: 16,
  },
  text_TimeSlot: {
    marginBottom: 4,
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    lineHeight: 24,
    fontWeight: '600',
    flexWrap: 'wrap',
  },
  text_TimeSlotTime: {
    marginBottom: 4,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
    fontWeight: '400',
    flexWrap: 'wrap',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  textLabel: {
    marginLeft: 8,
  },
  checkboxLabel: {
    marginLeft: 8,
  },
  centeredText: {
    textAlign: 'center',
    color:ResorceColor.cancleclr,
    marginLeft: 50,
    marginRight:50,
    marginBottom:8,
    marginTop:8
  },
});

export default Checkout;

{
  /* <TouchableOpacity
            onPress={toggleCheckBox}
            style={styles.checkboxContainer}>
            <Icon
              name={isChecked ? 'check-square-o' : 'square-o'}
              size={24}
              color={
                isChecked
                  ? Colors.Green
                  : appTheme.type == 'dark'
                  ? colorResource.white
                  : 'black'
              }
            />
            <Text style={[styles.checkboxLabel, {color: appTheme.text}]}>
              Click here that indicate you have read and agree to terms and
              conditions
              {/* {isChecked ? 'Checked' : 'Unchecked'} */
}
{
  /*</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              Helper.HandleVibration(),
                modalizeRefTermsAndConditions.current?.open();
            }}
            style={styles.textContainer}>
            <Text
              style={{
                textAlign: 'left',
                color:
                  appTheme.type == 'dark'
                    ? colorResource.pink_product_price
                    : 'blue',
              }}>
              Trems and conditions
            </Text>
          </TouchableOpacity> */
}
