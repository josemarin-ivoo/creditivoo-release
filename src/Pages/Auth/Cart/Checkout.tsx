import { useNavigation, StackActions } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import React, {
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from 'react';
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
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { IVOO_COLORS, IVOO_TYPOGRAPHY } from '../../../styles';
import commonStyle from '../../../../commonStyle';
import CustomPBar from '../../../Components/CustomPBar';
import Helper from '../../../Utils/Helper';
import ProgressiveImage from '../../../Components/ProgressiveImage';
import { useDispatch, useSelector } from 'react-redux';
import { translate } from '../../../locales';
import { Icon } from 'react-native-elements';
import { IconType } from 'react-native-dynamic-vector-icons';
import {
  cartInventory,
  customerAddressList,
  customerAlternateAddressList,
  GetDeliveryCharge,
  GetServiceCharge,
  placeOrder,
  cancelOrder,
  sendLocationToServer,
  setAddress,
  setAlternateAddress,
  setPickupddressesOnCart,
  PickupShippingMethod,
  setBillingAddressMutation,
  setDeliveryTime,
  getDeliveryTime,
  setPaymentMethodOnCart,
  setPaymentMethodOnCartCod,
  setAddressMutation,

  setShippingMethodMutation,
  getAvailablePaymentandShipping,
  updateCustomerAddress,
  AddAddress,
  setShippingAddressOnCartById,

} from '../../../Queries/queries';
import CustomHeader from '../../../Components/CustomHeader';
import ResImage from '../../../Utils/Image';
import colorResource from '../../../Utils/Colors';
import { Modalize } from 'react-native-modalize';
import { Portal } from 'react-native-portalize';
import SelectDelivery from './SelectDelivery';
import DateandTimeSelection from './DateandTimeSelection';
// import stripe from 'tipsi-stripe';
import { Routes } from '../../../Utils/NavigationRoutes';
import PickUpPointSelection from './PickUpPointSelection';
import PaymentSelection from './Payment/PaymentSelection';
import CommonHandlers from '../../../Utils/CommonHandlers';
import Moment from 'moment';

import { cartDelete } from '../../../redux/cartAction';
import { useLazyQuery, useQuery, useApolloClient } from '@apollo/client';
import { CustomButton } from '../../../Components/CustomButton';

import AddPaymentMethod from './Payment/AddPaymentMethod';
import { CartItemCounterAction } from '../../../redux/cartItemCounterAction';
// import Helper from './../../../Utils/Helper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Geolocation from 'react-native-geolocation-service';

import { AppContext } from '../../AppContext';
import { check, PERMISSIONS, RESULTS, request } from 'react-native-permissions';
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
import { Clear_CARTITEMS } from '../../../redux/CartCacheReducer/CartCacheAction';
import { DELETE_DATETIMESLOT } from '../../../redux/DateTimeSlotReducers/DateTimeSlotAction';
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
import { setItemInStorage } from './../../../Utils/Storage';
import Colors from '../../../Utils/Colors';
import TermsAndConditions from './TermsAndConditions';
import NewAddress from '../UserProfile/NewAddress';
import AlternetAddress from '../UserProfile/AlternetAddress';
import {
  AddAlternetAddress,
  ClearAlternetAddress,
} from '../../../redux/AlternetAddressReducers/AlternetAddressAction';
import ResorceColor from '../../../Utils/Colors';

import { ShippingMethod, ShippingDetails } from './ShippingMethod';
import { lightColors } from '../../../Utils/themeColors';
import { syncOrderToCreditivoo } from '../../../../inventorySync';
import { getLatestBcvRate, usdToVes } from '../../../../exchangeRate';

// stripe.setOptions({
//   publishableKey: Helper.stripeKey,
//   androidPayMode: Helper.androidPayMode,
// });

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const locRefreshTimeInMin = 1440;

const Checkout = props => {
  // Add Rfusco22 11/03/26 - Función para validar que la ruta de envío esté completa
  const validateShippingRoute = () => {
    if (!shippingData) {
      Alert.alert(
        'Error',
        'Por favor, completa la información de envío o retiro antes de continuar.',
      );
      return false;
    }

    const { method, store, destination, address, providerId } = shippingData;

    // Validación para DELIVERY
    if (method === 'delivery') {
      if (!store) {
        Alert.alert('Error', 'Falta seleccionar la tienda de origen.');
        return false;
      }
      if (!destination || !address) {
        Alert.alert('Error', 'Falta ingresar la dirección de destino.');
        return false;
      }
      if (!providerId) {
        Alert.alert(
          'Error',
          'Debes seleccionar un transporte disponible para tu ubicación.',
        );
        return false;
      }
    }

    // Validación para PICKUP
    if (method === 'pickup') {
      if (!store) {
        Alert.alert(
          'Error',
          'Por favor, selecciona una tienda para retirar tu pedido.',
        );
        return false;
      }
    }

    return true;
  };
  // End Rfusco22 11/03/26
  // added Frodriguez const

  const monto_total = useRef(0);
  const casheaWebRef = useRef<WebView>(null);
  const casheaPayloadSentRef = useRef(false);

  const [isProcessingCashea, setIsProcessingCashea] = useState(false);
  const [casheaUrl, setCasheaUrl] = useState<string | null>(null);

  const [casheaPayload, setCasheaPayload] = useState<CasheaPayload | null>(
    null,
  );

  // preorden
  const [casheaPreorderId, setCasheaPreorderId] = useState<string>('');

  // cedula
  const [casheaCedula, setCasheaCedula] = useState<string>('');

  //cashea DownPayment
  const [casheaDownPayment, setCasheaDownPayment] = useState<string | null>(
    null,
  );

  //cashea Finance Amount
  const [casheaFinanceAmount, setCasheaFinanceAmount] = useState<string | null>(
    null,
  );

  //cashea Order
  type CasheaOrderResponse = any;
  const [casheaOrder, setCasheaOrder] = useState<CasheaOrderResponse | null>(
    null,
  );

  // modal nativo para pedir cédula
  const [showCasheaIdModal, setShowCasheaIdModal] = useState(false);
  const [casheaIdDraft, setCasheaIdDraft] = useState<string>('');

  const casheaReturnHandledRef = useRef(false);

  // validador simple
  const MIN_CEDULA_DIGITS = 6;
  const MAX_CEDULA_DIGITS = 11;

  //validadores para megasoft
  const casheaFlowLockRef = useRef(false);
  const megasoftFacturaRef = useRef<string>('');
  const megasoftControlRef = useRef<string>('');
  const [isCasheaDone, setIsCasheaDone] = useState(false);
  const [isPlacingOrderFromCashea, setIsPlacingOrderFromCashea] =
    useState(false);
  const [isMegasoftPaid, setIsMegasoftPaid] = useState(false);

  const casheaIdDraftRef = useRef<string>('');
  const [casheaIdDraftUI, setCasheaIdDraftUI] = useState<string>(''); // opcional: solo para mostrar inicial
  const [isCasheaIdValid, setIsCasheaIdValid] = useState(false);

  const validateCedula = (txt: string) => {
    const clean = (txt || '').replace(/\D/g, '');
    casheaIdDraftRef.current = clean;

    const ok =
      clean.length >= MIN_CEDULA_DIGITS && clean.length <= MAX_CEDULA_DIGITS;

    setIsCasheaIdValid(ok);
  };

  // DEBUG / TEST SYNC
  const [showSyncDebug, setShowSyncDebug] = useState(false);
  const [syncPayloadPreview, setSyncPayloadPreview] = useState<any>(null);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);

  //tasas
  const megasoftRateRef = useRef<{
    rate: number;
    fetchedAtVe: string;
    amountUsd: number;
    amountBs: number;
  } | null>(null);

  // para digitos en limpiar inputs de cedula y monto

  const cleanDigits = (v: any) =>
    String(v ?? '')
      .replace(/\D/g, '')
      .trim();

  const cleanText = (v: any) => String(v ?? '').trim();

  // dentro del componente
  const client = useApolloClient();

  // normalizador de calle: si viene string, lo convierte a array; si viene array, lo deja; si viene vacío o inválido, pone ['Calle', '']
  const normalizeStreet = (s: any): string[] => {
    if (Array.isArray(s)) return s;
    if (typeof s === 'string' && s.trim()) return [s.trim(), ''];
    return ['Calle', ''];
  };


  const [addAddress] = AddAddress();
  const [updateAddress] = updateCustomerAddress();
  const [setShippingAddressById] = setShippingAddressOnCartById();

  // end Frodriguez

  const [cartData, setcartData] = useState(props.route.params.cData);
  const [highDimText, setHighDimText] = useState(
    props.route.params.highDimText,
  );
  const [isChecked, setIsChecked] = useState(false);
  const { appTheme, themeName } = useContext(AppContext);

  const [isDark, setDark] = useState(themeName === 'dark');

  useEffect(() => {
    setDark(themeName === 'dark');
  }, [themeName]);

  const navigation = useNavigation();
  const dispatch = useDispatch();
  // const [cartDeliveryAddID, setcartDeliveryAddID] = useState( null );
  const [deliveryAdd, setDeliveryAdd] = useState(null);
  const [pickupPoint, setpickupPoint] = useState(null);
  const [selectedDate, setselectedDate] = useState(null);
  const [selectedSlot, setselectedSlot] = useState(null);
  const [Paymenttype, setPaymentType] = useState(null);
  const [cashea, setcashea] = useState(null);
  const [PaymentOption, setPaymentOption] = useState(null);

  //para calculo de delivery
  const [DeliveryCharge, setDeliveryCharge] = useState('$0.00');
  const [Discount, setDiscount] = useState('$0.00');
  const [ServiceFees, setServiceFees] = useState('$0.00');
  //para calculo de delivery fin

  const [GrandTotal, setGrandTotal] = useState('$0.00');
  const lastGrandTotal = useRef('$0.00');
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

  const [originName, setOriginName] = useState<string>('');
  const [destinationAddress, setDestinationAddress] = useState<string>('');
  const [shippingData, setShippingData] = useState<ShippingDetails | null>(
    null,
  );
  const [
    setShipAddress,
    { loading: pickupAddrLoading, error: pickupAddrError, data: aaData },
  ] = setPickupddressesOnCart();
  const [cdID, setCartId] = useState(props.cartId);
  const [
    setPickupShippingMethod,
    { loading: pickupLoading, error: pickupError, data: pickupData },
  ] = PickupShippingMethod();
  const [setBilling] = setAddress();
  const [setBillingAddress] = setBillingAddressMutation();
  const [setDateTime] = setDeliveryTime();
  const [fetchSlots, { data: timeSlotData }] = useLazyQuery(getDeliveryTime, {
    fetchPolicy: 'no-cache',
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [setPaymentMethod] = setPaymentMethodOnCartCod(); // metodo de pago

  const [setDeliveryAddress] = setAddressMutation(); // delivery

  const [setShippingMethod] = setShippingMethodMutation(); //metodo de envio

  const [setPickupAddress] = setPickupddressesOnCart(); //pickup

  // para megasoft
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const [showPayModal, setShowPayModal] = useState(false);

  const openPayment = (url: string) => {
    setPaymentUrl(url);
    setShowPayModal(true);
  };

  const [
    getAddress,
    { loading: loadingAddresses, error: errorAddresses, data: dataAddresses },
  ] = useLazyQuery(customerAddressList);

  const [
    getAlternateAddress,
    {
      loading: loadingAddresses1,
      error: errorAddresses1,
      data: dataAlternateAddresses,
    },
  ] = useLazyQuery(customerAlternateAddressList);

  const [setPlaceOrder, { loading, error, data: PurchaseOrderdata }] =
    placeOrder();

  const [
    InitcancelOrder,
    { loading: CancelLoad, error: cancelErr, data: Canceldata },
  ] = cancelOrder();

  const [setAdd, { loading: aLoading, error: aError, data: aData }] =
    setAlternateAddress();

  const [
    saveLocation,
    { loading: locationLoading, error: locationError, data: locationData },
  ] = sendLocationToServer();

  const [CachedCartInvData, setCachedCartInvData] = useState(null);
  const [
    GetcartInventory,
    { loading: CartLoading, error: CartError, data: CartInvData },
  ] = useLazyQuery(cartInventory);
  const [
    getDeliveryCharges,
    { loading: loadingB, error: errorB, data: deliveryData },
  ] = useLazyQuery(GetDeliveryCharge, { errorPolicy: 'all' });
  const [
    GetServiceCharges,
    { loading: loadingservice, error: errorservice, data: ServiceChargeData },
  ] = useLazyQuery(GetServiceCharge, { errorPolicy: 'all' });

  const CheckoutCacheReducer = useSelector(
    (state: any) => state.CheckoutCacheReducer,
  );

  function UpdateCacheExpTime(isUpdated) {
    var expTime = new Date(new Date().setHours(new Date().getHours() + 5));
    dispatch(ISCHECKOUTCacheUpdated(isUpdated, expTime));
  }

  //add Frodriguez

  const pad2 = (n: number) => String(n).padStart(2, '0');

  const toYYYYMMDD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const normalizeDateToMagento = (val: any) => {
    if (!val) return null;
    const s = String(val).trim();

    // Ya viene bien
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

    // Viene DD/MM/YYYY → pásalo a YYYY-MM-DD
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
      const [dd, mm, yyyy] = s.split('/');
      return `${yyyy}-${mm}-${dd}`;
    }

    return null;
  };

  const toHHmmss = (val: any) => {
    if (!val) return null;
    const s = String(val).trim();

    if (/^\d{2}:\d{2}:\d{2}$/.test(s)) return s; // HH:mm:ss

    if (/^\d{1,2}:\d{2}$/.test(s)) {
      // HH:mm
      const [h, m] = s.split(':').map(Number);
      return `${pad2(h)}:${pad2(m)}:00`;
    }

    return null;
  };

  useEffect(() => {
    if (!PurchaseOrderdata) return;

    // si Megasoft no ha aprobado, NO limpies ni navegues todavía
    if (!isMegasoftPaid) return;

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
      AnalyticslogPurchase(
        cartData,
        PurchaseOrderdata.placeOrder.order.order_number,
      );

      navigation.dispatch(
        StackActions.replace(Routes.NAVIGATION_TO_ORDERACCEPTED),
      );
    }

    setIsMegasoftPaid(false);
  }, [PurchaseOrderdata, isMegasoftPaid]);
  //end Frodriguez

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

  useEffect(() => {
    console.log('Alternet Address Val data value ---->> ', alternetAddressVal);
  }, [alternetAddressVal]);

  useEffect(() => {
    if (cartData?.customerCart?.items) {
      cartData.customerCart.items.forEach((item, index) => {
        const attrs = item.product.additional_attributes || [];

        // 1. Extraemos específicamente las dimensiones
        const dimAttr = attrs.find(a => a.code === 'dimensiones_deliver');
        const varDimensiones = dimAttr ? dimAttr.value : 'No tiene';

        // 2. Extraemos específicamente el peso
        const pesoAttr = attrs.find(a => a.code === 'weightdelivery');
        const varPeso = pesoAttr ? pesoAttr.value : 'No tiene';

        const partes = varDimensiones.replace(/cm/gi, '').split('x');

        // 2. Convertimos a números (usando trim para quitar espacios)
        const largo = parseFloat(partes[0]?.trim()) || 0;
        const ancho = parseFloat(partes[1]?.trim()) || 0;
        const alto = parseFloat(partes[2]?.trim()) || 0;

        const volumenProducto = largo * ancho * alto;
        // const capVehiculo = shippingData.maxDim.x * shippingData.maxDim.y * shippingData.maxDim.z;

        // const volumenCapacidadLitros = capVehiculo / 1000;
        // Ahora puedes usarlas como variables individuales
        // Helper.ShowAlert(
        //   `Volumen: ${volumenProducto}\n`+
        //   `provider ${JSON.stringify(shippingData)}\n`

        // );
      });
    }
  }, [cartData]);

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

  useEffect(() => {
    if (aData) {
      if (aData.setShippingAddressesOnCart) {
        setPickupShippingMethod({
          variables: {
            cart_id: cdID,
          },
        });
      }
    }
  }, [aData]);


  //add Frodriguez
  const handleWebViewNavigationStateChange = async (navState: any) => {
    console.log('[WebView] URL:', navState.url);

    // Detecta cuando Megasoft redirige de vuelta a tu endpoint
    const isReturnUrl = navState.url.includes(
      'creditivoo.com/purchases/paymentValidator',
    );

    if (isReturnUrl) {
      console.log(
        '[Megasoft] Llegó a URL de retorno, esperando postMessage del PHP...',
      );

    }
  };

  const handleMegasoftMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('[Megasoft Message]', data);

      if (data?.type !== 'MEGASOFT_RESULT') return;

      if (data.status === 'A') {
        megasoftControlRef.current = data.control;

        //        try {
        //          setIsLoading(true);
        //          const metodoPago = 'cashondelivery';
        //          setPaymentType(metodoPago);
        //          setcashea(false);
        //
        //          await createYummyTrip();
        //          await processPurchaseOrder(metodoPago);
        //          const magentoOrderNumber =
        //            PurchaseOrderdata?.placeOrder?.order?.order_number || null;
        //
        //          await sendOrderToExternalSystem({
        //            magentoOrderNumber,
        //            megasoftInvoiceId: megasoftFacturaRef.current,
        //            megasoftControl: megasoftControlRef.current,
        //          });
        //
        //          if (casheaPreorderId && casheaDownPayment) {
        //            await confirmCasheaPayment(
        //              casheaPreorderId,
        //              parseFloat(String(casheaDownPayment)),
        //            );
        //          }
        //
        //
        //          setIsMegasoftPaid(true);
        //          navigation.navigate(Routes.NAVIGATION_TO_ORDERACCEPTED);
        //        } catch (err) {
        //          console.error('[Megasoft] Error procesando orden:', err);
        //        } finally {
        //          setIsLoading(false);
        //          setShowPayModal(false);
        //        }
        try {
          setIsLoading(true);
          const metodoPago = 'cashondelivery';

          // 1. Llamamos a la función y capturamos el ID que retorna
          const magentoID = await processPurchaseOrder(metodoPago);
          console.log('[LOG] ID recibido de la función:', magentoID);

          // 2. Ahora sí pasamos ese ID real al sistema externo
          await sendOrderToExternalSystem({
            magentoOrderNumber: magentoID, // <--- YA NO SERÁ NULL
            megasoftInvoiceId: megasoftFacturaRef.current,
            megasoftControl: megasoftControlRef.current,
          });

          // 3. Crear viaje Yummy
          await createYummyTrip();

          // 4. Finalizar flujo
          setIsMegasoftPaid(true);
          setShowPayModal(false);
          navigation.navigate(Routes.NAVIGATION_TO_ORDERACCEPTED);

        } catch (err) {
          Alert.alert("Error", "No se pudo procesar la orden tras el pago.");
        }
      } else if (data.status === 'R') {
        setIsMegasoftPaid(false);
        setShowPayModal(false);
      }
    } catch (e) {
      console.log('[Megasoft] Mensaje no parseable:', event.nativeEvent.data);
    }
  };
  //end Frodriguez

  //add Frodriguez
  const PaymentMegasoft = async () => {
    // --- VALIDACIÓN ---
    if (!validateShippingRoute()) return;
    // ------------------------

    if (!ensureProfileCompleteOrGoProfile()) return;

    //para controlar en caso de que no funcione el 200 de preregistro y no envie el control a la
    // webview, para que no quede colgado el proceso
    //    await createYummyTrip();
    //    await sendOrderToExternalSystem();

    const BASE_URL =
      'https://e-payment.megasoft.com.ve/action/paymentgatewayuniversal-prereg';
    const user = 'ivoobp';
    const pass = 'm3rC@Nt$tx12';
    const tipo = 'V';
    const tipo_transaccion = '1';
    const cliente = global_data?.customerData?.email || '';
    const identificacion = String(
      global_data?.customerData?.citizen_id ?? '',
    ).replace(/\D/g, '');


    //para generar un id de factura para megasoft
    const generarIdFactura = (correlativo: number): string => {
      const ahora = new Date();

      // Formato: YYYYMMDDHHMM
      const fechaParte =
        ahora.getFullYear().toString() +
        (ahora.getMonth() + 1).toString().padStart(2, '0') +
        ahora.getDate().toString().padStart(2, '0') +
        ahora.getHours().toString().padStart(2, '0') +
        ahora.getMinutes().toString().padStart(2, '0');

      // Formato del correlativo final (ejemplo: 4 dígitos)
      const sufijo = correlativo.toString().padStart(4, '0');

      return `${fechaParte}${sufijo}`;
    };


    const amountUsd = moneyToNumberSafe(
      cashea ? casheaDownPayment : GrandTotal,
    );



    if (!amountUsd || amountUsd <= 0) {
      Alert.alert('Error', 'Monto no válido');
      return;
    }

    try {
      const stringAuth = btoa(`${user}:${pass}`);

      const IdOrder = generarIdFactura(1);
      const factura = String(IdOrder);
      megasoftFacturaRef.current = factura;

      // 2) Obtener tasa y calcular Bs (solo una vez por este intento)
      let rateInfo = megasoftRateRef.current;

      // Si no hay tasa guardada o cambió el monto USD, recalcula
      if (!rateInfo || rateInfo.amountUsd !== amountUsd) {
        const latest = await getLatestBcvRate();
        const rate = Number(latest.amount);

        if (!Number.isFinite(rate) || rate <= 0) {
          throw new Error('Tasa BCV inválida');
        }

        const amountBs = usdToVes(amountUsd, rate);
        if (!amountBs || amountBs <= 0) {
          throw new Error('No se pudo calcular el monto en Bs');
        }

        rateInfo = {
          rate,
          fetchedAtVe: latest.fetchedAtVe,
          amountUsd,
          amountBs,
        };

        megasoftRateRef.current = rateInfo;
      }

      const xmlBody = `
      <request>
        <cod_afiliacion>400163994</cod_afiliacion>
        <factura>${factura}</factura>
        <monto>${rateInfo.amountBs.toFixed(2)}</monto>

      </request>`.trim();

      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml',
          Authorization: `Basic ${stringAuth}`,
        },
        body: xmlBody,
      });

      const responseData = await response.text();

      if (response.ok && /^\d+$/.test(responseData.trim())) {
        const control = responseData.trim();
        const url = `https://e-payment.megasoft.com.ve/action/paymentgatewayuniversal-data?control=${control}`;
        openPayment(url);

        

        // const metodoPago = 'cashondelivery';
        // setPaymentType(metodoPago);

        // await processPurchaseOrder(metodoPago);

      } else {
        // Si falla preregistro, resetea para que reintente con tasa fresca
        megasoftRateRef.current = null;
        Alert.alert('Error de Registro', responseData);
      }
    } catch (error: any) {
      // Si falla por tasa / red, también resetea el ref
      megasoftRateRef.current = null;
      Alert.alert('Error', error?.message || 'Error procesando Megasoft');
    } finally {
      setIsLoading(false);
    }
  };

  // end Jmarin



  const PagarConCashea = async () => {
    // --- VALIDACIÓN ---
    if (!validateShippingRoute()) return;
    // ------------------------

    if (!ensureProfileCompleteOrGoProfile()) return;

    setPaymentType('cashea');

    setcashea(false);
    setCasheaDownPayment(null);
    setCasheaFinanceAmount(null);
    setCasheaOrder(null);
    setCasheaPreorderId('');

    openCasheaModal();
  };

  //end Frodriguez

  //add Jmarin
  const handleWebViewClose = async () => {
    setShowPayModal(false);
    setIsProcessingPayment(false);

    // Si NO se marcó como pagado en NavigationStateChange, tratamos como cancelación
    if (!isMegasoftPaid) {
      if (PurchaseOrderdata?.placeOrder?.order?.order_number) {
        InitcancelOrder({
          variables: {
            incrementId: PurchaseOrderdata.placeOrder.order.order_number,
          },
        }).catch(err => console.log('Error al cancelar orden:', err));
      }

      setTimeout(() => {
        setPaymentUrl(null);
        console.log('Navegando a Cancelación...');
        navigation.navigate(Routes.NAVIGATION_TO_ORDERCANCEL);
      }, 300);
    } else {
      // Si ya estaba pagado, solo limpiamos la URL por seguridad
      setPaymentUrl(null);
    }
  };
  //end Jmarin

  // add Frodriguez

  const normErr = (e: any) => ({
    message: e?.message,
    graphQLErrors: e?.graphQLErrors?.map((x: any) => ({
      message: x?.message,
      path: x?.path,
      extensions: x?.extensions,
    })),
    networkError: e?.networkError?.message,
  });

  const pickDeliveryBestway = (methods: any[]) => {
    // Prioridad 1: method_code contiene bestway (tu caso típico)
    let m =
      methods?.find((x: any) =>
        String(x?.method_code || '')
          .toLowerCase()
          .includes('bestway'),
      ) ||
      // Prioridad 2: carrier_code contiene ivoo (por tu log: carrier_code "ivoo")
      methods?.find((x: any) =>
        String(x?.carrier_code || '')
          .toLowerCase()
          .includes('ivoo'),
      ) ||
      // fallback: primero de la lista (si existe)
      methods?.[0];

    return m || null;
  };

  const pickPickupMethod = (methods: any[]) => {
    // pickup suele venir como "pickup" o carrier instore, depende de tu implementación
    let m =
      methods?.find((x: any) =>
        String(x?.method_code || '')
          .toLowerCase()
          .includes('pickup'),
      ) ||
      methods?.find((x: any) =>
        String(x?.carrier_code || '')
          .toLowerCase()
          .includes('instore'),
      ) ||
      methods?.[0];

    return m || null;
  };

  const resolveDeliveryAddressData = () => {
    const street = normalizeStreet(
      deliveryAdd?.street ||
      shippingData?.destination_address?.address_line1 ||
      shippingData?.address,
    );

    const city =
      deliveryAdd?.city ||
      shippingData?.destination?.city ||
      shippingData?.destination_address?.city ||
      'Caracas';

    const postcode =
      deliveryAdd?.postcode ||
      shippingData?.destination?.postal_code ||
      shippingData?.destination_address?.postal_code ||
      '1010';

    const country =
      deliveryAdd?.country_code ||
      shippingData?.destination?.country ||
      shippingData?.destination_address?.country ||
      'VE';

    const region =
      shippingData?.destination?.state ||
      shippingData?.destination_address?.state ||
      null;

    const latitude =
      shippingData?.destination?.latitude ??
      shippingData?.destination_address?.lat ??
      null;

    const longitude =
      shippingData?.destination?.longitude ??
      shippingData?.destination_address?.lng ??
      null;

    const nearestCity = city;

    return {
      street,
      city,
      postcode,
      country,
      region,
      latitude,
      longitude,
      nearestCity,
    };
  };

  const TECH_ADDRESS_TYPE = 'custom_delivery';

  const findTechnicalAddress = (addresses: any[] = []) => {
    return addresses.find((a: any) => a?.address_type === TECH_ADDRESS_TYPE);
  };

  const ensureTechnicalDeliveryAddress = async () => {
    const resolved = resolveDeliveryAddressData();

    console.log('TECH_ADDRESS_RESOLVED', resolved);

    const addrResp = await client.query({
      query: customerAddressList,
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    });

    console.log('TECH_ADDRESS_LIST', JSON.stringify(addrResp?.data, null, 2));

    const addresses = addrResp?.data?.customer?.addresses || [];
    const techAddress = findTechnicalAddress(addresses);

    const vars = {
      address_type: TECH_ADDRESS_TYPE,
      apartment_number: '',
      street: resolved.street,
      postcode: resolved.postcode,
      city: resolved.city,
      firstname: global_data.Fname,
      lastname: global_data.Lname,
      default_shipping: false,
      default_billing: false,
      nearest_city: resolved.nearestCity,
      latitude: resolved.latitude != null ? String(resolved.latitude) : '',
      longitude: resolved.longitude != null ? String(resolved.longitude) : '',
    };

    if (techAddress?.id) {
      console.log('TECH_ADDRESS_UPDATE_START', { id: techAddress.id, vars });

      const upd = await updateAddress({
        variables: {
          aid: Number(techAddress.id),
          ...vars,
        },
      });

      console.log('TECH_ADDRESS_UPDATE_OK', JSON.stringify(upd?.data, null, 2));

      return upd?.data?.updateCustomerAddress?.id || techAddress.id;
    }

    console.log('TECH_ADDRESS_CREATE_START', vars);

    const created = await addAddress({
      variables: vars,
    });

    console.log(
      'TECH_ADDRESS_CREATE_OK',
      JSON.stringify(created?.data, null, 2),
    );

    return created?.data?.createCustomerAddress?.id;
  };

  const applyShippingAndValidate = async (cartId: string, traceId: string) => {
    const wantsDelivery = shippingData?.method === 'delivery';
    const wantsPickup = shippingData?.method === 'pickup';

    console.log(traceId, 'STEP_1_CHOICE', {
      wantsDelivery,
      wantsPickup,
      shippingData,
    });


    if (!wantsDelivery && !wantsPickup) {
      throw new Error('Selecciona Delivery o Pickup antes de pagar.');
    }


    // 1) SHIPPING ADDRESS
    try {
      if (wantsDelivery) {
        const resolved = resolveDeliveryAddressData();


        console.log(traceId, 'STEP_1_1_RESOLVED_DELIVERY_ADDRESS', resolved);

        const techAddressId = await ensureTechnicalDeliveryAddress();

        console.log(traceId, 'STEP_1_2_TECH_ADDRESS_ID', { techAddressId });


        if (!techAddressId) {
          throw new Error(
            'No se pudo preparar la dirección técnica de delivery.',
          );
        }

        const vars = {
          cID: cartId,
          customer_address_id: Number(techAddressId),
        };

        console.log(traceId, 'STEP_2_SET_DELIVERY_ADDRESS_BY_ID_START', vars);

        const r = await setShippingAddressById({
          variables: vars,
        });

        console.log(traceId, 'STEP_2_SET_DELIVERY_ADDRESS_BY_ID_OK', r?.data);
      } else {
        const vars = {
          cID: cartId,
          pickup_location_code: pickupPoint?.pickup_location_code,
          fName: global_data.Fname,
          lName: global_data.Lname,
          telephone: global_data.phone,
          street: normalizeStreet(pickupPoint?.street),
          city: pickupPoint?.city || 'Ciudad',
          postcode: pickupPoint?.postcode || '1010',
          country: 'VE',
          region_id: pickupPoint?.region_id
            ? parseInt(pickupPoint.region_id)
            : 0,
        };

        console.log(traceId, 'STEP_2_SET_PICKUP_ADDRESS_START', vars);

        const r = await setPickupAddress({ variables: vars });

        console.log(traceId, 'STEP_2_SET_PICKUP_ADDRESS_OK', r?.data);
      }
    } catch (e: any) {
      console.log(traceId, 'STEP_2_SET_SHIPPING_ADDRESS_FAIL', normErr(e));
      throw e;
    }

    // 2) BILLING
    try {
      const resolved = wantsDelivery ? resolveDeliveryAddressData() : null;

      const vars = {
        cart_id: cartId,
        firstname: global_data.Fname,
        lastname: global_data.Lname,
        street: wantsDelivery
          ? resolved?.street || ['Calle', '']
          : normalizeStreet(pickupPoint?.street),
        city: wantsDelivery
          ? resolved?.city || 'Caracas'
          : pickupPoint?.city || 'Caracas',
        postcode: wantsDelivery
          ? resolved?.postcode || '1010'
          : pickupPoint?.postcode || '1010',
        country_code: wantsDelivery ? resolved?.country || 'VE' : 'VE',
        telephone: global_data.phone,
      };

      console.log(traceId, 'STEP_3_SET_BILLING_START', vars);

      const r = await setBillingAddress({ variables: vars });

      console.log(traceId, 'STEP_3_SET_BILLING_OK', r?.data);
    } catch (e: any) {
      console.log(traceId, 'STEP_3_SET_BILLING_FAIL', normErr(e));
      throw e;
    }

    // 3) TRAER MÉTODOS DISPONIBLES
    let availableMethods: any[] = [];
    try {
      console.log(traceId, 'STEP_4_AVAIL_METHODS_START');

      const avail = await client.query({
        query: getAvailablePaymentandShipping,
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
      });

      availableMethods =
        avail?.data?.customerCart?.shipping_addresses?.[0]
          ?.available_shipping_methods || [];


      console.log(
        traceId,
        'STEP_4_AVAIL_METHODS_OK',
        availableMethods.map((m: any) => ({
          carrier_code: m?.carrier_code,
          method_code: m?.method_code,
          amount: m?.amount?.value,
        })),
      );
    } catch (e: any) {
      console.log(traceId, 'STEP_4_AVAIL_METHODS_FAIL', normErr(e));
      throw e;
    }

    // 4) SET SHIPPING METHOD
    try {
      const chosen = wantsDelivery
        ? pickDeliveryBestway(availableMethods)
        : pickPickupMethod(availableMethods);

      if (!chosen?.carrier_code || !chosen?.method_code) {
        throw new Error(
          wantsDelivery
            ? 'Delivery no disponible (no existe método bestway válido para esta dirección).'
            : 'Pickup no disponible (no existe método válido para esta tienda).',
        );
      }

      const vars = {
        cart_id: cartId,
        carrier_code: chosen.carrier_code,
        method_code: chosen.method_code,
      };

      console.log(traceId, 'STEP_5_SET_SHIPPING_METHOD_START', vars);

      const r = await setShippingMethod({ variables: vars });

      console.log(traceId, 'STEP_5_SET_SHIPPING_METHOD_OK', r?.data);
    } catch (e: any) {
      console.log(traceId, 'STEP_5_SET_SHIPPING_METHOD_FAIL', normErr(e));
      throw e;
    }

    // 5) FETCH SLOTS
    try {
      console.log(traceId, 'STEP_6_FETCH_SLOTS_START');

      const slotsResp = await client.query({
        query: getDeliveryTime,
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
      });

      console.log(
        traceId,
        'STEP_6_FETCH_SLOTS_RAW',
        JSON.stringify(slotsResp, null, 2),
      );

      const list = slotsResp?.data?.deliveryTime || [];

      console.log(
        traceId,
        'STEP_6_FETCH_SLOTS_OK',
        JSON.stringify(list, null, 2),
      );

      const day = list.find((d: any) => d?.date && d?.slots?.length);
      const slot = day?.slots?.find((s: any) => s?.from && s?.to);

      if (!day || !slot) {
        const gqlErrorMsg =
          slotsResp?.errors?.[0]?.message ||
          'No hay fechas/horarios válidos de delivery en este momento.';

        throw new Error(gqlErrorMsg);
      }

      const vars = {
        date: normalizeDateToMagento(day.date),
        deliveryFrom: toHHmmss(slot.from),
        deliveryTo: toHHmmss(slot.to),
      };

      console.log(traceId, 'STEP_7_SET_DATETIME_START', vars, {
        wantsDelivery,
        wantsPickup,
      });

      const r = await setDateTime({ variables: vars });

      console.log(traceId, 'STEP_7_SET_DATETIME_OK', r?.data);
    } catch (e: any) {
      console.log(traceId, 'STEP_7_SET_DATETIME_FAIL', normErr(e));
      throw e;
    }
  };

  //  const processPurchaseOrder = async (
  //    selectedMethod: string,
  //    traceId: string = `CHECKOUT_${Date.now()}`, // Valor por defecto (esto solo es opcional, puedes pasar un traceId personalizado para un mejor seguimiento en logs),
  //  ) => {
  //    try {
  //      setIsLoading(true);
  //
  //      console.log(traceId, 'STEP_A_PROCESS_START', {selectedMethod});
  //
  //      const cartId = cartData?.customerCart?.id;
  //      if (!cartId) throw new Error('cartId inválido.');
  //
  //      console.log(traceId, 'STEP_B_APPLY_SHIPPING_START', {cartId});
  //      await applyShippingAndValidate(cartId, traceId);
  //      console.log(traceId, 'STEP_B_APPLY_SHIPPING_OK');
  //
  //      try {
  //        const vars = {cart_id: cartId, payment_methodCode: selectedMethod};
  //        console.log(traceId, 'STEP_C_SET_PAYMENT_METHOD_START', vars);
  //        const r = await setPaymentMethod({variables: vars});
  //        console.log(traceId, 'STEP_C_SET_PAYMENT_METHOD_OK', r?.data);
  //      } catch (e: any) {
  //        console.log(traceId, 'STEP_C_SET_PAYMENT_METHOD_FAIL', normErr(e));
  //        throw e;
  //      }
  //
  //      try {
  //        console.log(traceId, 'STEP_D_PLACE_ORDER_START', {cart_id: cartId});
  //        const resp = await setPlaceOrder({variables: {cart_id: cartId}});
  //        const orderNumber = resp?.data?.placeOrder?.order?.order_number;
  //
  //        console.log(traceId, 'STEP_D_PLACE_ORDER_OK', {orderNumber});
  //
  //        if (!orderNumber) throw new Error('No se pudo generar la orden.');
  //
  //        console.log(traceId, 'STEP_E_MEGASOFT_START', {orderNumber});
  //        //await PaymentMegasoft(orderNumber, casheaDownPayment);
  //        console.log(traceId, 'STEP_E_MEGASOFT_OK');
  //      } catch (e: any) {
  //        console.log(traceId, 'STEP_D_E_PLACEORDER_MEGASOFT_FAIL', normErr(e));
  //        throw e;
  //      }
  //    } catch (e: any) {
  //      console.log(traceId, 'FATAL_CHECKOUT_FAIL', normErr(e));
  //      Helper.ShowAlert(e?.message || 'Error procesando la orden');
  //    } finally {
  //      setIsLoading(false);
  //      console.log(traceId, 'END_PROCESS');
  //    }
  //  };

  const processPurchaseOrder = async (
    selectedMethod: string,
    traceId: string = `CHECKOUT_${Date.now()}`,
  ) => {
    try {
      setIsLoading(true);
      console.log(traceId, '--- [INICIO MAGENTO] ---', { selectedMethod });

      const cartId = cartData?.customerCart?.id;
      if (!cartId) throw new Error('cartId inválido.');

      // 1. Validar y aplicar datos de envío en Magento
      console.log(traceId, 'STEP_1: Aplicando Shipping...');
      await applyShippingAndValidate(cartId, traceId);

      // 2. Establecer el método de pago en el carrito de Magento
      try {
        const vars = { cart_id: cartId, payment_methodCode: selectedMethod };
        console.log(traceId, 'STEP_2: Set Payment Method...', vars);
        await setPaymentMethod({ variables: vars });
      } catch (e: any) {
        console.log(traceId, 'STEP_2_ERROR:', normErr(e));
        throw new Error('Error al establecer método de pago en Magento.');
      }

      // 3. Crear la orden final (Place Order)
      try {
        console.log(traceId, 'STEP_3: Place Order Start...');
        const resp = await setPlaceOrder({ variables: { cart_id: cartId } });

        // Capturamos el número de orden directamente de la respuesta de la red
        const orderNumber = resp?.data?.placeOrder?.order?.order_number;
        console.log(traceId, 'STEP_3: Place Order OK. Order #:', orderNumber);

        if (!orderNumber) {
          throw new Error('Magento no devolvió un número de orden válido.');
        }

        // RETORNAMOS el número de orden para que handleMegasoftMessage
        // pueda usarlo inmediatamente en los siguientes pasos
        return orderNumber;

      } catch (e: any) {
        console.log(traceId, 'STEP_3_ERROR:', normErr(e));
        throw e;
      }
    } catch (e: any) {
      console.log(traceId, 'FATAL_PROCESS_ERROR:', normErr(e));
      throw e; // Re-lanzamos para que handleMegasoftMessage lo capture
    } finally {
      setIsLoading(false);
      console.log(traceId, '--- [FIN MAGENTO] ---');
    }
  };
  //end Frodriguez

  useEffect(() => {
    if (shippingData && cartData) {
      // 1. Actualizar texto del costo de envío

      setDeliveryCharge(Helper.currencyFormat(shippingData.cost));

      // 2. Recalcular Gran Total

      const subTotal =
        cartData.customerCart.prices.subtotal_excluding_tax.value || 0;

      const serviceFee = cartData.customerCart.prices.payment_fee.value || 0;

      const discount =
        cartData.customerCart.prices.discounts?.[0]?.amount?.value || 0;

      const newTotal = subTotal + serviceFee + shippingData.cost - discount;

      if (newTotal > 0) {
        const formatted = Helper.currencyFormat(newTotal);
        setGrandTotal(formatted);
        lastGrandTotal.current = formatted; // Actualizamos el respaldo
      }
    }
  }, [shippingData, cartData]);

  // add Frodriguez (Cashea)

  const handleCasheaClose = useCallback(() => {
    setIsProcessingCashea(false);
    setCasheaUrl(null);
    setCasheaPayload(null);
    casheaPayloadSentRef.current = false;

    casheaReturnHandledRef.current = false;
  }, []);

  const onCasheaShouldStartLoadWithRequest = useCallback((req: any) => {
    const u = String(req?.url || '');
    if (u.startsWith('https://cashea.creditivoo.com')) return true;
    if (u.includes('cashea')) return true;
    if (u.startsWith('https://')) return true;
    return false;
  }, []);

  const CASHEA_RETURN_PREFIX = 'https://cashea.creditivoo.com/return';

  const getQueryParam = (url: string, key: string) => {
    const match = url.match(new RegExp(`[?&]${key}=([^&#]*)`));
    return match ? decodeURIComponent(match[1]) : null;
  };

  const confirmCasheaPayment = async (preorderId: string, amount: number) => {
    try {
      console.log('[CASHEA_CONFIRM_ID]', preorderId);
      console.log('[CASHEA_CONFIRM_AMOUNT]', amount);

      const resp = await fetch(
        'https://cashea.creditivoo.com/api/cashea/confirm.php',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: preorderId,
            amount,
          }),
        },
      );

      const data = await resp.json();

      console.log('[CASHEA_CONFIRM_STATUS]', resp.status);
      console.log('[CASHEA_CONFIRM_RESPONSE]', data);

      if (!resp.ok || !data?.ok) {
        throw new Error(
          data?.error ||
          data?.data?.message ||
          'No se pudo confirmar el pago en Cashea',
        );
      }

      return data;
    } catch (error) {
      console.log('[CASHEA_CONFIRM_ERROR]', error);
      throw error;
    }
  };

  const createYummyTrip = async () => {
    console.log('--- [INICIO] LLAMADA A YUMMY CORPORATE ---');
    try {
      const { quotationId, serviceTypeId, address, store, storeFullName } = shippingData || {};

      // 1. Verificación de IDs antes de disparar
      if (!quotationId || !serviceTypeId || serviceTypeId === 'undefined') {
        console.error('[YUMMY_LOG] ❌ Abortado: Faltan IDs.', { quotationId, serviceTypeId });
        return { ok: false, error: 'Faltan IDs' };
      }

      const rawPhone = String(global_data?.customerData?.phone || global_data?.phone || '');
      let cleanPhone = rawPhone.replace(/\D/g, '');
      if (cleanPhone.startsWith('58')) cleanPhone = cleanPhone.substring(2);

      const payload = {
        payerId: "6978e869044548e89ffa6f33",
        quotationId: String(quotationId),
        serviceTypeId: String(serviceTypeId),
        paymentMode: 7,
        totalOrderPrice: moneyToNumberSafe(GrandTotal),
        sourceAddress: String(store?.name || storeFullName || 'Tienda IVOO'),
        destinationAddress: String(address || 'Dirección de Entrega'),
        receiver_first_name: String(global_data?.customerData?.firstName || global_data?.Fname || 'Cliente'),
        receiver_last_name: String(global_data?.customerData?.lastName || global_data?.Lname || 'IVOO'),
        user_phone_number: cleanPhone,
        user_country_phone_code: "+58",
        receiver_phone_number: cleanPhone,
        receiver_country_phone_code: "+58",
        storeDetail: {
          storeAliasName: "IVOO",
          storeFullName: String(storeFullName || "Tienda IVOO")
        }
      };

      console.log('[YUMMY_LOG] 📨 Enviando Payload:', JSON.stringify(payload, null, 2));

      const response = await fetch('https://api.yummyrides.com/api/v1/trip/api-corporate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Api-Key': '603179be-e09f-4cee-8026-0a241ab9c3d1',
          'language': 'es',
        },
        body: JSON.stringify(payload),
      });

      // 2. Captura del STATUS CODE
      const statusCode = response.status;
      const data = await response.json();

      console.log(`[YUMMY_LOG] 📥 RESPUESTA DEL SERVIDOR (Status: ${statusCode})`);
      console.log('[YUMMY_LOG] 📄 Body:', JSON.stringify(data, null, 2));

      if (statusCode === 201 || statusCode === 200) {
        console.log('[YUMMY_LOG] ✅ VIAJE CREADO CON ÉXITO');
        return { ok: true, data };
      } else {
        console.error(`[YUMMY_LOG] ❌ ERROR ${statusCode}:`, data?.message || 'Error desconocido');
        return { ok: false, status: statusCode, data };
      }

    } catch (error) {
      console.error('[YUMMY_LOG] 🚨 ERROR CRÍTICO (Network/Crash):', error);
      return { ok: false, error };
    } finally {
      console.log('--- [FIN] LLAMADA A YUMMY CORPORATE ---');
    }
  };

  const onCasheaNavigationStateChange = useCallback(
    (navState: any) => {
      const u = String(navState?.url || '');
      console.log('[CASHEA_WEBVIEW] URL:', u);
      if (u.startsWith(CASHEA_RETURN_PREFIX)) {
        if (casheaReturnHandledRef.current) return;
        casheaReturnHandledRef.current = true;
        const preorderId = getQueryParam(u, 'idNumber');
        if (preorderId) {
          // 1) Guardas el id de Cashea
          setCasheaPreorderId(String(preorderId));
          // 2) Cargas downpayment (esto setea casheaDownPayment + casheaOrder)
          fetchCasheaDownPayment(String(preorderId));
        }
        // 3) Cierra el WebView de Cashea y ya. NO hagas nada más.
        handleCasheaClose();
      }
    },
    [handleCasheaClose],
  );

  const sendCasheaPayloadToWeb = useCallback(() => {
    if (!casheaPayload) return;
    if (casheaPayloadSentRef.current) return;

    const message = JSON.stringify({
      type: 'CHECKOUT_PAYLOAD',
      payload: casheaPayload,
    });

    casheaWebRef.current?.postMessage(message);

    setTimeout(() => {
      casheaWebRef.current?.postMessage(message);
    }, 350);

    casheaPayloadSentRef.current = true;
  }, [casheaPayload]);

  const onCasheaMessage = useCallback(
    (event: any) => {
      try {
        const data = JSON.parse(event?.nativeEvent?.data || '{}');
        console.log('[CASHEA_WEBVIEW_MESSAGE]:', data);

        if (data?.type === 'WV_READY' || data?.type === 'WEBVIEW_READY') {
          sendCasheaPayloadToWeb();
        }

        if (data?.type === 'CASHEA_ERROR') {
          console.log('[CASHEA_ERROR]', data);
        }
      } catch (e) {
        console.log('[CASHEA_WEBVIEW_RAW]', event?.nativeEvent?.data);
      }
    },
    [sendCasheaPayloadToWeb],
  );

  type CasheaPayload = {
    identificationNumber: string;
    deliveryMethod: 'IN_STORE' | 'DELIVERY';
    invoiceId: string;
    deliveryPrice: number;
    orders: Array<{
      products: Array<{
        id: string;
        name: string;
        sku: string;
        description: string;
        imageUrl: string;
        quantity: number;
        price: number;
        tax: number;
        discount: number;
      }>;
    }>;
  };

  const moneyToNumber = (val: any): number => {
    if (typeof val === 'number') return val;
    if (!val) return 0;

    // Ej: "$4.50" / "4,50" / "Bs. 4.50" / "USD 4.50"
    let s = String(val).trim();

    // deja solo dígitos, coma, punto y signo
    s = s.replace(/[^\d,.-]/g, '');

    // si tiene coma y punto, asumimos coma = miles y punto = decimal (o viceversa)
    // regla simple: el último separador es el decimal
    const lastComma = s.lastIndexOf(',');
    const lastDot = s.lastIndexOf('.');

    if (lastComma > lastDot) {
      // coma es decimal → quitamos puntos miles y cambiamos coma por punto
      s = s.replace(/\./g, '').replace(',', '.');
    } else if (lastDot > lastComma) {
      // punto es decimal → quitamos comas miles
      s = s.replace(/,/g, '');
    } else {
      // no hay separadores claros
    }

    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
  };

  const buildCasheaPayload = (): CasheaPayload => {
    const cart = cartData?.customerCart;

    // 1) Identificación del cliente
    const identificationNumber = String(
      casheaCedula || global_data?.customerData?.citizen_id || '',
    ).replace(/\D/g, '');

    // 2) Delivery
    const deliveryPrice = moneyToNumber(DeliveryCharge);
    const deliveryMethod: 'IN_STORE' | 'DELIVERY' =
      deliveryPrice > 0 ? 'DELIVERY' : 'IN_STORE';

    // 3) Productos
    const products =
      (cart?.items ?? []).map((it: any) => {
        const qty = Number(it?.quantity ?? 1);
        const rowTotal = Number(it?.prices?.row_total?.value ?? 0);
        const unitPrice = qty > 0 ? rowTotal / qty : rowTotal;

        return {
          id: String(it?.id ?? it?.product?.sku ?? 'N/A'),
          name: String(it?.product?.name ?? 'N/A'),
          sku: String(it?.product?.sku ?? 'N/A'),
          description: 'N/A',
          imageUrl: String(it?.product?.small_image?.url ?? 'N/A'),
          quantity: qty,
          price: Number(unitPrice || 0),
          tax: 0,
          discount: 0,
        };
      }) ?? [];

    const cartId = String(cart?.id ?? 'NA');
    const invoiceId = `${cartId}`;

    return {
      identificationNumber,
      deliveryMethod,
      invoiceId,
      deliveryPrice,
      orders: [{ products }],
    };
  };

  // 1) Se llama cuando el user toca "Cashea"
  const openCasheaModal = () => {
    const payload = buildCasheaPayload();

    if (!payload.orders?.[0]?.products?.length) {
      Alert.alert('Atención', 'Tu carrito está vacío.');
      return;
    }

    casheaPayloadSentRef.current = false;
    setCasheaPayload(payload);

    // precarga desde user si existe
    const fromUser = String(
      global_data?.customerData?.citizen_id ?? '',
    ).replace(/\D/g, '');

    // usa casheaCedula o la del usuario o vacío
    const prefill = (casheaCedula || fromUser || '').trim();

    casheaIdDraftRef.current = prefill;
    setCasheaIdDraftUI(prefill);
    setIsCasheaIdValid(
      prefill.length >= MIN_CEDULA_DIGITS &&
      prefill.length <= MAX_CEDULA_DIGITS,
    );
    setShowCasheaIdModal(true);
  };

  // 2) Aceptar en modal nativo
  const confirmCasheaIdAndOpenWebview = () => {
    const clean = casheaIdDraftRef.current;

    if (clean.length < MIN_CEDULA_DIGITS || clean.length > MAX_CEDULA_DIGITS) {
      Alert.alert('Atención', 'Ingresa una cédula válida.');
      return;
    }

    setCasheaCedula(clean);
    setShowCasheaIdModal(false);

    const base = 'https://cashea.creditivoo.com/checkout.html';
    const cartId = String(cartData?.customerCart?.id || '');
    const qs = `cedula=${encodeURIComponent(clean)}&cartId=${encodeURIComponent(
      cartId,
    )}`;

    setCasheaUrl(`${base}?${qs}`);
    setIsProcessingCashea(true);
  };

  const cancelCasheaIdModal = () => {
    setShowCasheaIdModal(false);
  };

  // convierte dinero texto "$1,234.56" a number
  const moneyToNumberSafe = (val: any): number => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    let s = String(val)
      .trim()
      .replace(/[^\d,.-]/g, '');
    const lastComma = s.lastIndexOf(',');
    const lastDot = s.lastIndexOf('.');
    if (lastComma > lastDot) s = s.replace(/\./g, '').replace(',', '.');
    else if (lastDot > lastComma) s = s.replace(/,/g, '');
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
  };

  const normalizeShippingService = (provider?: string) => {
    const p = String(provider || '').toLowerCase();
    if (p.includes('express')) return 'express';
    return 'normal';
  };

  const buildSyncOrderPayload = (opts?: {
    orderNumber?: string;
    magentoOrderNumber?: string;
    megasoftInvoiceId?: string;
    megasoftControl?: string;
  }) => {
    const cart = cartData?.customerCart;
    const order_number = opts?.orderNumber || `${Date.now()}`;
    const cart_id = String(cart?.id || '');

    //megasoft
    const magento_order_number = opts?.magentoOrderNumber || null;
    const megasoft_invoice_id = opts?.megasoftInvoiceId || null;
    const megasoft_control = opts?.megasoftControl || null;

    // totals
    const grand_total_num = moneyToNumberSafe(GrandTotal);
    const service_fee_num = moneyToNumberSafe(ServiceFees);
    const delivery_num = moneyToNumberSafe(DeliveryCharge);

    // shipping
    const shipping_method = (shippingData?.method || 'pickup') as
      | 'pickup'
      | 'delivery';
    const shipping_service =
      shipping_method === 'delivery'
        ? shippingData.deliveryType === 'express'
          ? 'express'
          : 'normal'
        : null;

    const is_musculito =
      shipping_method === 'delivery' ? !!shippingData?.isMusculito : false;

    const shipping_provider_id =
      shipping_method === 'delivery' ? shippingData?.providerId ?? null : null;

    // customer
    const email =
      global_data?.customerData?.email ||
      cart?.email ||
      global_data?.email ||
      '';

    const full_name = //shippingData;
      `${global_data?.customerData?.firstName || ''} ${global_data?.customerData?.lastName || ''
        }`.trim() || 'N/A';

    const document_number =
      String(global_data?.customerData?.citizen_id || '').replace(/\D/g, '') ||
      null;
    const phone =
      String(
        global_data?.customerData?.phone ||
        global_data?.customerData?.telephone ||
        '',
      ).replace(/\D/g, '') || null;

    // origin (store)
    const store = shippingData?.store;
    const storeFD = store?.fullData || {};
    const origin_address = {
      type: 'STORE',
      code: String(
        storeFD?.pickup_location_code ||
        store?.pickup_location_code ||
        store?.code ||
        '',
      ),
      name: String(storeFD?.city ? `IVOO ${storeFD.city}` : store?.name || ''),
      address_line1: String(storeFD?.street || storeFD?.description || ''),
      city: String(storeFD?.city || ''),
      state: String(storeFD?.region || storeFD?.region_id || ''),
      country: String(storeFD?.country_id || ''),
      postal_code: String(storeFD?.postcode || ''),
      lat: Number(storeFD?.latitude ?? store?.latitude ?? null),
      lng: Number(storeFD?.longitude ?? store?.longitude ?? null),
    };

    // destination (delivery)
    const dest = shippingData?.destination || {};

    const destination_address = {
      type: shipping_method === 'pickup' ? 'PICKUP' : 'DELIVERY',
      code: null,
      name: String(shippingData?.address || ''),
      address_line1: String(shippingData?.address || ''),
      city: dest?.city ? String(dest.city) : null,
      state: dest?.state ? String(dest.state) : null,
      country: dest?.country ? String(dest.country) : null,
      postal_code: dest?.postal_code ? String(dest.postal_code) : null,
      lat: dest?.latitude != null ? Number(dest.latitude) : null,
      lng: dest?.longitude != null ? Number(dest.longitude) : null,
    };

    // items (unit_price = row_total/qty)
    const items =
      (cart?.items ?? []).map((it: any) => {
        const qty = Number(it?.quantity ?? 1);
        const rowTotal = Number(it?.prices?.row_total?.value ?? 0);
        const unitPrice = qty > 0 ? rowTotal / qty : rowTotal;

        return {
          sku: String(it?.product?.sku ?? it?.sku ?? 'N/A'),
          name: String(it?.product?.name ?? it?.name ?? 'N/A'),
          qty_ordered: qty,
          unit_price: Number(unitPrice || 0),
          currency: String(cart?.prices?.grand_total?.currency ?? 'USD'),
        };
      }) ?? [];

    //  CASHEA
    const co: any = casheaOrder;
    const firstOrder = co?.data?.orderDetails?.orders?.[0];
    const is_cashea = !!co?.ok;
    const cashea_invoice_id = is_cashea
      ? String(firstOrder?.invoiceId ?? '') || cart_id || null
      : null;
    const cashea_preorder_id =
      is_cashea && co?.data?.idNumber != null ? String(co.data.idNumber) : null;
    const cashea_order_id =
      is_cashea && firstOrder?.idNumber != null
        ? String(firstOrder.idNumber)
        : null;
    const cashea_down_payment =
      is_cashea && co?.downPayment != null
        ? moneyToNumberSafe(co.downPayment)
        : null;
    const cashea_financed_amount = is_cashea
      ? co?.data?.orderDetails?.financedAmount != null
        ? moneyToNumberSafe(co.data.orderDetails.financedAmount)
        : firstOrder?.financedAmount != null
          ? moneyToNumberSafe(firstOrder.financedAmount)
          : null
      : null;

    return {
      order_number,
      magento_order_number,
      megasoft_invoice_id,
      megasoft_control,
      cart_id,
      is_cashea,
      cashea_invoice_id,
      cashea_preorder_id,
      cashea_order_id,
      cashea_down_payment,
      cashea_financed_amount,
      source: 'ivoo_app',
      status: 'processing',
      status_code: 'processing',
      state: 'new',
      currency: 'USD',
      grand_total: grand_total_num,
      payment_fee: service_fee_num,
      shipping_amount: delivery_num,
      shipping_method,
      shipping_service,
      is_musculito,
      shipping_provider_id,
      pickup_location_code:
        shipping_method === 'pickup'
          ? String(
            storeFD?.pickup_location_code ||
            store?.pickup_location_code ||
            store?.code ||
            '',
          )
          : null,
      customer: {
        full_name,
        document_number,
        email,
        phone,
      },

      origin_address,
      destination_address,
      items,
    };
  };

  const sendOrderToExternalSystem = async (opts?: {
    magentoOrderNumber?: string;
    megasoftInvoiceId?: string;
    megasoftControl?: string;
  }) => {
    try {
      setSyncLoading(true);
      setSyncResult(null);

      const payload = buildSyncOrderPayload({
        magentoOrderNumber: opts?.magentoOrderNumber,
        megasoftInvoiceId: opts?.megasoftInvoiceId,
        megasoftControl: opts?.megasoftControl,
      });
      setSyncPayloadPreview(payload);

      // si quieres SOLO ver el JSON, comenta lo de abajo
      const resp = await syncOrderToCreditivoo(payload);
      setSyncResult(`OK: ${JSON.stringify(resp)}`);
    } catch (e: any) {
      setSyncResult(`ERROR: ${e?.message || String(e)}`);
    } finally {
      setSyncLoading(false);
    }
  };
  //end debug

  const fetchCasheaDownPayment = async (idNumber: string) => {
    try {
      const url = `https://cashea.creditivoo.com/api/cashea/get_order.php?id=${encodeURIComponent(
        idNumber,
      )}`;

      const res = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      const json = await res.json();

      if (!json?.ok) {
        throw new Error(json?.error || 'No se pudo obtener la inicial');
      }

      const downPayment = json?.downPayment ?? null;
      const financedAmount = json?.data?.orderDetails?.financedAmount ?? null;

      setCasheaDownPayment(downPayment);
      setCasheaOrder(json);
      setCasheaFinanceAmount(financedAmount);

      if (downPayment != null && financedAmount != null) {
        setcashea(true);
      } else {
        setcashea(false);
      }

      return downPayment;
    } catch (e: any) {
      setcashea(false);
      return null;
    }
  };

  const getMissingProfileFields = () => {
    const cd = global_data?.customerData || {};

    const firstName = cleanText(cd.firstName || global_data?.Fname);
    const lastName = cleanText(cd.lastName || global_data?.Lname);
    const citizenId = cleanDigits(cd.citizen_id);
    const phone = cleanDigits(cd.phone || cd.telephone);

    const missing: string[] = [];
    if (!firstName) missing.push('Nombre');
    if (!lastName) missing.push('Apellido');
    if (!citizenId) missing.push('Cédula');
    if (!phone) missing.push('Teléfono');

    return missing;
  };

  const ensureProfileCompleteOrGoProfile = () => {
    const missing = getMissingProfileFields();
    if (missing.length === 0) return true;

    Alert.alert(
      'Completa tu perfil',
      `Para continuar con el pago necesitamos: ${missing.join(', ')}.`,
      [
        {
          text: 'Ir a Perfil',
          onPress: () =>
            (navigation as any).navigate(
              Routes.NAVIGATION_TO_UpdateUserprofile,
            ),
        },
        { text: 'Cancelar', style: 'cancel' },
      ],
    );

    return false;
  };

  // end Frodriguez

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
      }
    }
  }, [PurchaseOrderdata]);

  useEffect(() => {
    processCartData();
  }, [cartData]);
  const processCartData = async () => {
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
      } else {
        console.log(
          'else part there is no value for setting alternate address',
        );
      }
    }
  }, [isAlternetAddress]);

  //add Frodriguez
  const totalToShow =
    cashea && casheaDownPayment != null && casheaFinanceAmount != null
      ? moneyToNumberSafe(casheaDownPayment) +
      moneyToNumberSafe(casheaFinanceAmount)
      : moneyToNumberSafe(GrandTotal);
  //end Frodriguez

  return (
    <View style={{ flex: 1, backgroundColor: appTheme.background }}>
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
        keyboardShouldPersistTaps="always"
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
          <Text style={[commonStyle.profileHeader, { color: appTheme.text }]}>
            {translate('order.lbl_delivery_method')}
          </Text>
          <ShippingMethod
            cartData={cartData}
            pickupStores={
              CachedCartInvData && CachedCartInvData.cartInventory
                ? CachedCartInvData.cartInventory.available_pickup_locations.filter(
                  item => item.latitude !== null,
                )
                : []
            }
            /* add Frodriguez */
            onShippingChange={details => {
              setShippingData(details);

              if (details.method === 'pickup') {
                setOriginName(details.store?.name || '');
                setpickupPoint(details.store);

                setDeliveryAdd(null);
                setisDeliveryAvailable(false);
                setispickupavailable(true);
                return;
              }

              setOriginName(details.store?.name || '');
              setDestinationAddress(details.address || '');
              setispickupavailable(false);
              setisDeliveryAvailable(true);

              const destCity =
                details?.destination?.city ||
                details?.destination_address?.city ||
                details?.store?.fullData?.city ||
                '';

              const destPostcode =
                details?.destination?.postal_code ||
                details?.destination_address?.postal_code ||
                details?.store?.fullData?.postcode ||
                details?.store?.postcode ||
                '';

              const destCountry =
                details?.destination?.country ||
                details?.destination_address?.country ||
                details?.store?.fullData?.country_id ||
                'VE';

              const visualAddress = {
                address_type: 'custom_delivery',
                firstname: global_data?.Fname || 'Cliente',
                lastname: global_data?.Lname || 'IVOO',
                street: [details.address || 'Calle', ''],
                city: destCity,
                postcode: destPostcode,
                country_code: destCountry,
              };

              setDeliveryAdd(visualAddress);
              setpickupPoint(null);
            }}
          /* end Frodriguez */
          />
          <View
            style={{
              marginBottom: 80,
              paddingTop: 10,
              opacity:
                !deliveryAdd && !pickupPoint && !isAlternetAddress ? 0.5 : 1.0,
            }}
            pointerEvents={
              !deliveryAdd && !pickupPoint && !isAlternetAddress
                ? 'none'
                : 'auto'
            }>
            {casheaDownPayment == null && (
              <Text
                style={[
                  commonStyle.profileHeader,
                  commonStyle.fontBold,
                  { paddingBottom: 0, color: appTheme.text },
                ]}>
                {translate('order.lbl_payment')}
              </Text>
            )}
            {/* add Frodriguez */}
            {/* {__DEV__ && (
              <TouchableOpacity
                onPress={sendOrderToExternalSystem }
                style={[
                  styles.methodItem,
                  {
                    borderStyle: 'dashed',
                    borderColor: IVOO_COLORS.primary,
                    borderWidth: 1,
                  },
                ]}>
                <View style={commonStyle.flexDir_Row}>
                  <Text style={[commonStyle.h5, { color: appTheme.text }]}>
                    {syncLoading
                      ? 'Probando Sync...'
                      : 'Probar Sync (DEBUG)'}
                  </Text>
                </View>
              </TouchableOpacity>
            )} */}

            {/* end Frodriguez */}
            {casheaDownPayment == null && (
              <TouchableOpacity
                onPress={async () => {
                  await PagarConCashea();
                }}
                style={[
                  styles.methodItem,
                  Paymenttype === 'cashea' && styles.methodItemActive,
                  { backgroundColor: appTheme.InputBoxBGColor },
                ]}>
                <View style={commonStyle.flexDir_Row}>
                  <ProgressiveImage
                    source={ResImage.ic_cashea}
                    style={styles.methodIcon}
                  />
                  <Text style={[commonStyle.h5, { color: appTheme.text }]}>
                    Cashea
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            {casheaDownPayment == null && (
              <TouchableOpacity
                disabled={loading}
                onPress={() => {

                  PaymentMegasoft(); // add Jmarin

                }}
                style={[
                  styles.methodItem,
                  loading && { opacity: 0.6 },
                  { backgroundColor: appTheme.InputBoxBGColor },
                ]}>
                <View style={[commonStyle.flexDir_Row, { alignItems: 'center' }]}>
                  <ProgressiveImage
                    source={ResImage.ic_Cash}
                    style={styles.methodIcon}
                  />
                  <Text style={[commonStyle.h5, { color: appTheme.text }]}>
                    Pagar
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            {/* <TouchableOpacity
              style={[
                {
                  marginTop: 25,
                  backgroundColor: appTheme.InputBoxBGColor,
                  height: 50,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 12,
                  marginHorizontal: 10,
                  // Sombra para que resalte
                  shadowColor: '#000',
                  shadowOffset: {width: 0, height: 2},
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
                },
              ]}
              disabled={loading} // Evita múltiples envíos
              onPress={() => {
                Pagar();
                //setPaymentType('cash');
                //processPurchaseOrder()
              }}>
              <Text
                style={[
                  commonStyle.h4,
                  commonStyle.fontBold,
                  {
                    color: isDark
                      ? colorResource.disable_clr
                      : colorResource.Gray,
                    textTransform: 'uppercase',
                  },
                ]}>
                Pagar
              </Text>
            </TouchableOpacity> */}
            {/* {
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
             } */}
          </View>
        </View>
      </ScrollView>
      {/* {
        <View>
          {highDimText.length > 0 && (
            <Text style={styles.centeredText}>{highDimText}</Text>
          )}
        </View>
      } */}

      {cartData && cartData.customerCart.items.length > 0 && (
        <View
          style={[
            commonStyle.padding_16,
            {
              backgroundColor: isDark
                ? appTheme.InputBoxBGColor
                : colorResource.SmokeWhite,
              marginBottom: 10,
            },
          ]}>
          {casheaDownPayment != null && (
            <View style={{ flexDirection: 'column' }}>
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
                    { color: appTheme.text, fontWeight: '700' },
                  ]}>
                  Monto inicial + Envio
                </Text>
                <Text style={[commonStyle.h6, { color: appTheme.text }]}>
                  {'$' + casheaDownPayment}
                </Text>
              </View>
            </View>
          )}
          {casheaDownPayment != null && (
            <View style={{ flexDirection: 'column' }}>
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
                    { color: appTheme.text, fontWeight: '700' },
                  ]}>
                  Monto Financiado
                </Text>
                <Text style={[commonStyle.h6, { color: appTheme.text }]}>
                  {'$' + casheaFinanceAmount}
                </Text>
              </View>
            </View>
          )}
          {casheaDownPayment == null && (
            <View style={{ flexDirection: 'column' }}>
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
                    { color: appTheme.text, fontWeight: '700' },
                  ]}>
                  Monto inicial
                </Text>
                <Text style={[commonStyle.h6, { color: appTheme.text }]}>
                  {Helper.currencyFormat(
                    cartData.customerCart.prices.subtotal_excluding_tax.value,
                  )}
                </Text>
              </View>
            </View>
          )}
          {cartData &&
            cartData.customerCart.shipping_addresses &&
            DeliveryCharge != '$0.00' &&
            casheaDownPayment == null && (
              <View style={{ flexDirection: 'column' }}>
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
                      commonStyle.fontBold,
                      ,
                      { color: appTheme.text },
                    ]}>
                    {translate('checkout.lbl_deliveryfee')}{' '}
                  </Text>
                  <Text style={[commonStyle.h6, { color: appTheme.text }]}>
                    {DeliveryCharge}
                  </Text>
                </View>
              </View>
            )}
          {cartData && ServiceFees != '$0.00' && (
            <View style={{ flexDirection: 'column' }}>
              <View
                style={[
                  {
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  },
                ]}>
                <Text style={[commonStyle.h6, { color: appTheme.text }]}>
                  Servicio
                </Text>
                <Text style={[commonStyle.h6, { color: appTheme.text }]}>
                  {ServiceFees}
                </Text>
              </View>
            </View>
          )}
          {Discount !== '' && Discount != '$0.00' && (
            <View style={{ flexDirection: 'column', marginBottom: 10 }}>
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
                    { color: appTheme.text, fontWeight: '600' },
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
            style={[styles.amountContainer, { marginBottom: 15, marginLeft: 2 }]}>
            <Text
              style={[
                commonStyle.h6,
                commonStyle.fontBold,
                ,
                { color: appTheme.text },
              ]}>
              {/* {translate( 'order.lbl_total_amt' )} */}
              {/* Sub total */}Total
            </Text>
            <Text
              style={[
                commonStyle.h6,
                commonStyle.fontBold,
                { color: colorResource.pink_product_price },
              ]}>
              {'$' + totalToShow.toFixed(2)}
            </Text>
          </View>
          {/* add Frodriguez */}
          {/* {__DEV__ && (
            <View style={{ marginTop: 12 }}>
              <TouchableOpacity onPress={() => setShowSyncDebug(true)}>
                <Text style={{ color: IVOO_COLORS.primary, fontWeight: '700' }}>
                  Ver JSON (Debug)
                </Text>
              </TouchableOpacity>

              <Modal
                visible={showSyncDebug}
                animationType="slide"
                onRequestClose={() => setShowSyncDebug(false)}>
                <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: '#eee',
                    }}>
                    <TouchableOpacity
                      onPress={() => setShowSyncDebug(false)}
                      style={{ padding: 8 }}>
                      <Text
                        style={{ color: IVOO_COLORS.primary, fontWeight: '700' }}>
                        Cerrar
                      </Text>
                    </TouchableOpacity>
                    <Text
                      style={{ flex: 1, textAlign: 'center', fontWeight: '700' }}>
                      Payload Preview
                    </Text>
                    <View style={{ width: 60 }} />
                  </View>

                  <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ padding: 12 }}>
                    <Text
                      selectable
                      style={{
                        fontFamily:
                          Platform.OS === 'ios' ? 'Menlo' : 'monospace',
                        fontSize: 12,
                        lineHeight: 18,
                      }}>
                      {JSON.stringify(buildSyncOrderPayload(), null, 2)}
                    </Text>

                    {!!syncResult && (
                      <Text style={{ marginTop: 12 }}>{syncResult}</Text>
                    )}
                  </ScrollView>
                </SafeAreaView>
              </Modal>
            </View>
          )} */}
          {/* end Frodriguez */}
          {casheaDownPayment != null && (
            <CustomButton
              title="checkout.lbl_finish_and_order"
              onPress={() => {
                //Pagar('cashondelivery');
                PaymentMegasoft();
              }}
              customButtonStyle={[
                commonStyle.btn_primary,
                commonStyle.fontBold,
              ]}
            />
          )}
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
            contentContainerStyle: { height: '100%' },
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
            contentContainerStyle: { height: '100%' },
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
            contentContainerStyle: { height: '100%' },
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
            contentContainerStyle: { height: '100%' },
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
            contentContainerStyle: { height: '100%' },
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
            contentContainerStyle: { height: '100%' },
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
            getAlternateAddress();
          }}
          scrollViewProps={{
            scrollEnabled: false,
            contentContainerStyle: { height: '100%' },
          }}>
          <AlternetAddress
            CloseBottomsheet={() => {
              modalizeRefAddress.current?.close();
            }}
            addressfromMap={AddressToMap}
            ContinuetoMap={adrs => {
              getAlternateAddress();
              modalizeRefAddress.current?.close();
            }}
          />
        </Modalize>
      </Portal>
      <Portal>
        {/* add Frodriguez */}
        {/* Modal pedir cédula */}
        <Modal
          visible={showCasheaIdModal}
          transparent
          animationType="fade"
          onRequestClose={cancelCasheaIdModal}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Pagar con Cashea</Text>
                <TouchableOpacity
                  onPress={cancelCasheaIdModal}
                  style={styles.modalCloseButton}>
                  <Icon
                    name="close"
                    type={IconType.Ionicons}
                    size={22}
                    color={IVOO_COLORS.black}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <Text style={styles.modalLabel}>Cédula</Text>
                <TextInput
                  defaultValue={casheaIdDraftUI}
                  onChangeText={validateCedula}
                  placeholder="Ej: 19999907"
                  keyboardType="number-pad"
                  maxLength={MAX_CEDULA_DIGITS}
                  style={styles.modalInput}
                  autoCorrect={false}
                  autoComplete="off"
                  importantForAutofill="no"
                />
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  onPress={cancelCasheaIdModal}
                  style={[styles.modalButton, styles.modalButtonCancel]}>
                  <Text style={styles.modalButtonCancelText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={confirmCasheaIdAndOpenWebview}
                  disabled={!isCasheaIdValid}
                  style={[
                    styles.modalButton,
                    styles.modalButtonConfirm,
                    !isCasheaIdValid && { opacity: 0.45 },
                  ]}>
                  <Text style={styles.modalButtonConfirmText}>Aceptar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        {/* Modal WebView Cashea */}
        <Modal
          visible={isProcessingCashea && !!casheaUrl}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={handleCasheaClose}>
          <View style={styles.webViewContainer}>
            <View style={styles.webViewHeader}>
              <Text style={styles.webViewTitle}>Cashea</Text>
              <TouchableOpacity
                onPress={handleCasheaClose}
                style={styles.closeButton}>
                <Icon
                  name="close"
                  type={IconType.Ionicons}
                  size={24}
                  color={IVOO_COLORS.black}
                />
              </TouchableOpacity>
            </View>
            {!!casheaUrl && (
              <WebView
                ref={casheaWebRef}
                source={{ uri: casheaUrl }}
                style={styles.webView}
                onMessage={onCasheaMessage}
                onNavigationStateChange={onCasheaNavigationStateChange}
                onShouldStartLoadWithRequest={
                  onCasheaShouldStartLoadWithRequest
                }
                startInLoadingState
                javaScriptEnabled
                domStorageEnabled
                mixedContentMode="always"
                originWhitelist={['https://*']}
                thirdPartyCookiesEnabled
                sharedCookiesEnabled
                javaScriptCanOpenWindowsAutomatically
                setSupportMultipleWindows={false}
              />
            )}
          </View>
        </Modal>
        {/* end Frodriguez */}
        <Modal
          visible={showPayModal}
          transparent={false}
          animationType="slide"
          presentationStyle="pageSheet"
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
            {/*<WebView
              source={{ uri: paymentUrl }}
              style={styles.webview}
              onNavigationStateChange={handleWebViewNavigationStateChange}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
              renderLoading={() => (
                <ActivityIndicator
                  style={styles.loading}
                  size="large"
                  color="#10B981"
                />
              )}
            />*/}
            <WebView
              source={{ uri: paymentUrl }}
              style={styles.webview}
              onNavigationStateChange={handleWebViewNavigationStateChange}
              onMessage={handleMegasoftMessage}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
              renderLoading={() => (
                <ActivityIndicator
                  style={styles.loading}
                  size="large"
                  color="#10B981"
                />
              )}
            />
          </View>
        </Modal>
      </Portal>

      <CustomPBar
        showProgress={loading || CartLoading || loadingAddresses || aLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loading: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    zIndex: 10,
  },
  webview: {
    flex: 1,
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: '#fff', //IVOO_COLORS.white,
  },
  webViewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SCREEN_WIDTH * 0.05,
    paddingVertical: SCREEN_HEIGHT * 0.02,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: '#fff', //IVOO_COLORS.white,
  },
  webViewTitle: {
    fontSize: SCREEN_WIDTH * 0.042,
    fontFamily: 'Inter-bold', //IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: 'bold', //IVOO_TYPOGRAPHY.fontWeight.bold,
    color: 'black', //IVOO_COLORS.black,
  },
  closeButton: {
    padding: SCREEN_WIDTH * 0.01,
    color: 'green',
  },
  webView: {
    flex: 1,
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    backgroundColor: lightColors?.InputBoxBGColor,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'transparent',
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
  cardNumberText: { paddingLeft: 7 },
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
    color: ResorceColor.cancleclr,
    marginLeft: 50,
    marginRight: 50,
    marginBottom: 8,
    marginTop: 8,
  },
  /* add Frodriguez */
  creditivooCartBadge: {
    backgroundColor: '#000000',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#2E7D32',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  creditivooTag: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  creditivooCuotas: {
    color: '#FFFFFF',
    fontSize: 13,
    textAlign: 'center',
    opacity: 0.9,
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
});

export default Checkout;
