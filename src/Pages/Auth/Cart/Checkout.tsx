import {useNavigation, StackActions, useFocusEffect, useRoute, } from '@react-navigation/native';
import React, {useContext, useEffect, useState, useCallback } from 'react';
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
  Alert,
  Modal,
  Dimensions,
  
} from 'react-native';
import {Icon} from 'react-native-elements';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../Auth/Creditivoo/styles';
import {IconType} from 'react-native-dynamic-vector-icons';
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


// imports for JAMP
import AsyncStorage from '@react-native-async-storage/async-storage';
import {fetchMe} from '../../../Pages/Auth/Creditivoo/store-creditivoo/slices/auth-slice';
import {useIvoSelector, useIvoDispatch} from '../../../redux/useIvo';
import {WebView} from 'react-native-webview';
import CreditivooLogin from '../Creditivoo/CreditivooLogin'; 
import {
  CreatePaymentOrderRequest,
  createPaymentOrder,
  createMultiplePaymentsOrder,
  verifyPaymentOrder,
  createTestPaymentOrder,
} from '../../Auth/Creditivoo/services/megasoft';
import {Payment, PaymentStatus} from '../../Auth/Creditivoo/services/purchases';
import {getPurchaseById,
  RevisionResponse,
  PurchaseSimulationResponse,
  simulatePurchase,} from '../../Auth/Creditivoo/services/credit';
import {getFinancingById, FinancingTypeResponse} from '../../Auth/Creditivoo/services/plan';
import { hash } from 'react-native-fs';
import Config from 'react-native-config';
import { darkColors, lightColors } from 'Utils/themeColors';

// stripe.setOptions({
//   publishableKey: Helper.stripeKey,
//   androidPayMode: Helper.androidPayMode,
// });

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const locRefreshTimeInMin = 1440;

const Checkout = props => {
  const [cartData, setcartData] = useState(props.route.params.cData);
  const [highDimText, setHighDimText] = useState(props.route.params.highDimText);
  const [financeData] = useState(props.route.params.finance);
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



  // CONST BY JAMP 22-01-2026
  const [CachedCartData, setCachedCartData] = useState<any>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dispatchh = useIvoDispatch();
  const IVOO_APP_TENANT_ID = 5;

  const percentageToId: Record<number, number> = {
    0.40: 27,
    0.50: 28,
    0.60: 29
  };

  // const [cartData, setcartData] = useState(props.route.params.cData);
  const creditivooParams = props.route.params.creditivooData;
  const [initialPercentage, setInitialPercentage] = useState(
    creditivooParams?.initialPercentage || 0.40
  );
  const [isCartFinanciable, setIsCartFinanciable] = useState(
    creditivooParams?.isCartFinanciable ?? true
  );

  const [financingDetails, setFinancingDetails] = useState(
    creditivooParams?.financingDetails || { downPayment: 0, installment: 0, montFinance: 0 }
  );
  const route = useRoute();

 
  const purchaseId = (route.params as any)?.purchaseId as number;
  //const [error, setError] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [paymentReferencia, setPaymentReferencia] = useState<string | null>(
    null,
  );

  const [purchas, setPurchasePayment] = useState<string | null>(
    null,
  );

  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);

  const isPlanSubscription = (route.params as any)?.isPlanSubscription as
      | boolean
      | undefined;
  const paymentsFromRoute = (route.params as any)?.payments as
    | Payment[]
    | undefined;

  const [purchase, setPurchase] = useState<RevisionResponse | null>(null);
    const [financing, setFinancing] = useState<FinancingTypeResponse | null>(
      null,
    );
  //variable para validar el token de usuario creditivoo
  const {user, isLoggedIn, token} = useIvoSelector(state => state.creditivoo.auth);

  // const [initialPercentage, setInitialPercentage] = useState();
  // const [isCartFinanciable, setIsCartFinanciable] = useState(true);

  // const [financingDetails, setFinancingDetails] = useState({ downPayment: 0, installment: 0, montFinance: 0 });


  const [isCasheaSelected, setIsCasheaSelected] = useState(false);


  // END BY JAMP



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





  // By JAMP 22-01-2026

  useFocusEffect(
      useCallback(() => {
      const params = route.params as any;
      // Solo disparamos si hay señal, hay usuario y EL MONTO YA SE CALCULÓ
      if (params?.autoCheckout && user?.username && financingDetails?.downPayment > 0) {
        
        console.log('[Cart] Ejecutando checkout automático con monto:', financingDetails.downPayment);
        
        // Limpiamos el parámetro para que no se repita
        navigation.setParams({ autoCheckout: undefined } as any);
  
        // Ejecutamos
        handleCreditivooCheckout();
      }
    }, [route.params, user?.username, financingDetails?.downPayment])
  );

  const handleVerificationFlow = async (referencia: string) => {
      try {
        setIsVerifyingPayment(true);
        const result = await verifyPaymentOrder({
          control: referencia,
          purchaseId: purchaseId, // Asegúrate de tener esta variable disponible
        });
  
        if (result.approved) {
          const targetScreen = isPlanSubscription ? 'SubscriptionSuccess' : 'PurchaseSuccess';
          (navigation as any).navigate(targetScreen, { purchaseId });
        } else {
          Alert.alert('Pago no verificado', 'El pago no fue aprobado.');
        }
      } catch (err) {
        Alert.alert('Error', 'No se pudo verificar el pago.');
      } finally {
        setIsVerifyingPayment(false);
      }
    };

  const handleWebViewNavigationStateChange = (navState: any) => {
      console.log('[WebView] URL:', navState.url);
  
    // Reemplaza 'URL_EXITO' por la cadena que devuelva Megasoft al pagar (ej: 'approved')
      if (navState.url.includes('approved') || navState.url.includes('success')) {
        setIsProcessingPayment(false); // Cierra el Modal
        
        // Ejecuta la verificación final o navega al éxito
        (navigation as any).navigate(Routes.NAVIGATION_PURCHASESSUCCESS, { 
          purchaseId: purchaseId,
          referencia: paymentReferencia 
        });
      }
  
      
    };

    
    // comienza el flujo de creditivoo


  const handleWebViewClose = async () => {

      console.log('[PurchaseConfirmation] WebView cerrado por el usuario');
      console.log(
        '[PurchaseConfirmation] Referencia del pago:',
        paymentReferencia,
      );
  
      // Cerrar el modal del WebView
      setPaymentUrl(null);
      setIsProcessingPayment(false);
      

      
      // Si no hay referencia, no podemos verificar
      if (!paymentReferencia) {
        console.warn(
          '[PurchaseConfirmation] No hay referencia para verificar el pago',
        );
        Alert.alert(
          'Error',
          'No se pudo verificar el pago. Por favor, intenta nuevamente.',
        );
        return;
      }
  
      // Verificar el estado del pago
      try {
        setIsVerifyingPayment(true);
        console.log(
          '[PurchaseConfirmation] Verificando estado del pago con referencia:',
          paymentReferencia,
        );

        
        
        const verificationResult = await verifyPaymentOrder({
          control: paymentReferencia,
          purchaseId: Number(purchas),
        });
        
        
        Alert.alert(''+JSON.stringify(verificationResult));
        console.log(
          '[PurchaseConfirmation] Resultado de verificaci?n:',
          verificationResult,
        );
  
        if (verificationResult.approved) {
          // Pago aprobado, navegar a la pantalla de ?xito correspondiente
          if (isPlanSubscription) {
            console.log(
              '[PurchaseConfirmation] Pago aprobado, navegando a SubscriptionSuccess',
            );
            (navigation as any).navigate(Routes.NAVIGATION_SUSCRIPTIONSUCCESS, {
              purchaseId: purchaseId,
            });
          } else {
            console.log(
              '[PurchaseConfirmation] Pago aprobado, navegando a PurchaseSuccess',
            );
            (navigation as any).navigate(Routes.NAVIGATION_TO_CHECKOUT, {
              purchaseId: purchaseId,
            });
          }
        } else {
          // Pago no aprobado o pendiente
          console.log(
            '[PurchaseConfirmation] Pago no aprobado o pendiente. Estado:',
            verificationResult.status,
          );
          Alert.alert(
            'Pago no verificado',
            'El pago no pudo ser verificado. Por favor, intenta nuevamente o verifica con tu banco.',
          );
        }
      } catch (verifyError: any) {
        console.error(
          '[PurchaseConfirmation] Error al verificar el pago:',
          verifyError,
        );
        Alert.alert(
          'Error',
          verifyError.message ||
            'No se pudo verificar el estado del pago. Por favor, intenta nuevamente.',
        );
      } finally {
        setIsVerifyingPayment(false);
        // Limpiar la referencia despu?s de verificar
        setPaymentReferencia(null);
      }
    };


  const handleCreditivooCheckout = async () => {
    Helper.HandleVibration();
    setIsCreatingOrder(true);

    const creditivooContext = {
        initialPercentage,
        isCartFinanciable,
        financingDetails,
      };
    
    //obtenemos lo que tiene el carrito
   const totalCart = financingDetails?.total;

   const cedulaUsuario = user?.document;

  
   // verificamos que el usuario exista en creditivoo https://api-ivoo-dev.whaledigitals.com/purchases/paymentValidator/transaction/confirm/p/@control
      // Alert.alert(''+user?.username);

    if (!user?.username) {
      
    // Si no hay usuario, vamos al login directamente
      (navigation as any).navigate("CreditivooLogin", { 
        redirectTo: "Cart", 
        autoCheckout: true,
        checkoutData: { 
          selectedPercentage: initialPercentage 
        } 
      });
      return;
    }
    
    try {

      
      const userUrl = 'https://api-ivoo-dev.whaledigitals.com/api';

      const userCheck = await fetch(`${userUrl}/users/client/document/${cedulaUsuario}?role=CUSTOMER&document=${cedulaUsuario}&page=1&Size=1`, {
        method: 'GET',
        headers: { 'Accept': 'application/json', 'Authorization': `Bearer: ${token}` }
        
      });

      const userText = await userCheck.text();
      const userObj = JSON.parse(userText);
      const userr = userObj.user;

      const creditivooUser = userr;

      //Alert.alert(''+parseInt(GrandTotal.slice(1)));
      


      if (!creditivooUser.creditStatus) {
        Alert.alert("Atención", "No se encontró el registro de crédito para esta cédula.");
        return;
      }
      
      // --- BLOQUE DE VALIDACIONES CON CAMPOS REALES ---
    
    // Validar Estatus (creditStatus)
    if (creditivooUser.creditStatus !== 'ACTIVE') {
      Alert.alert("Validación", "Su línea de crédito no está activa.");
      return;
    }

    // Validar Disponible (creditAvailable)
    if (!creditivooUser.creditAvailable || creditivooUser.creditAvailable <= 0 ) {
      Alert.alert("Validación", "No posee saldo disponible en su línea de crédito.");
      return;

    }

    // Validar Facturas Pendientes (hasPurchasePendingInvoice)
    if (creditivooUser.hasPurchasePendingInvoice === true) {
      Alert.alert("Validación", "Posee facturas pendientes de pago. Por favor regularice su situación.");
      return;
    }

    // Validar Compra en Progreso (hasPurchaseInProgress)
    if (creditivooUser.hasPurchaseInProgress === true) {
      Alert.alert("Validación", "Ya tiene una solicitud de compra en curso.");
      return;
    }


      // Preparamos los datos que necesitan las cuotas
      const checkoutData = {
        selectedPercentage: initialPercentage,
        totalAmount: parseInt(GrandTotal.slice(1)),
        isFinancing: true
      };
      //const totalAmount = CachedCartData?.customerCart?.prices?.grand_total?.value;
      const montoInicial = financingDetails.downPayment;

      //Alert.alert("inicial "+montoInicial);
      
      if (!montoInicial) {
        Alert.alert("Error", "No se pudo obtener el monto total del carrito.");
        return;
      }

      // generas la compra en status draft
      const purchaseResponse = await fetch(`${userUrl}/purchases`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Asegúrate de que el token sea el correcto
        },
          body: JSON.stringify({
            tenantId: Number(IVOO_APP_TENANT_ID),
            totalAmount: parseInt(GrandTotal.slice(1)),
            userId: Number(creditivooUser.id) // Aquí convertimos el "36" a 36
          })
        }
      );

      const responsepurchase = await purchaseResponse.text(); 
      const purchase = JSON.parse(responsepurchase);

      //Alert.alert(""+Number(purchase.id));
      //cargar el plan elegido para que se actualice la compra anexando la inicial a pagar y las cuotas
      
      // recibiendo lo que tiene el selector
      const selectedPerc = checkoutData?.selectedPercentage || 0.40;

      // convirtiendolo al ID de financiamiento
      const financingId = percentageToId[selectedPerc] || 27;

      const purchaseUpdate = await fetch(`${userUrl}/purchases/${purchase.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Asegúrate de que el token sea el correcto
        },
          body: JSON.stringify({
            
            financingTypeId: Number(financingId) // Aquí lo que carga el selector de porcentajes
          })
        }
      );


        //Alert.alert(""+Number(purchase.id));
      const paymentOrderRequest: CreatePaymentOrderRequest = {
        
        amount: montoInicial, // Enviamos el monto para que MegaSoft genere el link
         //purchaseId: Number(purchase.id) // Solo incluir si ya creaste la orden en tu backend
      };

      const response = await createPaymentOrder(paymentOrderRequest);

      

      const isAutoCompleted = response.referencia?.includes('AUTO_COMPLETED') || (response as any).isAlreadyVerified;
      //Alert.alert(''+JSON.stringify(isAutoCompleted));
      //Alert.alert(""+JSON.stringify(isAutoCompleted));
      
      if (isAutoCompleted) {
        await handleVerificationFlow(response.referencia);
      } else if (response.paymentUrl) {
        // --- CAMBIO AQUÍ: ACTIVAR MODAL EN LUGAR DE NAVEGAR ---
        console.log('[Checkout] Activando Modal de pago:', response.paymentUrl);
        
        setPaymentUrl(response.paymentUrl);
        setPaymentReferencia(response.referencia);
        setIsProcessingPayment(true);     // Muestra el Modal
        setPurchasePayment(purchase.id);
      } else {
        throw new Error("No se recibió una URL de pago válida.");
      }
    } catch (error: any) {
      console.error('[Checkout] Error:', error.message);
      Alert.alert('Error de Pago', error.message || 'Error al procesar la solicitud con MegaSoft.');
    } finally {
      setIsCreatingOrder(false);
    }
  
  };


  // end By JAMP







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
            {/* <Text
              style={[
                commonStyle.profileHeader,
                commonStyle.fontBold,
                {paddingBottom: 0, color: appTheme.text},
              ]}>
              {translate('order.lbl_payment')}
            </Text> */}
            {



              <View style={{marginBottom: 20, marginTop: 10}}>
                
                <Text style={[commonStyle.h5, {color: appTheme.text, marginBottom: 12, fontWeight: 'bold'}]}>
                  {translate('checkout.lbl_select_payment')}
                </Text>

                {/* Opción: Creditivoo */}
                <TouchableOpacity style={[styles.methodItem, Paymenttype === 'creditivoo' && styles.methodItemActive]} onPress={handleCreditivooCheckout}>
                  <View style={commonStyle.flexDir_Row}>
                    <ProgressiveImage source={ResImage.ic_creditivodark_green} style={styles.methodIcon} />
                    <Text style={[commonStyle.h5, {color: appTheme.text}]}>Creditivoo</Text>
                  </View>
                  
                  
                </TouchableOpacity>

                {/* Opción: Cashea */}
                <TouchableOpacity 
                  onPress={() => setPaymentType('cashea')}
                  style={[styles.methodItem, Paymenttype === 'cashea' && styles.methodItemActive]}
                >
                  <View style={commonStyle.flexDir_Row}>
                    <ProgressiveImage source={ResImage.ic_cashea} style={styles.methodIcon} />
                    <Text style={[commonStyle.h5, {color: appTheme.text}]}>Cashea</Text>
                  </View>
                  {/* <View style={[styles.radioCircle, Paymenttype === 'cashea' && styles.radioCircleSelected]} /> */}
                </TouchableOpacity>

                {/* Opción: En Tienda */}
                <TouchableOpacity 
                  onPress={() => setPaymentType('cash')}
                  style={[styles.methodItem, Paymenttype === 'cash' && styles.methodItemActive]}
                >
                  <View style={commonStyle.flexDir_Row}>
                    <ProgressiveImage source={ResImage.ic_Cash} style={styles.methodIcon} />
                    <Text style={[commonStyle.h5, {color: appTheme.text}]}>Pago en Tienda</Text>
                  </View>
                  {/* <View style={[styles.radioCircle, Paymenttype === 'cash' && styles.radioCircleSelected]} /> */}
                </TouchableOpacity>
              </View>

              
              // <TouchableOpacity
              //   style={{marginBottom: 80}}
              //   onPress={() => {
              //     openPaymentSelection();
              //   }}>
              //   {!Paymenttype && (
              //     <View
              //       style={[
              //         commonStyle.profileContainer,
              //         commonStyle.flexDir_Row,
              //         commonStyle.flexDir_Row,
              //         commonStyle.justifyContent_flex_start,
              //         {
              //           padding: 12,
              //           marginTop: 8,
              //           alignItems: 'center',
              //           backgroundColor: appTheme.InputBoxBGColor,
              //         },
              //       ]}>
              //       <ProgressiveImage
              //         source={isDark ? ResImage.ic_Plus : ResImage.ic_plus_gray}
              //         style={{paddingRight: 8}}></ProgressiveImage>
              //       <Text
              //         style={[
              //           commonStyle.h5,
              //           {
              //             color: isDark
              //               ? colorResource.disable_clr
              //               : colorResource.Gray,
              //           },
              //         ]}>
              //         {translate('checkout.lbl_select_payment')}
              //       </Text>
              //     </View>
              //   )}
              //   {Paymenttype == 'cash' && (
              //     <View
              //       style={[
              //         styles.cashitemContainer,
              //         commonStyle.padding_12,
              //         {backgroundColor: appTheme.InputBoxBGColor},
              //       ]}>
              //       <ProgressiveImage
              //         source={ResImage.ic_Cash}
              //         style={[styles.type_icon, {paddingLeft: 15}]}
              //         resizeMode="center"></ProgressiveImage>
              //       <View style={{paddingLeft: 6}}>
              //         <Text
              //           style={[
              //             commonStyle.h5,
              //             commonStyle.fontBold,
              //             {paddingLeft: 6, color: appTheme.text},
              //           ]}>
              //           {translate('payment.lbl_incash')}
              //         </Text>
              //       </View>
              //       <View style={{flex: 1, alignItems: 'flex-end'}}>
              //         <ProgressiveImage
              //           source={ResImage.ic_pen}
              //           style={[
              //             commonStyle.he_wi_24,
              //             {marginRight: 4, alignSelf: 'flex-end'},
              //           ]}
              //         />
              //       </View>
              //     </View>
              //   )}
              //   {Paymenttype == 'card' && (
              //     <View
              //       style={[
              //         styles.cashitemContainer,
              //         commonStyle.padding_12,
              //         {
              //           backgroundColor: appTheme.InputBoxBGColor,
              //         },
              //       ]}>
              //       {PaymentOption.brand == 'visa' && (
              //         <ProgressiveImage
              //           source={ResImage.ic_visa}
              //           style={[styles.type_icon, {paddingLeft: 15}]}
              //         />
              //       )}
              //       {PaymentOption.brand == 'mastercard' && (
              //         <ProgressiveImage
              //           source={ResImage.ic_mastercard}
              //           style={[styles.type_icon, {paddingLeft: 15}]}
              //         />
              //       )}
              //       {PaymentOption.brand == 'amex' && (
              //         <ProgressiveImage
              //           source={ResImage.ic_amex}
              //           style={[styles.type_icon, {paddingLeft: 15}]}
              //         />
              //       )}

              //       <View style={{flex: 1, marginLeft: 6}}>
              //         <Text
              //           style={[
              //             commonStyle.h5,
              //             commonStyle.fontBold,
              //             {
              //               paddingLeft: 6,
              //               color: appTheme.text,
              //               textTransform: 'capitalize',
              //             },
              //           ]}>
              //           {PaymentOption.brand}
              //         </Text>
              //         <Text
              //           style={[
              //             commonStyle.h6,
              //             commonStyle.fontNormal,
              //             styles.cardNumberText,
              //             {
              //               color: isDark
              //                 ? colorResource.disable_clr
              //                 : colorResource.Gray,
              //             },
              //           ]}>
              //           {PaymentOption.card_number}
              //         </Text>
              //       </View>
              //       <View style={{flex: 1, alignItems: 'flex-end'}}>
              //         <ProgressiveImage
              //           source={ResImage.ic_pen}
              //           style={[
              //             commonStyle.he_wi_24,
              //             {marginRight: 4, alignSelf: 'flex-end'},
              //           ]}
              //         />
              //       </View>

              //       <View></View>
              //     </View>
              //   )}
              //   {Paymenttype == 'movil' && (
              //     <View
              //       style={[
              //         styles.cashitemContainer,
              //         commonStyle.padding_12,
              //         {backgroundColor: appTheme.InputBoxBGColor},
              //       ]}>
              //       <ProgressiveImage
              //         source={ResImage.ic_movil}
              //         style={[styles.type_icon, {paddingLeft: 15}]}
              //         resizeMode="center"></ProgressiveImage>
              //       <View style={{paddingLeft: 6}}>
              //         <Text
              //           style={[
              //             commonStyle.h5,
              //             commonStyle.fontBold,
              //             {paddingLeft: 6, color: appTheme.text},
              //           ]}>
              //           {translate('NewPaymentMethods.movilTitle')}
              //         </Text>
              //       </View>
              //       <View style={{flex: 1, alignItems: 'flex-end'}}>
              //         <ProgressiveImage
              //           source={ResImage.ic_pen}
              //           style={[
              //             commonStyle.he_wi_24,
              //             {marginRight: 4, alignSelf: 'flex-end'},
              //           ]}
              //         />
              //       </View>
              //     </View>
              //   )}
              //   {Paymenttype == 'hs_paypal' && (
              //     <View
              //       style={[
              //         styles.cashitemContainer,
              //         commonStyle.padding_12,
              //         {backgroundColor: appTheme.InputBoxBGColor},
              //       ]}>
              //       <ProgressiveImage
              //         source={ResImage.ic_paypal}
              //         style={[styles.type_icon, {paddingLeft: 15}]}
              //         resizeMode="center"></ProgressiveImage>
              //       <View style={{paddingLeft: 6}}>
              //         <Text
              //           style={[
              //             commonStyle.h5,
              //             commonStyle.fontBold,
              //             {paddingLeft: 6, color: appTheme.text},
              //           ]}>
              //           {translate('NewPaymentMethods.paypalTitle')}
              //         </Text>
              //       </View>
              //       <View style={{flex: 1, alignItems: 'flex-end'}}>
              //         <ProgressiveImage
              //           source={ResImage.ic_pen}
              //           style={[
              //             commonStyle.he_wi_24,
              //             {marginRight: 4, alignSelf: 'flex-end'},
              //           ]}
              //         />
              //       </View>
              //     </View>
              //   )}
              //   {Paymenttype == 'zelle' && (
              //     <View
              //       style={[
              //         styles.cashitemContainer,
              //         commonStyle.padding_12,
              //         {backgroundColor: appTheme.InputBoxBGColor},
              //       ]}>
              //       <ProgressiveImage
              //         source={ResImage.ic_zelle}
              //         style={[styles.type_icon, {paddingLeft: 15}]}
              //         resizeMode="center"></ProgressiveImage>
              //       <View style={{paddingLeft: 6}}>
              //         <Text
              //           style={[
              //             commonStyle.h5,
              //             commonStyle.fontBold,
              //             {paddingLeft: 6, color: appTheme.text},
              //           ]}>
              //           {translate('NewPaymentMethods.zelleTitle')}
              //         </Text>
              //       </View>
              //       <View style={{flex: 1, alignItems: 'flex-end'}}>
              //         <ProgressiveImage
              //           source={ResImage.ic_pen}
              //           style={[
              //             commonStyle.he_wi_24,
              //             {marginRight: 4, alignSelf: 'flex-end'},
              //           ]}
              //         />
              //       </View>
              //     </View>
              //   )}
              //   {Paymenttype == 'banesco' && (
              //     <View
              //       style={[
              //         styles.cashitemContainer,
              //         commonStyle.padding_12,
              //         {backgroundColor: appTheme.InputBoxBGColor},
              //       ]}>
              //       <ProgressiveImage
              //         source={ResImage.ic_banesco}
              //         style={[styles.type_icon, {paddingLeft: 15}]}
              //         resizeMode="center"></ProgressiveImage>
              //       <View style={{paddingLeft: 6}}>
              //         <Text
              //           style={[
              //             commonStyle.h5,
              //             commonStyle.fontBold,
              //             {paddingLeft: 6, color: appTheme.text},
              //           ]}>
              //           {translate('NewPaymentMethods.banescoTitle')}
              //         </Text>
              //       </View>
              //       <View style={{flex: 1, alignItems: 'flex-end'}}>
              //         <ProgressiveImage
              //           source={ResImage.ic_pen}
              //           style={[
              //             commonStyle.he_wi_24,
              //             {marginRight: 4, alignSelf: 'flex-end'},
              //           ]}
              //         />
              //       </View>
              //     </View>
              //   )}
              //   {Paymenttype == 'hs_bank_transfer' && (
              //     <View
              //       style={[
              //         styles.cashitemContainer,
              //         commonStyle.padding_12,
              //         {backgroundColor: appTheme.InputBoxBGColor},
              //       ]}>
              //       <ProgressiveImage
              //         source={ResImage.ic_boli}
              //         style={[styles.type_icon, {paddingLeft: 15}]}
              //         resizeMode="center"></ProgressiveImage>
              //       <View style={{paddingLeft: 6}}>
              //         <Text
              //           style={[
              //             commonStyle.h5,
              //             commonStyle.fontBold,
              //             {paddingLeft: 6, color: appTheme.text},
              //           ]}>
              //           {translate('NewPaymentMethods.bolivaresTitle')}
              //         </Text>
              //       </View>
              //       <View style={{flex: 1, alignItems: 'flex-end'}}>
              //         <ProgressiveImage
              //           source={ResImage.ic_pen}
              //           style={[
              //             commonStyle.he_wi_24,
              //             {marginRight: 4, alignSelf: 'flex-end'},
              //           ]}
              //         />
              //       </View>
              //     </View>
              //   )}
              // </TouchableOpacity>
            }
          </View>
        </View>
        <Modal
            visible={isProcessingPayment && !!paymentUrl}
            animationType="slide"
            // onRequestClose={() => setIsProcessingPayment(false)}>
            onRequestClose={handleWebViewClose}>
            <View style={styles.webViewContainer}>
              <View style={styles.webViewHeader}>
                <Text style={styles.webViewTitle}>Procesando pago</Text>
                <TouchableOpacity
                  // onPress={() => setIsProcessingPayment(false)}
                  onPress={handleWebViewClose}
                  style={styles.closeButton}>
                  <Icon
                    name="close"
                    type={IconType.Ionicons}
                    size={24}
                    color={IVOO_COLORS.black}
                  />
                </TouchableOpacity>
              </View>
              {paymentUrl && (
                <WebView
                  source={{ uri: paymentUrl }}
                  style={styles.webView}
                  onNavigationStateChange={handleWebViewNavigationStateChange}
                  startInLoadingState={true}
                  javaScriptEnabled={true}
                  domStorageEnabled={true}
                />
              )}
            </View>
          </Modal>
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
                ? darkColors.InputBoxBGColor
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
                    {color: appTheme.text, fontWeight: '700', paddingVertical:10},
                  ]}>
                  Monto inicial
                </Text>
                <Text style={[commonStyle.h6, {color: appTheme.text}]}>
                  {Helper.currencyFormat(
                    financingDetails.downPayment
                    //cartData.customerCart.prices.subtotal_excluding_tax.value,
                  )}
                </Text>
                
              </View>
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
                      {color: appTheme.text, fontWeight: '700', paddingVertical:10},
                    ]}>
                    Monto a Financiar
                  </Text>
                  <Text style={[commonStyle.h6, {color: appTheme.text}]}>
                    {Helper.currencyFormat(
                      financingDetails.montFinance
                      //cartData.customerCart.prices.subtotal_excluding_tax.value,
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

  // BY JAMP 22-06-2026
    //modal

    webViewContainer: {
      flex: 1,
      backgroundColor: IVOO_COLORS.white,
    },
    webViewHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: SCREEN_WIDTH * 0.05,
      paddingVertical: SCREEN_HEIGHT * 0.02,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(0, 0, 0, 0.1)',
      backgroundColor: IVOO_COLORS.white,
    },
    webViewTitle: {
      fontSize: SCREEN_WIDTH * 0.042,
      fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
      fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
      color: IVOO_COLORS.black,
    },
    closeButton: {
      padding: SCREEN_WIDTH * 0.01,
    },
    webView: {
      flex: 1,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: SCREEN_WIDTH * 0.05,
    },
    modalContent: {
      backgroundColor: IVOO_COLORS.white,
      borderRadius: 16,
      width: '100%',
      maxWidth: SCREEN_WIDTH * 0.9,
      padding: SCREEN_WIDTH * 0.05,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 10,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SCREEN_HEIGHT * 0.02,
    },
    modalTitle: {
      fontSize: SCREEN_WIDTH * 0.048,
      fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
      fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
      color: IVOO_COLORS.black,
    },
    modalCloseButton: {
      padding: SCREEN_WIDTH * 0.01,
    },
    modalBody: {
      marginBottom: SCREEN_HEIGHT * 0.02,
    },
    modalLabel: {
      fontSize: SCREEN_WIDTH * 0.038,
      fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
      color: IVOO_COLORS.black,
      marginBottom: SCREEN_HEIGHT * 0.01,
    },
    modalInput: {
      borderWidth: 1,
      borderColor: 'rgba(110, 113, 124, 0.3)',
      borderRadius: 12,
      paddingHorizontal: SCREEN_WIDTH * 0.04,
      paddingVertical: SCREEN_HEIGHT * 0.015,
      fontSize: SCREEN_WIDTH * 0.042,
      fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
      color: IVOO_COLORS.black,
      backgroundColor: '#F9FAFC',
    },
    modalFooter: {
      flexDirection: 'row',
      gap: SCREEN_WIDTH * 0.03,
      marginTop: SCREEN_HEIGHT * 0.01,
    },
    modalButton: {
      flex: 1,
      borderRadius: 12,
      paddingVertical: SCREEN_HEIGHT * 0.015,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalButtonCancel: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: IVOO_COLORS.primary,
    },
    modalButtonConfirm: {
      backgroundColor: IVOO_COLORS.primary,
    },
    modalButtonCancelText: {
      fontSize: SCREEN_WIDTH * 0.042,
      fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
      fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
      color: IVOO_COLORS.primary,
    },
    modalButtonConfirmText: {
      fontSize: SCREEN_WIDTH * 0.042,
      fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
      fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
      color: '#FFFFFF',
    },

    creditivooCartBadge: {
      backgroundColor: '#000000',
      padding: 16,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: '#2E7D32', // Borde verde para resaltar sobre el negro
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
    creditivooTag: {
    color: '#ffffff', // Texto verde llamativo
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  creditivooCuotas: {
    color: '#FFFFFF', // Texto de las cuotas en blanco para legibilidad
    fontSize: 13,
    textAlign: 'center',
    opacity: 0.9,
  },

  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    backgroundColor: darkColors?.InputBoxBGColor ,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  methodItemActive: {
    borderColor: colorResource.primary, // O el color de tu marca
    //backgroundColor: isDark ? '#1a2a1a' : '#f0fff0',
  },
  methodIcon: {
    width: 35,
    height: 24,
    marginRight: 12,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colorResource.Gray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: colorResource.primary,
    backgroundColor: colorResource.primary,
  },


  // BY JAMP




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
