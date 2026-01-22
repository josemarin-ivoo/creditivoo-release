import {useLazyQuery} from '@apollo/client';
import React, {useState, useEffect, useContext, useCallback} from 'react';
import {useNavigation, useRoute, useFocusEffect, } from '@react-navigation/native';
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
  Modal,
  Dimensions,
} from 'react-native';

import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../Auth/Creditivoo/styles';
import {IconType} from 'react-native-dynamic-vector-icons';

import {SwipeListView, SwipeRow} from 'react-native-swipe-list-view';
import WheelPicker from 'react-native-wheely';
import {Icon} from 'react-native-elements';
import commonStyle from '../../../../commonStyle';
import CustomPBar from '../../../Components/CustomPBar';
import ProgressiveImage from '../../../Components/ProgressiveImage';
import {translate} from '../../../locales/translate';
import {
  applyCouponToCart,
  cartDelete,
  cartList,
  checkIfHighDimensionProduct,
  updateCartItemsQTY,
} from '../../../Queries/queries';
import Helper from '../../../Utils/Helper';
import ResImage from '../../../Utils/Image';
import {useDispatch, useSelector} from 'react-redux';
import {CartItemCounterAction} from '../../../redux/cartItemCounterAction';
import ResorceColor from '../../../Utils/Colors';
import {CustomButton} from '../../../Components/CustomButton';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ResColor from '../../../Utils/Colors';
import {AppContext} from '../../AppContext';
import {removeCouponFromCart} from './../../../Queries/queries';
import CommonHandlers from './../../../Utils/CommonHandlers';
import {setDeviceId} from './../../../Queries/queries';
import PermissionHandler from './../../../Utils/PermissionHandler';
import {
  getItemFromStorage,
  getObjectFromStore,
  setObjectInStore,
} from '../../../Utils/Storage';
import {Routes} from '../../../Utils/NavigationRoutes';

import {setItemInStorage} from './../../../Utils/Storage';
import {isNeedtoUpdatePAYDATA} from './../../../redux/PaymentMethodsReducers/PaymentMethodsAction';

import {Modalize} from 'react-native-modalize';
import {ISCHECKOUTCacheUpdated} from '../../../redux/CheckoutCacheReducer/CheckoutCacheAction';
import {AnalyticsBeginCheckout} from '../../../helpers/analyticHelper';
import {TextInput} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import Colors from '../../../Utils/Colors';
<<<<<<< HEAD
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


const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');
=======
import CreditivooLogin from '../Creditivoo/CreditivooLogin';
>>>>>>> origin/frodriguez

const Cart = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const dispatchh = useIvoDispatch();
  const [outofstock, setoutofstock] = useState(false); //Item outof stock will get remvoe from magento side
  const [GrandTotal, setGrandTotal] = useState('');
  const [ServiceFees, setServiceFees] = useState('');
  const {appTheme} = useContext(AppContext);
  const [Input_coupon_code, setcoupon_code] = useState('');
  const [IsValidCoupon, setIsValidCoupon] = useState(false);
  const [rejectedCoupon, setrejectedCoupon] = useState(false); // Should true when COUPON code is invalid
  const [Discount, setDiscount] = useState('');
  const [minimOrderAmtValidate, setMinimumOrder] = useState(false);
  const [minimumOrderValidateMsg, setMinimumOrderValidateMsg] = useState('');
  const [
    checkHighDimProduct,
    {loading: boolean, error: highDimError, data: highDimData},
  ] = useLazyQuery(checkIfHighDimensionProduct);
  const [isHighDimTextVisible, setIsHighDimTextVisible] = useState(true);
  const [highDimTextInfo, setHighDimTextInfo] = useState('');
  const global_data = useSelector((state: any) => state.commonReducer);

  const [CachedCartData, setCachedCartData] = useState<any>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

<<<<<<< HEAD


  
=======
>>>>>>> origin/frodriguez
  // By JAMP 15-01-2026
  const IVOO_APP_TENANT_ID = 5;

  const percentageToId: Record<number, number> = {
    0.40: 27,
    0.50: 28,
    0.60: 29
  };
  const route = useRoute();
  const purchaseId = (route.params as any)?.purchaseId as number;
  //const [error, setError] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [paymentReferencia, setPaymentReferencia] = useState<string | null>(
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

  const [initialPercentage, setInitialPercentage] = useState();
  const [isCartFinanciable, setIsCartFinanciable] = useState(true);
<<<<<<< HEAD
  const [financingDetails, setFinancingDetails] = useState({ downPayment: 0, installment: 0, montFinance: 0 });
=======
  const [financingDetails, setFinancingDetails] = useState({
    downPayment: 0,
    installment: 0,
  });
>>>>>>> origin/frodriguez

  const [isCasheaSelected, setIsCasheaSelected] = useState(false);

  // By JAMP

  const [getCart, {loading: loadingB, data: cartListdataB}] = useLazyQuery(
    cartList,
    {errorPolicy: 'all'},
  );
  const [
    applyCouponToCartAPI,
    {loading: applyCouponLoad, error: applyCouponerror, data: applyCoupondata},
  ] = applyCouponToCart();

  const [
    removeCouponFromCartAPI,
    {loading: remLoad, error: remerr, data: removeCoupondata},
  ] = removeCouponFromCart();

  const [
    updateQTYCartAPI,
    {loading: updateQTYLoad, error: updateQTYerr, data: updateQTYdata},
  ] = updateCartItemsQTY();

  const [cartDeleteFunc, {loading, error, data}] = cartDelete();

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

  // Lógica de validación de financiamiento
  // By JAMP 14-01-2026

<<<<<<< HEAD


  
  useEffect(() => {
      
  
    (dispatch as any)(fetchMe()).unwrap()
    .then((userData) => {

       //Alert.alert('prueba '+userData.user.creditLimit);
      //console.log("Sesión activa para:", userData.user.name);
    })
    .catch(error => {
      console.error('[Creditivoo] Sesión inválida o expirada:', error);
    });
      // Solo se ejecuta una vez al montar
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
  
=======
  //   useEffect(() => {

  //   const checkStorageImmediatly = async () => {
  //     const val = await AsyncStorage.getItem('@creditivoo_context');
  //     console.log("LOG INMEDIATO:", val);
  //     if(val) Alert.alert("Carga inicial", val);
  //   };
  //   checkStorageImmediatly();
  // }, []);
>>>>>>> origin/frodriguez

  useEffect(() => {
    const loadCreditivooContext = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('@creditivoo_context');
        if (jsonValue != null) {
          const savedContext = JSON.parse(jsonValue);

          // CORRECCIÓN 1: Acceso directo al porcentaje
          const percentage = savedContext.selectedPercentage || 0.4;

          setInitialPercentage(percentage);
          setIsCartFinanciable(savedContext.isFinanciable);

          // CORRECCIÓN 2: Usar la variable local 'percentage' en lugar del estado 'initialPercentage'
          // para el cálculo inmediato
          if (!CachedCartData) {
            const total = savedContext.amountToFinance;
            const downPayment = total * percentage; // <--- Usamos la constante local
            const montFinance = (total - downPayment);
            const installment = (total - downPayment) / 4;
<<<<<<< HEAD
            setFinancingDetails({ downPayment, installment, montFinance });
=======
            setFinancingDetails({downPayment, installment});
>>>>>>> origin/frodriguez
          }

          console.log('Contexto recuperado:', savedContext);
        }
      } catch (e) {
        console.error('Error recuperando context', e);
      }
    };

    loadCreditivooContext();

    // CORRECCIÓN 3: Recalcular con datos reales de la API si existen
    if (
      CachedCartData?.customerCart?.prices?.grand_total?.value &&
      initialPercentage
    ) {
      const total = CachedCartData.customerCart.prices.grand_total.value;
      const downPayment = total * initialPercentage;
      const montFinance = (total - downPayment);
      const installment = (total - downPayment) / 4;
<<<<<<< HEAD
      setFinancingDetails({ downPayment, installment, montFinance });
=======
      setFinancingDetails({downPayment, installment});
>>>>>>> origin/frodriguez
    }
  }, [CachedCartData, initialPercentage]);

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

    console.log('checkHighDimProduct api called');
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

<<<<<<< HEAD


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

  const handleCreditivooCheckout = async () => {
    Helper.HandleVibration();
    setIsCreatingOrder(true);
    // const token = await AsyncStorage.getItem('@creditivoo_session_token');
    //obtenemos lo que tiene el carrito
   const totalCart = CachedCartData?.customerCart?.prices?.grand_total?.value ?? 0;

   const cedulaUsuario = user?.document;

   
   // verificamos que el usuario exista en creditivoo https://api-ivoo-dev.whaledigitals.com/purchases/paymentValidator/transaction/confirm/p/@control
   
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

      if (!creditivooUser) {
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
    if (!creditivooUser.creditAvailable || creditivooUser.creditAvailable <= 0) {
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
        totalAmount: totalCart,
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
            totalAmount: Number(totalCart),
            userId: Number(creditivooUser.id) // Aquí convertimos el "36" a 36
          })
        }
      );

      const responsepurchase = await purchaseResponse.text(); 
      const purchase = JSON.parse(responsepurchase);

      Alert.alert(""+Number(purchase.id));
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

      //Alert.alert(""+JSON.stringify(isAutoCompleted));
      
      if (isAutoCompleted) {
        await handleVerificationFlow(response.referencia);
      } else if (response.paymentUrl) {
        // --- CAMBIO AQUÍ: ACTIVAR MODAL EN LUGAR DE NAVEGAR ---
        console.log('[Checkout] Activando Modal de pago:', response.paymentUrl);
        
        setPaymentUrl(response.paymentUrl);
        setPaymentReferencia(response.referencia);
        setIsProcessingPayment(true);     // Muestra el Modal
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
  // By JAMP 14-01-2026

  const renderPaymentMethodSwitch = () => (
    <View style={styles.switchContainer}>
      <TouchableOpacity
        style={[
          styles.switchOption,
          !isCasheaSelected && styles.switchOptionActive,
        ]}
        onPress={() => setIsCasheaSelected(false)}>
        <Text
          style={[
            styles.switchText,
            !isCasheaSelected && styles.switchTextActive,
          ]}>
          CREDITIVOO
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.switchOption,
          isCasheaSelected && styles.switchOptionActive,
        ]}
        onPress={() => setIsCasheaSelected(true)}>
        <Text
          style={[
            styles.switchText,
            isCasheaSelected && styles.switchTextActive,
          ]}>
          CASHEA
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderCasheaSection = () => (
    <View style={styles.casheaMainContainer}>
      <TouchableOpacity
        style={styles.casheaCartBadge}
        onPress={() => Alert.alert('Cashea', 'Redirigiendo a Cashea...')}>
        <Text style={styles.casheaTag}>PAGAR CON CASHEA</Text>
        <Text style={styles.casheaSubtext}>
          Compra ahora y paga después en cuotas sin interés
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderCreditivooSection = () => {
    if (isCartFinanciable === null) return null;
    if (isCartFinanciable === false) {
      return (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>
            Alguno de los productos añadidos al carrito no posee financiamiento
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.creditivooMainContainer}>
        <Text
          style={[
            commonStyle.h5,
            {color: appTheme.text, marginBottom: 10, fontWeight: 'bold'},
          ]}>
          Selecciona tu inicial:
        </Text>
        
        <View style={styles.selectorRow}>
          {[0.4, 0.5, 0.6].map(perc => (
            <TouchableOpacity
              key={perc}
              onPress={() => setInitialPercentage(perc)}
              style={[
                styles.percentageBtn,
                initialPercentage === perc && styles.percentageBtnActive,
              ]}>
              <Text
                style={[
                  styles.percentageText,
                  initialPercentage === perc && styles.percentageTextActive,
                ]}>
                {Math.round(perc * 100)}%
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* <TouchableOpacity style={styles.creditivooCartBadge} onPress={() => Alert.alert("Creditivoo", "Procesando pago...")}> */}
<<<<<<< HEAD
        {/* <TouchableOpacity style={styles.creditivooCartBadge} onPress={handleCreditivooCheckout}>
=======
        <TouchableOpacity
          style={styles.creditivooCartBadge}
          onPress={handleCreditivooCheckout}>
>>>>>>> origin/frodriguez
          <Text style={styles.creditivooTag}>PAGAR CON CREDITIVOO</Text>
          <Text style={styles.creditivooCuotas}>
            Inicial de {Helper.currencyFormat(financingDetails.downPayment)} + 4
            cuotas de: {Helper.currencyFormat(financingDetails.installment)}
          </Text>
        </TouchableOpacity> */}
      </View>
    );
  };

  // By JAMP logica para validacion de usuario creditivoo y navegacion a planSelection

  const handleCreditivooNavigation = async () => {
    Helper.HandleVibration();

    // 1. Verificamos si existe un token de sesión de Creditivoo
    const creditivooToken = await AsyncStorage.getItem(
      '@creditivoo_session_token',
    );

    if (creditivooToken) {
      // SI TIENE SESIÓN: Vamos directo al Plan Selection
      // Asegúrate de que este nombre coincida con tu NavigationRoutes.ts
      (navigation as any).navigate(Routes.NAVIGATION_PLANSELECTION, {
        cartData: CachedCartData,
        financing: financingDetails,
      });
    } else {
      // NO TIENE SESIÓN: Vamos al Login de Creditivoo
      // Le pasamos un parámetro 'redirectTo' para que el login sepa a dónde ir después
      (navigation as any).navigate(Routes.NAVIGATION_CREDITIVOO, {
        nextScreen: Routes.NAVIGATION_PLANSELECTION,
        cartData: CachedCartData,
      });
    }
  };

  // BY JAMP

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
            style={{padding: 8}}
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
            {backgroundColor: appTheme.background},
          ]}>
          <View style={{flex: 0.3}}>
            <ProgressiveImage
              source={{
                uri: item.product.small_image.url + Helper.listImageSize,
              }}
              style={{width: 88, height: 88, borderRadius: 8}}
              resizeMode="stretch"
            />
          </View>
          <View style={{flex: 0.7}}>
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
                  {maxWidth: '90%', color: appTheme.text},
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
                style={{flexDirection: 'row', alignItems: 'center'}}
                onPress={() => {
                  setItemIdtoUpdateinCart(item.id);
                  setSelectedIndex(0);
                  wheelModalizeRef.current.open();
                }}>
                <Text
                  style={[
                    commonStyle.h6,
                    commonStyle.fontBold,
                    {color: ResColor.greenBackground, marginRight: 8},
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
                    {color: appTheme.text, marginRight: 12},
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
                    {color: 'red'},
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
      var isHighDimProduct: boolean =
        obj.highdimension[0].highdimension2.is_high_dimension;
      setIsHighDimTextVisible(isHighDimProduct);
      if (isHighDimProduct) {
        setHighDimTextInfo(obj.highdimension[0].highdimension2.text);
      } else {
        setHighDimTextInfo('');
      }
    }
  }, [highDimData]);

  useEffect(() => {
    console.log('high dim error data' + JSON.stringify(highDimError));
  }, [highDimError]);

  const handleKeyDown = () => {
    console.log('========= Enter =========');
    CallapplyCouponToCartAPI();
  };

  const Header = () => {
    return (
      <View style={headerstyles.headerContainer}>
        <View style={headerstyles.titleContainer}>
          <Text
            style={[
              commonStyle.h5,
              commonStyle.fontBold,
              {color: appTheme.text},
            ]}>
            {translate('cart.lbl_cart_title')}
          </Text>
        </View>
        {/* ✅ Botón Wishlist (derecha) */}
        <TouchableOpacity
          onPress={() => {
            Helper.HandleVibration();
            (navigation as any).navigate(Routes.WISHTLIST);
          }}
          style={headerstyles.wishlistBtn}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
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
        {/*<TouchableHighlight onPress={()=>{}} underlayColor="transparent">
            <ProgressiveImage
                source={appTheme.ic_share_new}
                style={{width: 24, height: 24, marginRight: 20}}
                resizeMode="stretch"
            />
          </TouchableHighlight>*/}
      </View>
    );
  };

  return (
    <View
      style={[styles.mainContainer, {backgroundColor: appTheme.background}]}>
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
        <KeyboardAwareScrollView>
          <View
            style={{
              paddingLeft: 16,
              paddingEnd: 16,
              marginBottom: 16,
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
                {
                  <View>
                    {isHighDimTextVisible && (
                      <Text style={styles.centeredText}>{highDimTextInfo}</Text>
                    )}
                  </View>
                }
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
                            ? {fontWeight: '700', color: ResColor.Green}
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


           <View
              style={{
                borderBottomColor: appTheme.type === 'dark' ? 'white' : ResColor.Gray,
                borderBottomWidth: 1,
                marginTop: 5,
                marginBottom: 15, // Aumenté un poco el margen para el switch
              }}
            />

            {renderPaymentMethodSwitch()}
            {isCasheaSelected ? renderCasheaSection() : renderCreditivooSection()}

        </KeyboardAwareScrollView>

        {CachedCartData && CachedCartData.customerCart.items.length > 0 && (
          <View style={{padding: 16}}>

           
            {minimumOrderValidateMsg.length > 0 && (
              <Text
                style={[
                  commonStyle.h5,
                  {
                    color: 'red',
                    textAlign: 'center',
                    paddingVertical: 4,
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
                  {color: appTheme.placeholderTextColor, fontWeight: '700'},
                ]}>
                Monto de inicial ({Number(initialPercentage)*100}%)
              </Text>
                
              <Text
                style={[
                  commonStyle.h6,
                  {color: appTheme.placeholderTextColor},
                ]}>{`${
                CachedCartData
                  ? Helper.currencyFormat(
                      financingDetails.downPayment
                      
                    )
                  : Helper.currencyFormat(0)
              }`}</Text>
            </View>

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
                  {color: appTheme.placeholderTextColor, fontWeight: '700'},
                ]}>
                Monto Financiado
              </Text>
                
              <Text
                style={[
                  commonStyle.h6,
                  {color: appTheme.placeholderTextColor},
                ]}>{`${
                CachedCartData
                  ? Helper.currencyFormat(
                      financingDetails.montFinance
                      
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
                    {color: appTheme.placeholderTextColor, fontWeight: '700'},
                  ]}>
                  Código de Promo
                </Text>
                <Text
                  style={[
                    commonStyle.h6,
                    {color: ResColor.pink_product_price, fontWeight: '700'},
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
                    {color: appTheme.placeholderTextColor, fontWeight: '700'},
                  ]}>
                  Servicio
                </Text>
                <Text
                  style={[
                    commonStyle.h6,
                    {color: appTheme.placeholderTextColor, fontWeight: '700'},
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
                  {color: appTheme.text, fontWeight: '700'},
                ]}>
                {translate('cart.lbl_sub_total')}
              </Text>
              <Text
                style={[
                  commonStyle.h6,
                  {color: ResColor.pink_product_price, fontWeight: '700'},
                ]}>
                {GrandTotal}
              </Text>
            </View>

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
                    {color: appTheme.placeholderTextColor, fontWeight: '700'},
                  ]}>
                  Servicio
                </Text>
                <Text
                  style={[
                    commonStyle.h6,
                    {color: appTheme.placeholderTextColor, fontWeight: '700'},
                  ]}>{`${ServiceFees}`}</Text>
              </View>
            )}
            {/* aca estaba el boton de metodos de pago */}
            



<<<<<<< HEAD

=======
            <View
              style={{
                borderBottomColor:
                  appTheme.type === 'dark' ? 'white' : ResColor.Gray,
                borderBottomWidth: 1,
                marginTop: 5,
                marginBottom: 15,
              }}
            />

            {renderPaymentMethodSwitch()}
            {isCasheaSelected
              ? renderCasheaSection()
              : renderCreditivooSection()}
>>>>>>> origin/frodriguez

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

                (navigation as any).navigate(Routes.NAVIGATION_TO_CHECKOUT, {
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
            {backgroundColor: appTheme.background},
            appTheme.type == 'dark'
              ? null
              : {borderTopLeftRadius: 24, borderTopRightRadius: 24},
          ]}>
          <View style={{marginHorizontal: 24}}>
            {
              <View style={[styles.filterHeaderContainer, {marginTop: 16}]}>
                <View style={[{flexGrow: 0, flexShrink: 1, flexBasis: 'auto'}]}>
                  <TouchableOpacity
                    onPress={() => {
                      Helper.HandleVibration();
                      wheelModalizeRef.current.close();
                    }}
                    style={{padding: 5}}>
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
                <View style={[{flex: 0.4}]}>
                  <Text
                    style={[
                      commonStyle.h5,
                      commonStyle.fontBold,
                      {textAlign: 'right', right: -10, color: appTheme.text},
                    ]}>
                    Cantidad
                  </Text>
                </View>
                <View style={[{flex: 0.4}]}>
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
            <View style={{marginBottom: 10}}>
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
      <Modal
        visible={isProcessingPayment && !!paymentUrl}
        animationType="slide"
        onRequestClose={() => setIsProcessingPayment(false)}>
        <View style={styles.webViewContainer}>
          <View style={styles.webViewHeader}>
            <Text style={styles.webViewTitle}>Procesando pago</Text>
            <TouchableOpacity
              onPress={() => setIsProcessingPayment(false)}
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
    </View>
  );
};

const styles = StyleSheet.create({
  //By JAMP
  //estilos de modal
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

  

  // Estilos del Switch
  switchContainer: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A', // Ajustado para tu tema oscuro
    borderRadius: 25,
    padding: 4,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  switchOption: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 21,
  },
  switchOptionActive: {
    backgroundColor: '#333',
  },
  switchText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  switchTextActive: {
    color: '#FFF',
  },
  // Estilos Cashea
  casheaMainContainer: {
    marginVertical: 10,
  },
  casheaCartBadge: {
    backgroundColor: '#fdfa3d',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  casheaTag: {
    color: '#000000',
    fontWeight: '900',
    fontSize: 16,
  },
  casheaSubtext: {
    color: '#000000',
    fontSize: 11,
    opacity: 0.8,
    marginTop: 4,
  },

  // Contenedor principal de la sección
  creditivooMainContainer: {
    marginVertical: 16,
    paddingHorizontal: 8,
  },
  // Fila de los botones 40%, 50%, 60%
  selectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  percentageBtn: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444', // Gris oscuro para estado inactivo
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  percentageBtnActive: {
    backgroundColor: '#2E7D32', // Verde éxito para el seleccionado
    borderColor: '#2E7D32',
  },
  percentageText: {
    color: '#888',
    fontWeight: '600',
    fontSize: 14,
  },
  percentageTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  // El botón negro de "PAGAR CON CREDITIVOO"
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
    color: '#2E7D32', // Texto verde llamativo
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
  // Contenedor de advertencia (cuando isCartFinanciable es false)
  warningContainer: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
    marginVertical: 10,
  },
  warningText: {
    color: '#FF9800',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },

  // by JAMP

  renderDomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  mainContainer: {flex: 1, backgroundColor: ResorceColor.white},
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
});

export default Cart;
