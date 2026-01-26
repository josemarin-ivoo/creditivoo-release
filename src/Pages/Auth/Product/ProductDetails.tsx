import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
  TouchableHighlight,
  Dimensions,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import commonStyle from '../../../../commonStyle';
import {Button} from 'react-native-elements';
import {useLazyQuery} from '@apollo/client';
import {
  userCartId,
  productDetailInfo,
  productToCart,
  configuredProductsToCart,
  highdimension,
} from '../../../Queries/queries';
import {PinchGestureHandler, State} from 'react-native-gesture-handler';
import ProgressiveImage from '../../../Components/ProgressiveImage';
import Carousel, {Pagination} from 'react-native-snap-carousel';
import Helper from '../../../Utils/Helper';
import HeaderProductDetails from '../../../Components/HeaderProductDetails';
import HTML from 'react-native-render-html';
import {useSelector, useDispatch} from 'react-redux';
import {cartAction} from '../../../redux/cartAction';
import {CartItemCounterAction} from '../../../redux/cartItemCounterAction';

import {translate} from '../../../locales';
import CustomPBar from '../../../Components/CustomPBar';
import colorResource from '../../../Utils/Colors';
import resourceImages from '../../../Utils/Image';
import LoginOverlay from '../Cart/LoginOverlay';
import ProductAddedOverlay from './ProductAddedOverlay';
import {useNavigation} from '@react-navigation/native';
import CommonHandlers from './../../../Utils/CommonHandlers';

import LinearGradient from 'react-native-linear-gradient';
import {CustomButton} from '../../../Components/CustomButton';
import wishListHelper from '../Wishlist/wishListHelper';
import {Animated} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AnalyticsAddToCartEvent,
  AnalyticsEvent,
} from '../../../helpers/analyticHelper';
import TrackEvents from '../../../Utils/TrackingEvent';
import WishlistButton from '../Wishlist/WishlistButton';
import {AppContext} from '../../AppContext';
import {setItemInStorage} from './../../../Utils/Storage';
import ProductDetailsSkelton from '../../../Components/Skeleton/ProductDetailsSkelton';
import {Routes} from '../../../Utils/NavigationRoutes';
import {AppEventsLogger} from 'react-native-fbsdk-next';
import LowResHighResImage from '../../../Components/LowResHighResImage';
import ImageResource from './../../../Utils/Image';

const {height, width} = Dimensions.get('window');

const ProductDetails = props => {
  const {id} = props.route.params;

  const global_data = useSelector((state: any) => state.commonReducer);
  const {appTheme} = useContext(AppContext);
  const [productAddedFlag, setproductAddedFlag] = useState(false);
  const [LoginOverlayvisible, setLoginOverlayVisible] = useState(false);

  const [productInfoFunc, {loading, error, data}] =
    useLazyQuery(productDetailInfo);
  const [GetUsercartId, {loading: cartLoading, data: userCartIdData}] =
    useLazyQuery(userCartId);
  const [
    callAddToCart,
    {loading: cartAddLoading, error: CartError, data: addToCartData},
  ] = productToCart();
  const [
    isHighdimension,
    {
      loading: highdimensionLoading,
      error: highdimensionError,
      data: highdimensionData,
    },
  ] = useLazyQuery(highdimension);
  const [
    callConfiguredAddToCart,
    {
      loading: cartConfiguredAddLoading,
      error: ConfigCartError,
      data: configuredAddToCartData,
    },
  ] = configuredProductsToCart();

  const navigation = useNavigation();
  const dispatch = useDispatch();

  var _carousel: any = useRef(null);
  const cartId = useSelector((state: any) => state.cartReducer);
  const [productDetailType, setProductDetailType] = useState('Product');
  const [showMoreFlag, setShowMoreFlag] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedId] = useState(null);
  const [cardId, setcardId] = useState(id);
  const [cartID, setcartID] = useState(cartId);
  const [ProductVariantsSelection, setProductVariantsSelection] = useState({});
  const [galleryUpdate, setGalleryUpdate] = useState([]);
  const token = useSelector(state => state.commonReducer.token);
  const [canAddtocartClicked, setCanAddtocartClicked] = useState(true);
  const favitems = useSelector((state: any) => state.favItemReducer);
  const [isFastCheckout, setIsfastCheckout] = useState(false);

  const [wishitemLoad, setwishitemLoad] = useState(false);

  const [initialPercentage, setInitialPercentage] = useState(0.4);
  const [initialPercentageCashea, setInitialPercentageCashea] = useState(0.5);
  const [isCartFinanciable, setIsCartFinanciable] = useState(true);
  const [financingDetails, setFinancingDetails] = useState({
    downPayment: 0,
    installment: 0,
  });

  //added by Frodriguez
  const [isAcuotasSelected, setIsAcuotasSelected] = useState(false); // Si es de contado (false) o a cuotas (true)
  const [isCreditivooSelected, setIsCreditivooSelected] = useState(true); // Si dentro de "A cuotas" se selecciona Creditivoo (true) o Cashea (false)
  const DEFAULT_CREDITIVOO_PERC = 0.4;
  const DEFAULT_CASHEA_PERC = 0.4;
  //end Frodriguez

  const didShowAttrAlert = useRef(false);

  useEffect(() => {
    if (didShowAttrAlert.current) return;

    const product = data?.products?.items?.[0];
    if (!product) return;

    const attrs = product?.additional_attributes || [];

    const findAttr = code =>
      attrs.find(
        a => (a?.code || '').toString().toLowerCase() === code.toLowerCase(),
      );

    const financiableAttr = findAttr('financiable');
    const casheaAttr = findAttr('cashea');

    // Normalizamos valores típicos: 1/0, si/no, true/false
    const parseBool = v => {
      const val = (v ?? '').toString().trim().toLowerCase();
      return val === '1' || val === 'si' || val === 'true' || val === 'yes';
    };

    const flags = {
      sku: product?.sku,
      name: product?.name,
      additionalAttributesCount: attrs.length,
      financiable: financiableAttr ? parseBool(financiableAttr.value) : null,
      cashea: casheaAttr ? parseBool(casheaAttr.value) : null,
      raw_financiable: financiableAttr?.value ?? null,
      raw_cashea: casheaAttr?.value ?? null,
    };

    didShowAttrAlert.current = true;
  }, [data]);

  useEffect(() => {
    if (error) {
      CommonHandlers.CommonErrorHandler(error, dispatch, navigation);
    } else if (CartError) {
      CommonHandlers.CommonErrorHandler(CartError, dispatch, navigation);
    } else if (ConfigCartError) {
      CommonHandlers.CommonErrorHandler(ConfigCartError, dispatch, navigation);
    }
  }, [error, CartError, ConfigCartError]);

  const addCartNotifaction = value => {
    setproductAddedFlag(productAddedFlag => value);
  };

  const [navigated, setNavigated] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setNavigated(!navigated);
      if (cartId.cart_id == '') {
        GetUsercartId();
      }
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    setcardId(id);
    productInfoFunc({variables: {cardId: id}});
  }, [id]);

  const updateTab = type => {
    setProductDetailType(type);
  };

  //#region For Fast Check Out

  function InitFastCheckout() {
    navigation.navigate('CartStack');
  }
  //#endregion

  //#region  when Product added to Cart Successfull
  const [canUndoSKU, setCanUndoSKU] = useState('');
  const [CanUndoitemID, setCanUndoitemID] = useState('');
  useEffect(() => {
    console.log('undo update ****************************');
    console.log(canUndoSKU);
  }, [canUndoSKU]);

  useEffect(() => {
    if (addToCartData) {
      console.log(
        'addToCartData ----->',
        addToCartData.addProductsToCart.cart.items,
      );
      setItemInStorage('CartCacheStatus_isUpdated', '0');
      setItemInStorage(
        'CartCacheStatus_expTime',
        Helper.addHourstoSystemDate(5).toString(),
      );

      setCanAddtocartClicked(true);

      if (!isFastCheckout) {
        if (addToCartData.addProductsToCart.user_errors.length > 0) {
          Helper.ShowAlert(
            addToCartData.addProductsToCart.user_errors[0].message,
          );
        } else {
          const newcartId =
            typeof cartID.cart_id === 'undefined' ? cartID : cartID.cart_id;
          isHighdimension({
            variables: {cart_id: newcartId},
          });

          console.log('highdimensionData ---->>', highdimensionData);

          var ind = addToCartData.addProductsToCart.cart.items.findIndex(
            el => el.product.sku === canUndoSKU,
          );
          setCanUndoitemID(addToCartData.addProductsToCart.cart.items[ind].id);

          setproductAddedFlag(true);
          dispatch(CartItemCounterAction(true));
        }
      }
    }
  }, [addToCartData]);

  useEffect(() => {
    if (configuredAddToCartData) {
      setItemInStorage('CartCacheStatus_isUpdated', '0');
      setItemInStorage(
        'CartCacheStatus_expTime',
        Helper.addHourstoSystemDate(5).toString(),
      );

      setCanAddtocartClicked(true);

      if (!isFastCheckout) {
        if (configuredAddToCartData.addProductsToCart.user_errors.length > 0) {
          Helper.ShowAlert(
            configuredAddToCartData.addProductsToCart.user_errors[0].message,
          );
        } else {
          var ind =
            configuredAddToCartData.addProductsToCart.cart.items.findIndex(
              el => el.product.sku === canUndoSKU,
            );
          setCanUndoitemID(
            configuredAddToCartData.addProductsToCart.cart.items[ind].id,
          );

          setproductAddedFlag(true);
          dispatch(CartItemCounterAction(true));
        }
      }
    }
  }, [configuredAddToCartData]);

  //#endregion

  // // added by Frodriguez - Financiación Creditivoo / Cashea
  // // Lógica para actualizar el "Inicial" y las cuotas para Creditivoo
  // useEffect(() => {
  //   const product = data?.products?.items[0];
  //   if (product) {
  //     const price = product.price_range.minimum_price.final_price.value;
  //     const downPayment = price * initialPercentage; // Calculamos el inicial de Creditivoo
  //     const installment = (price - downPayment) / 4;
  //     setFinancingDetails({downPayment, installment});
  //   }
  // }, [data, initialPercentage]); // Este effect se activa cuando cambia el porcentaje de Creditivoo

  // // Lógica para actualizar el "Inicial" y las cuotas para Cashea
  // useEffect(() => {
  //   const product = data?.products?.items[0];
  //   if (product) {
  //     const price = product.price_range.minimum_price.final_price.value;
  //     const downPayment = price * initialPercentageCashea; // Calculamos el inicial de Cashea
  //     const installment = (price - downPayment) / 4;
  //     setFinancingDetails({downPayment, installment});
  //   }
  // }, [data, initialPercentageCashea]); // Este effect se activa cuando cambia el porcentaje de Cashea
  // // end Frodriguez

  //added by Frodriguez - Financiación Creditivoo / Cashea
  // Lógica para actualizar el "Inicial" y las cuotas para Creditivoo o Cashea
  useEffect(() => {
    const product = data?.products?.items[0];
    if (product) {
      const price = product.price_range.minimum_price.final_price.value;
      const percentage = isCreditivooSelected
        ? initialPercentage
        : initialPercentageCashea;
      const downPayment = price * percentage;
      const installment = (price - downPayment) / 4;
      setFinancingDetails({downPayment, installment});
    }
  }, [data, initialPercentage, initialPercentageCashea, isCreditivooSelected]);
  //end Frodriguez

  useEffect(() => {
    // Get Data of  productDetailInfo
    if (data) {
      if (data.products.items.length > 0) {
        AnalyticsEvent(TrackEvents.product_detail, {
          userid: '',
          product_id: cardId,
        });

        const params = {
          CURRENCY: 'USD',
          CONTENT_TYPE: 'product_details',
          Content: JSON.stringify({
            item_brand: '',
            item_id: cardId,
            item_name: data.products.items[0].name,
            item_category: '',
          }),
        };
        AppEventsLogger.logEvent(
          AppEventsLogger.AppEvents.ViewedContent,
          params,
        );

        if (data.products.items[0].__typename == 'ConfigurableProduct') {
          setProductVariantsSelection(data.products.items[0].variants[0]);
          setGalleryUpdate(
            data.products.items[0].variants[0].product.media_gallery,
          );
        } else {
          setGalleryUpdate(data.products.items[0].media_gallery);
        }
      }
    }
  }, [data]);

  const displayHighdimensionAlert = (
    title: string,
    msg: string | undefined,
    whatsappMsg: string | undefined,
    supportCntcNo: string | undefined,
  ) => {
    Alert.alert('', msg, [
      {
        text: 'Continuar',
        onPress: () => {
          console.log('OK Pressed');
          //Linking.openURL('whatsapp://app');
          sendWhatsAppMessage(
            `https://wa.me/${supportCntcNo}?text=${whatsappMsg}`,
          );
        },
      },
      {
        text: 'Cancelar',
        onPress: () => {
          console.log('Cancel Pressed');
        },
      },
    ]);
  };

  useEffect(() => {
    if (highdimensionData) {
      console.log(
        'inside useeffect of highdimensionData ---->>',
        highdimensionData?.highdimension[0],
      );
      console.log('product id ---->>', data.products.items[0].id);
      if (highdimensionData?.highdimension[0]?.products?.length > 0) {
        {
          highdimensionData?.highdimension[0]?.products.map(product =>
            product.product_id === data.products.items[0].id.toString()
              ? displayHighdimensionAlert(
                  'IVOO',
                  highdimensionData?.highdimension[0]?.products[0]
                    ?.default_popmsg,
                  highdimensionData?.highdimension[0]?.products[0]?.wa_popmsg,
                  highdimensionData?.highdimension[0]?.products[0]
                    ?.support_contact,
                )
              : console.log('different id'),
          );
        }

        //let whatsappMsg = `${highdimensionData?.highdimension[0]?.products[0]?.wa_popmsg}`;
      }
    }
  }, [highdimensionData]);

  const sendWhatsAppMessage = link => {
    Linking.openURL(link);
  };

  const addExtraAccessItem = option => {
    const newcartId =
      typeof cartID.cart_id === 'undefined' ? cartID : cartID.cart_id;

    setCanAddtocartClicked(true);
    setcardId(option.sku);

    setTimeout(() => {
      if (canAddtocartClicked) {
        setCanAddtocartClicked(false);
        setCanUndoSKU(option.sku);

        callAddToCart({
          variables: {cartId: newcartId, quantity: 1.0, sku: option.sku},
        });
      }
    }, 500);
  };

  const addToCart = async () => {
    setCanAddtocartClicked(true);
    setIsfastCheckout(false);

    await handleFinancedPay();

    setTimeout(() => {
      if (canAddtocartClicked) {
        setCanAddtocartClicked(false);

        callCartAPI();
      }
    }, 500);
  };

  function callCartAPI() {
    if (data) {
      const newcartId =
        typeof cartID.cart_id === 'undefined' ? cartID : cartID.cart_id;

      if (data.products.items[0].__typename == 'ConfigurableProduct') {
        let newSku = ProductVariantsSelection.product.sku;

        AnalyticsAddToCartEvent(data, newSku, global_data.email);

        setCanUndoSKU(newSku);

        callConfiguredAddToCart({
          variables: {
            cartId: newcartId,
            quantity: 1.0,
            parent_sku: cardId,
            sku: newSku,
          },
        });
      } else {
        AnalyticsAddToCartEvent(
          data,
          data.products.items[0].sku,
          global_data.email,
        );

        setCanUndoSKU(cardId);

        callAddToCart({
          variables: {cartId: newcartId, quantity: 1.0, sku: cardId},
        });
      }
    }
  }

  useEffect(() => {
    if (userCartIdData) {
      setcartID(userCartIdData.customerCart.id);
      dispatch(cartAction(userCartIdData.customerCart.id));
    }
  }, [userCartIdData]);

  //added by Frodriguez
  const isDark = appTheme.type === 'dark';

  const financeUI = {
    cardBg: isDark ? '#4e4d4d' : '#FFFFFF',
    cardBorder: isDark ? '#000000' : '#E6E6E6',
    text: isDark ? '#FFFFFF' : '#111111',
    hr: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.12)',
    pillBg: isDark ? '#0606066f' : '#F2F2F2',
    pillBorderCredit: isDark ? '#21a72877' : '#2E7D32',
    pillBorderCashea: isDark ? '#fdfa3d' : '#E0C700',
    activeCreditBg: isDark ? '#39a73f9e' : colorResource.Green,
    activeCasheaBg: isDark ? '#878822' : '#F5E200',
    activeTextOnLight: '#FFFFFF',
    casheaTextOnLight: '#111111',
  };

  const switchUI = {
    containerBg: isDark ? '#4c4c4c' : '#F2F2F2',
    containerBorder: isDark ? '#000000' : '#E6E6E6',
    tabActiveBg: isDark ? '#9e9e9e' : '#FFFFFF',
    tabInactiveBg: 'transparent',
    textActive: isDark ? '#FFFFFF' : '#111111',
    textInactive: isDark ? '#EDEDED' : '#666666',
  };

  // const renderPaymentMethodSwitch = () => (
  //   <View style={styles.switchContainer}>
  //     {/* Opción "De contado" */}
  //     {!isAcuotasSelected && (
  //       <TouchableOpacity
  //         style={[
  //           styles.switchOption,
  //           !isAcuotasSelected && styles.switchOptionActive,
  //         ]}
  //         onPress={() => {
  //           setIsAcuotasSelected(false); // Selección "De contado"
  //           setIsCreditivooSelected(true); // Al seleccionar "De contado", volvemos a Creditivoo por defecto
  //         }}
  //         disabled={isAcuotasSelected} // Deshabilitar si ya está en "A crédito"
  //       >
  //         <Text
  //           style={[
  //             styles.switchText,
  //             !isAcuotasSelected && styles.switchTextActive,
  //           ]}>
  //           De contado
  //         </Text>
  //       </TouchableOpacity>
  //     )}

  //     {/* Opción "A crédito" */}
  //     <TouchableOpacity
  //       style={[
  //         styles.switchOption,
  //         isAcuotasSelected && styles.switchOptionActive,
  //       ]}
  //       onPress={() => {
  //         setIsAcuotasSelected(true); // Selección "A crédito"
  //         setIsCreditivooSelected(true); // Por defecto seleccionamos Creditivoo
  //         setInitialPercentage(DEFAULT_CREDITIVOO_PERC);
  //         setInitialPercentageCashea(DEFAULT_CASHEA_PERC);
  //       }}
  //       disabled={isAcuotasSelected} // Deshabilitar si ya está en "De contado"
  //     >
  //       <View style={styles.iconContainer}>
  //         <ProgressiveImage
  //           source={ImageResource.ic_isotipo_green} // Icono de Creditivoo
  //           style={styles.icon}
  //           resizeMode="contain"
  //         />
  //         <ProgressiveImage
  //           source={ImageResource.ic_cashea_yellow} // Icono de Cashea
  //           style={styles.icon}
  //           resizeMode="contain"
  //         />
  //       </View>
  //       <Text
  //         style={[
  //           styles.switchText,
  //           isAcuotasSelected && styles.switchTextActive,
  //         ]}>
  //         A cuotas
  //       </Text>
  //     </TouchableOpacity>
  //   </View>
  // );

  // const renderCreditivooCasheaSwitch = () => (
  //   <View style={styles.switchContainer}>
  //     {/* Creditivoo */}
  //     <TouchableOpacity
  //       style={[
  //         styles.switchOption,
  //         isCreditivooSelected && styles.switchOptionActive,
  //       ]}
  //       onPress={() => {
  //         setIsCreditivooSelected(true);
  //         setInitialPercentage(DEFAULT_CREDITIVOO_PERC);
  //       }}>
  //       <ProgressiveImage
  //         source={ImageResource.ic_isotipo_green}
  //         style={styles.icon}
  //         resizeMode="contain"
  //       />
  //       <Text
  //         style={[
  //           styles.switchText,
  //           isCreditivooSelected && styles.switchTextActive,
  //         ]}>
  //         Creditivoo
  //       </Text>
  //     </TouchableOpacity>

  //     {/* Cashea */}
  //     <TouchableOpacity
  //       style={[
  //         styles.switchOption,
  //         !isCreditivooSelected && styles.switchOptionActive,
  //       ]}
  //       onPress={() => {
  //         setIsCreditivooSelected(false);
  //         setInitialPercentageCashea(DEFAULT_CASHEA_PERC);
  //       }}>
  //       <ProgressiveImage
  //         source={ImageResource.ic_cashea_yellow}
  //         style={styles.icon}
  //         resizeMode="contain"
  //       />
  //       <Text
  //         style={[
  //           styles.switchText,
  //           !isCreditivooSelected && styles.switchTextActive,
  //         ]}>
  //         Cashea
  //       </Text>
  //     </TouchableOpacity>
  //   </View>
  // );

  const renderPaymentMethodSwitch = () => (
    <View
      style={[
        styles.switchContainer,
        {
          backgroundColor: switchUI.containerBg,
          borderColor: switchUI.containerBorder,
        },
      ]}>
      {/* Opción "De contado" */}
      {!isAcuotasSelected && (
        <TouchableOpacity
          style={[
            styles.switchOption,
            {
              backgroundColor: !isAcuotasSelected
                ? switchUI.tabActiveBg
                : switchUI.tabInactiveBg,
            },
          ]}
          onPress={() => {
            setIsAcuotasSelected(false);
            setIsCreditivooSelected(true);
          }}
          disabled={isAcuotasSelected}>
          <Text
            style={[
              styles.switchText,
              {
                color: !isAcuotasSelected
                  ? switchUI.textActive
                  : switchUI.textInactive,
              },
            ]}>
            De contado
          </Text>
        </TouchableOpacity>
      )}

      {/* Opción "A cuotas" */}
      <TouchableOpacity
        style={[
          styles.switchOption,
          {
            backgroundColor: isAcuotasSelected
              ? switchUI.tabActiveBg
              : switchUI.tabInactiveBg,
          },
        ]}
        onPress={() => {
          setIsAcuotasSelected(true);
          setIsCreditivooSelected(true);
          setInitialPercentage(DEFAULT_CREDITIVOO_PERC);
          setInitialPercentageCashea(DEFAULT_CASHEA_PERC);
        }}
        disabled={isAcuotasSelected}>
        <View style={styles.iconContainer}>
          <ProgressiveImage
            source={ImageResource.ic_isotipo_green}
            style={styles.icon}
            resizeMode="contain"
          />
          <ProgressiveImage
            source={ImageResource.ic_cashea_yellow}
            style={styles.icon}
            resizeMode="contain"
          />
        </View>

        <Text
          style={[
            styles.switchText,
            {
              color: isAcuotasSelected
                ? switchUI.textActive
                : switchUI.textInactive,
            },
          ]}>
          A cuotas
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderCreditivooCasheaSwitch = () => (
    <View
      style={[
        styles.switchContainer,
        {
          backgroundColor: switchUI.containerBg,
          borderColor: switchUI.containerBorder,
        },
      ]}>
      {/* Creditivoo */}
      <TouchableOpacity
        style={[
          styles.switchOption,
          {
            backgroundColor: isCreditivooSelected
              ? switchUI.tabActiveBg
              : switchUI.tabInactiveBg,
          },
        ]}
        onPress={() => {
          setIsCreditivooSelected(true);
          setInitialPercentage(DEFAULT_CREDITIVOO_PERC);
        }}>
        <ProgressiveImage
          source={ImageResource.ic_isotipo_green}
          style={styles.icon}
          resizeMode="contain"
        />
        <Text
          style={[
            styles.switchText,
            {
              color: isCreditivooSelected
                ? switchUI.textActive
                : switchUI.textInactive,
            },
          ]}>
          Creditivoo
        </Text>
      </TouchableOpacity>

      {/* Cashea */}
      <TouchableOpacity
        style={[
          styles.switchOption,
          {
            backgroundColor: !isCreditivooSelected
              ? switchUI.tabActiveBg
              : switchUI.tabInactiveBg,
          },
        ]}
        onPress={() => {
          setIsCreditivooSelected(false);
          setInitialPercentageCashea(DEFAULT_CASHEA_PERC);
        }}>
        <ProgressiveImage
          source={ImageResource.ic_cashea_yellow}
          style={styles.icon}
          resizeMode="contain"
        />
        <Text
          style={[
            styles.switchText,
            {
              color: !isCreditivooSelected
                ? switchUI.textActive
                : switchUI.textInactive,
            },
          ]}>
          Cashea
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderPaymentDetails = () => (
    <View style={{paddingHorizontal: 16, marginTop: 15}}>
      {/* Si "A crédito" está seleccionado, mostramos las opciones de Creditivoo y Cashea */}
      {isAcuotasSelected
        ? renderCreditivooCasheaSwitch()
        : renderPaymentMethodSwitch()}
      {/* Mostrar las secciones dependiendo de la selección de Creditivoo o Cashea */}
      {isAcuotasSelected && isCreditivooSelected && renderCreditivooSection()}{' '}
      {/* Creditivoo */}
      {isAcuotasSelected && !isCreditivooSelected && renderCasheaSection()}{' '}
      {/* Cashea */}
    </View>
  );

  // // Sección de Creditivoo
  // const renderCreditivooSection = () => (
  //   <View style={styles.creditivooMainContainer}>
  //     <TouchableOpacity
  //       style={styles.closeButton}
  //       onPress={() => {
  //         setIsCreditivooSelected(true);
  //         setIsAcuotasSelected(false);
  //       }}>
  //       <Text style={styles.closeButtonText}>X</Text>
  //     </TouchableOpacity>
  //     <View style={styles.selectorRow}>
  //       {[0.4, 0.5, 0.6].map(perc => (
  //         <TouchableOpacity
  //           key={perc}
  //           onPress={() => setInitialPercentage(perc)}
  //           style={[
  //             styles.percentageBtn,
  //             initialPercentage === perc && styles.percentageBtnActive,
  //           ]}>
  //           <Text
  //             style={[
  //               styles.percentageText,
  //               initialPercentage === perc && styles.percentageTextActive,
  //             ]}>
  //             {Math.round(perc * 100)}%
  //           </Text>
  //         </TouchableOpacity>
  //       ))}
  //     </View>

  //     <View style={styles.creditivooCartBadge}>
  //       <View style={styles.hr} />
  //       <Text style={styles.creditivooCuotas}>
  //         Inicial: {Helper.currencyFormat(financingDetails.downPayment)}
  //       </Text>
  //       <Text style={styles.creditivooCuotas}>
  //         + 4 cuotas de: {Helper.currencyFormat(financingDetails.installment)}
  //       </Text>
  //     </View>
  //   </View>
  // );

  // // Sección de Cashea
  // const renderCasheaSection = () => (
  //   <View style={styles.creditivooMainContainer}>
  //     <TouchableOpacity
  //       style={styles.closeButton}
  //       onPress={() => {
  //         setIsCreditivooSelected(true);
  //         setIsAcuotasSelected(false);
  //       }}>
  //       <Text style={styles.closeButtonText}>X</Text>
  //     </TouchableOpacity>
  //     <View style={styles.selectorRow}>
  //       {[0.4, 0.5, 0.6].map(perc => (
  //         <TouchableOpacity
  //           key={perc}
  //           onPress={() => setInitialPercentageCashea(perc)}
  //           style={[
  //             styles.percentageBtnCashea,
  //             initialPercentageCashea === perc &&
  //               styles.percentageBtnActiveCashea,
  //           ]}>
  //           <Text
  //             style={[
  //               styles.percentageText,
  //               initialPercentageCashea === perc &&
  //                 styles.percentageTextActiveCashea,
  //             ]}>
  //             {Math.round(perc * 100)}%
  //           </Text>
  //         </TouchableOpacity>
  //       ))}
  //     </View>

  //     <View style={styles.creditivooCartBadge}>
  //       <View style={styles.hr} />
  //       <Text style={styles.creditivooCuotas}>
  //         Inicial: {Helper.currencyFormat(financingDetails.downPayment)}
  //       </Text>
  //       <Text style={styles.creditivooCuotas}>
  //         + 4 cuotas de: {Helper.currencyFormat(financingDetails.installment)}
  //       </Text>
  //     </View>
  //   </View>
  // );

  const renderCreditivooSection = () => (
    <View
      style={[
        styles.creditivooMainContainer,
        {
          backgroundColor: financeUI.cardBg,
          borderColor: financeUI.cardBorder,
        },
      ]}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => {
          setIsCreditivooSelected(true);
          setIsAcuotasSelected(false);
        }}>
        <Text style={[styles.closeButtonText, {color: financeUI.text}]}>X</Text>
      </TouchableOpacity>

      <View style={styles.selectorRow}>
        {[0.4, 0.5, 0.6].map(perc => {
          const active = initialPercentage === perc;
          return (
            <TouchableOpacity
              key={perc}
              onPress={() => setInitialPercentage(perc)}
              style={[
                styles.percentageBtn,
                {
                  backgroundColor: financeUI.pillBg,
                  borderColor: financeUI.pillBorderCredit,
                },
                active && {
                  backgroundColor: financeUI.activeCreditBg,
                  borderColor: '#2E7D32',
                },
              ]}>
              <Text
                style={[
                  styles.percentageText,
                  {
                    color: active
                      ? isDark
                        ? '#FFFFFF'
                        : financeUI.casheaTextOnLight
                      : financeUI.text,
                    fontWeight: active ? 'bold' : '600',
                  },
                ]}>
                {Math.round(perc * 100)}%
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.creditivooCartBadge}>
        <View style={[styles.hr, {borderBottomColor: financeUI.hr}]} />
        <Text style={[styles.creditivooCuotas, {color: financeUI.text}]}>
          Inicial: {Helper.currencyFormat(financingDetails.downPayment)}
        </Text>
        <Text style={[styles.creditivooCuotas, {color: financeUI.text}]}>
          + 4 cuotas de: {Helper.currencyFormat(financingDetails.installment)}
        </Text>
      </View>
    </View>
  );

  // Sección de Cashea
  const renderCasheaSection = () => (
    <View
      style={[
        styles.creditivooMainContainer,
        {
          backgroundColor: financeUI.cardBg,
          borderColor: financeUI.cardBorder,
        },
      ]}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => {
          setIsCreditivooSelected(true);
          setIsAcuotasSelected(false);
        }}>
        <Text style={[styles.closeButtonText, {color: financeUI.text}]}>X</Text>
      </TouchableOpacity>

      <View style={styles.selectorRow}>
        {[0.4, 0.5, 0.6].map(perc => {
          const active = initialPercentageCashea === perc;
          return (
            <TouchableOpacity
              key={perc}
              onPress={() => setInitialPercentageCashea(perc)}
              style={[
                styles.percentageBtnCashea,
                {
                  backgroundColor: financeUI.pillBg,
                  borderColor: financeUI.pillBorderCashea,
                },
                active && {
                  backgroundColor: financeUI.activeCasheaBg,
                  borderColor: financeUI.pillBorderCashea,
                },
              ]}>
              <Text
                style={[
                  styles.percentageText,
                  {
                    color: active
                      ? isDark
                        ? '#FFFFFF'
                        : financeUI.casheaTextOnLight
                      : financeUI.text,
                    fontWeight: active ? 'bold' : '600',
                  },
                ]}>
                {Math.round(perc * 100)}%
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.creditivooCartBadge}>
        <View style={[styles.hr, {borderBottomColor: financeUI.hr}]} />
        <Text style={[styles.creditivooCuotas, {color: financeUI.text}]}>
          Inicial: {Helper.currencyFormat(financingDetails.downPayment)}
        </Text>
        <Text style={[styles.creditivooCuotas, {color: financeUI.text}]}>
          + 4 cuotas de: {Helper.currencyFormat(financingDetails.installment)}
        </Text>
      </View>
    </View>
  );

  //end Frodriguez

  //By JAMP 14-01-2026 Modificada buscar en creditivoo-release1 para obtener el original
  const renderPrice = item => {
    const finalPrice =
      item?.price_range?.minimum_price?.final_price?.value || 0;
    const regularPrice =
      item?.price_range?.minimum_price?.regular_price?.value || 0;
    const isFinanciableItem = isFinanciable(item);
    const financing = getFinancingData(finalPrice);

    return (
      <View style={{flex: 1}}>
        <View style={{flexDirection: 'row'}}>
          {regularPrice !== finalPrice && (
            <Text
              style={[
                styles.ExtraAccess_Text_price_Regular,
                {
                  color:
                    appTheme.type === 'dark'
                      ? colorResource.white
                      : colorResource.disc_rate_clr,
                  marginRight: 8,
                },
              ]}>
              {Helper.currencyFormat(regularPrice)}
            </Text>
          )}
          <Text
            style={[
              styles.ExtraAccess_Text_price_Final,
              {
                color: colorResource.pink_product_price,
                textAlign: 'center',
              },
            ]}>
            {Helper.currencyFormat(finalPrice)}
          </Text>
        </View>
      </View>
    );
  };

  //By JAMP 14-01-2026

  const renderPriceExtraAccess = item => {
    if (
      item.price_range.minimum_price.regular_price.value != 0 &&
      item.price_range.minimum_price.regular_price.value !=
        item.price_range.minimum_price.final_price.value
    ) {
      return (
        <View style={{flexDirection: 'row'}}>
          <Text
            style={[
              commonStyle.h5,
              styles.ExtraAccess_Text_price_Regular,
              {
                color:
                  appTheme.type === 'dark'
                    ? colorResource.white
                    : colorResource.disc_rate_clr,
              },
            ]}>
            {Helper.currencyFormat(
              item.price_range.minimum_price.regular_price.value,
            )}
          </Text>
          <Text
            style={[
              commonStyle.h5,
              styles.ExtraAccess_Text_price_Final,
              {
                color:
                  appTheme.type === 'dark'
                    ? colorResource.white
                    : colorResource.pink_product_price,
              },
            ]}>
            &nbsp;&nbsp;
            {Helper.currencyFormat(
              item.price_range.minimum_price.final_price.value,
            )}
          </Text>
        </View>
      );
    } else {
      return (
        <Text
          style={[commonStyle.h5, {color: appTheme.text, fontWeight: 'bold'}]}>
          {Helper.currencyFormat(
            item.price_range.minimum_price.regular_price.value,
          )}
        </Text>
      );
    }
  };

  const processHTML = () => {
    let htm = '<div  style="color:' + appTheme.text + ';">';
    htm =
      htm +
      data.products.items[0].short_description.html +
      data.products.items[0].description.html;

    htm = htm + '</div>';
    return <HTML source={{html: htm}} />;
  };

  const renderHTML = html => {
    if (html) {
      let htm = '<div  style="color:' + appTheme.text + ';">';
      htm = htm + html;
      htm = htm + '</div>';
      return <HTML source={{html: htm}} />;
    }
    return;
  };

  const renderSimilarItem = ({item, index}) => {
    return (
      <>
        <TouchableOpacity
          style={[
            commonStyle.marginRight_10,
            index === 0
              ? commonStyle.margin_left_16
              : commonStyle.margin_left_0,
          ]}
          onPress={() => {
            Helper.HandleVibration();
            setIsLoadingSkelton(true);
            setcardId(item.sku);
            productInfoFunc({variables: {cardId: item.sku}});
          }}>
          <View style={[commonStyle.productCardMainContainer]}>
            <View style={styles.renderSimilaritemSubcontainer}>
              {item.thumbnail != undefined && (
                <View>
                  <ProgressiveImage
                    source={{uri: item.thumbnail.url + Helper.gridImageSize}}
                    style={{width: width / 2 - 35, height: width / 2 - 20}}
                    resizeMode="stretch"
                  />
                </View>
              )}
              <WishlistButton
                SKU={item.sku}
                isLoading={load => {
                  setwishitemLoad(load);
                }}
                pagetype={'other'}
                setLoginOverlay={login => {
                  setLoginOverlayVisible(login);
                }}
              />
            </View>

            <View style={[commonStyle.flexDir_Row]}>
              <View>
                <Text
                  style={[
                    commonStyle.h6,
                    styles.renderSimilarItemText,
                    {color: appTheme.text},
                  ]}>
                  {item.name}
                </Text>
                <Text
                  style={[
                    commonStyle.h6,
                    commonStyle.fontBold,
                    styles.renderSimilarItemPrice,
                    {color: appTheme.text},
                  ]}>
                  {Helper.currencyFormat(
                    item.price_range.minimum_price.regular_price.value,
                  )}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </>
    );
  };

  const isSelectedOption = option => {
    let data = ProductVariantsSelection.attributes;
    let ret: boolean = false;
    if (data) {
      if (data.length > 0) {
        data.forEach(element => {
          if (element.value_index == option.value_index) {
            ret = true;
          }
        });
      }
    }
    return ret;
  };
  const selectVariants = (option, value) => {
    let variant = data.products.items[0].variants;
    let attributes = ProductVariantsSelection.attributes;
    var arrMatch = [value.value_index];
    if (attributes.length > 0) {
      attributes.forEach(element => {
        if (element.code != option) {
          arrMatch.push(element.value_index);
        }
      });
    }
    if (variant.length > 0) {
      variant.forEach(elements => {
        let arrTemp = [];
        elements.attributes.forEach(item => {
          arrTemp.push(item.value_index);
        });
        if (compareArrays(arrMatch, arrTemp)) {
          setProductVariantsSelection(elements);
          setGalleryUpdate(elements.product.media_gallery);
        }
      });
    }
  };
  function compareArrays(arr1, arr2) {
    if (arr1.length != arr2.length) {
      return false;
    } else {
      let result = false;
      arr1 = arr1.sort();
      arr2 = arr2.sort();
      for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] != arr2[i]) {
          return false;
        } else {
          result = true;
        }
      }
      return result;
    }
  }
  const [isLoadingSkelton, setIsLoadingSkelton] = useState(true);
  useEffect(() => {
    if (!(cartLoading || loading)) {
      setTimeout(() => {
        setIsLoadingSkelton(false);
      }, Helper.skeletonTimeout);
    }
  }, [cartLoading, loading]);
  const scale = new Animated.Value(1);

  function getDisplayGallery(mediaGallery: any) {
    var data: any = mediaGallery.filter(i => i.disabled === false);
    data.sort((a, b) => a.position - b.position);
    return data;
  }

  const onPinchEvent = Animated.event(
    [
      {
        nativeEvent: {scale: scale},
      },
    ],
    {
      useNativeDriver: true,
    },
  );

  const onPinchStateChange = event => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  };

  //By JAMP 14-01-2026
  const isFinanciable = productData => {
    if (!productData?.additional_attributes) return false;
    const attr = productData.additional_attributes.find(
      a => a.code === 'financiable' || a.code === 'Financiable',
    );
    const val = attr?.value?.toString().toLowerCase();

    return val === '1' || val === 'si' || val === 'true';
  };

  const getFinancingData = price => {
    const numPrice = Number(price) || 0;
    const downPayment = numPrice * 0.4;
    const remaining = numPrice - downPayment;
    const installment = remaining / 4;
    return {downPayment, installment};
  };

  const handleFinancedPay = async () => {
    const product = data?.products?.items[0];
    if (!product) return;

    const attr = product?.additional_attributes?.find(
      a => a.code === 'financiable' || a.code === 'Financiable',
    );

    // Alert.alert(''+ attr?.value);

    const isFinanciableValue = attr?.value === '1' || attr?.value === 'si';

    const price = product.price_range.minimum_price.final_price.value;

    const financing = getFinancingData(price);
    const context = {
      amountToFinance: price,
      downPayment: financing.downPayment,
      installmentAmount: financing.installment,
      productId: product.sku,
      isFinanciable: attr?.value,
      selectedPercentage: initialPercentage,
    };
    await AsyncStorage.setItem('@creditivoo_context', JSON.stringify(context));
    //const confirm = await AsyncStorage.getItem('@creditivoo_context');
    //Alert.alert(''+ JSON.stringify(context.isFinanciable));
    // navigation.navigate('PlanSelectionScreen', { totalAmount: price });
  };

  //By JAMP 14-01-2026

  const _renderItem = ({item, index}) => {
    const lowImg: String = item.url + Helper.listImageSize;
    const highImg: String = item.url + Helper.cardImageSize;
    return (
      <PinchGestureHandler
        onGestureEvent={onPinchEvent}
        onHandlerStateChange={onPinchStateChange}>
        <View style={styles.lhContainer}>
          <LowResHighResImage
            lowResUri={lowImg}
            highResUri={highImg}
            style={styles.lhImage}
          />
        </View>
        {/*<Animated.Image*/}
        {/*  source={{uri: item.url + Helper.listImageSize}}*/}
        {/*  resizeMode="contain"*/}
        {/*  style={[*/}
        {/*    styles.image,*/}
        {/*    activeSlide == index ? {transform: [{scale: scale}]} : {},*/}
        {/*  ]}*/}
        {/*/>*/}
      </PinchGestureHandler>
    );
  };
  return (
    <>
      {isLoadingSkelton && (
        <View
          style={{
            height: height,
            zIndex: 9999,
            position: 'absolute',
            top: 0,
            backgroundColor: appTheme.background,
          }}>
          <ProductDetailsSkelton />
        </View>
      )}
      <View style={{position: 'absolute', zIndex: 1, bottom: 0}}>
        {productAddedFlag && productAddedFlag == true ? (
          <ProductAddedOverlay
            CanUndoitemID={CanUndoitemID}
            addCartNotifaction={addCartNotifaction}
          />
        ) : null}
      </View>
      <View
        style={[commonStyle.flex_1, {backgroundColor: appTheme.background}]}>
        {data && data.products.items.length > 0 && (
          <View
            style={[
              styles.productHeader,
              {paddingTop: Platform.OS === 'ios' ? 30 : 25},
            ]}>
            <HeaderProductDetails
              url_key={id}
              sku={data.products.items[0].sku}
              cardId={cardId}
              isWishlisted={wishListHelper.IsFavItemExist(
                favitems,
                data.products.items[0].sku,
              )}
              isLoading={load => {
                setwishitemLoad(load);
              }}
              isDark={appTheme.type === 'dark'}
              setLoginOverlay={login => {
                setLoginOverlayVisible(login);
              }}
            />
          </View>
        )}

        <ScrollView showsVerticalScrollIndicator={false}>
          {data && data.products.items.length == 0 ? (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                height: height,
              }}>
              <Text
                style={[
                  commonStyle.h4,
                  commonStyle.fontBold,
                  commonStyle.padding_16,
                  styles.noProductFound,
                  {color: appTheme.text},
                ]}>
                {translate('products.lbl_no_product_found')}
              </Text>
            </View>
          ) : (
            <>
              <View style={[styles.whitebackground]}>
                {data && data.products.items.length > 0 && (
                  <View
                    style={[
                      styles.productImageSlider,
                      {paddingTop: Platform.OS === 'ios' ? 40 : null},
                    ]}>
                    <Carousel
                      ref={_carousel}
                      data={getDisplayGallery(galleryUpdate)}
                      renderItem={_renderItem}
                      sliderWidth={width}
                      itemWidth={width}
                      inactiveSlideScale={1}
                      onSnapToItem={index => {
                        Helper.HandleVibration();
                        setActiveSlide(index);
                      }}
                    />
                    <Pagination
                      carouselRef={_carousel}
                      dotsLength={getDisplayGallery(galleryUpdate).length}
                      activeDotIndex={activeSlide}
                      dotStyle={styles.productSliderPagination}
                      inactiveDotStyle={{
                        backgroundColor: colorResource.inactiveDots,
                      }}
                      inactiveDotScale={1}
                      tappableDots={true}
                      containerStyle={styles.paginationcarousel}
                      dotContainerStyle={{marginRight: 0}}
                    />
                  </View>
                )}
              </View>

              <View
                style={[
                  styles.productDetailsContainer,
                  {backgroundColor: appTheme.background},
                ]}>
                <View
                  style={[commonStyle.paddingHorizontal_16, {marginTop: 16}]}>
                  <Text
                    style={[
                      commonStyle.h3,
                      commonStyle.fontBold,
                      styles.productTitle,
                      {color: appTheme.text},
                    ]}>
                    {data && data.products.items[0].name}
                  </Text>
                  <View style={{paddingHorizontal: 16, marginTop: 15}}>
                    {renderPaymentDetails()}{' '}
                    {/* Llamamos la función que gestiona el switch entre De contado / A crédito y Creditivoo / Cashea */}
                  </View>

                  <View
                    style={[
                      commonStyle.marginBottom_30,
                      styles.productDetailNavContainer,
                      {paddingTop: 16},
                    ]}>
                    <View style={[commonStyle.flex_4pt]}>
                      <TouchableHighlight
                        underlayColor={colorResource.transparent}
                        style={[
                          commonStyle.flex_4pt,
                          commonStyle.productDetailNavContainer,
                        ]}
                        onPress={() => {
                          Helper.HandleVibration();
                          updateTab('Product');
                        }}>
                        <Text
                          style={[
                            styles.navTitleText,
                            {
                              padding: 0,
                              fontSize: 16,
                              color:
                                appTheme.type === 'dark'
                                  ? colorResource.disable_clr
                                  : colorResource.Gray,
                            },
                            productDetailType == 'Product' && {
                              fontWeight: '700',
                              color: colorResource.Green,
                            },
                          ]}>
                          {translate('products.lbl_desc')}
                        </Text>
                      </TouchableHighlight>
                      {productDetailType == 'Product' && (
                        <View
                          style={{
                            borderBottomColor: colorResource.Green,
                            borderBottomWidth: 3,
                          }}
                        />
                      )}
                    </View>

                    <View style={[commonStyle.flex_3pt]}>
                      <TouchableHighlight
                        underlayColor={colorResource.transparent}
                        style={[commonStyle.productDetailNavContainer]}
                        onPress={() => {
                          Helper.HandleVibration();
                          updateTab('Spec');
                        }}>
                        <Text
                          style={[
                            styles.navTitleText,
                            {
                              fontSize: 16,
                              color:
                                appTheme.type === 'dark'
                                  ? colorResource.disable_clr
                                  : colorResource.Gray,
                            },
                            productDetailType == 'Spec' && {
                              fontWeight: '700',
                              color: colorResource.Green,
                            },
                          ]}>
                          {translate('products.lbl_spec')}
                        </Text>
                      </TouchableHighlight>
                      {productDetailType == 'Spec' && (
                        <View
                          style={{
                            borderBottomColor: colorResource.Green,
                            borderBottomWidth: 3,
                          }}
                        />
                      )}
                    </View>
                  </View>
                </View>

                {productDetailType == 'Product' && (
                  <>
                    <View style={commonStyle.paddingHorizontal_16}>
                      {data && (
                        <View
                          style={[
                            showMoreFlag && styles.showMr_Ls_ContentView,
                            {position: 'relative'},
                          ]}>
                          {processHTML()}
                          {showMoreFlag ? (
                            <LinearGradient
                              colors={
                                appTheme.type === 'dark'
                                  ? [
                                      'rgba(0,0,0, .1)',
                                      'rgba(0,0,0, .4)',
                                      'rgba(0,0,0, 1)',
                                    ]
                                  : [
                                      'rgba(255,255,255, .1)',
                                      'rgba(255,255,255, .4)',
                                      'rgba(255,255,255, 1)',
                                    ]
                              }
                              style={[
                                styles.linearGradientwhite,
                                styles.showMR_top,
                              ]}
                              start={{x: 0.5, y: 0}}></LinearGradient>
                          ) : null}
                        </View>
                      )}

                      {data &&
                        data.products.items[0].short_description.html != '' && (
                          <View style={styles.showMr_Ls_Container}>
                            <TouchableOpacity
                              style={[styles.showMr_Ls_Container_Sub]}
                              onPress={() => {
                                Helper.HandleVibration();
                                setShowMoreFlag(!showMoreFlag);
                              }}>
                              <Text
                                style={[
                                  commonStyle.h5,
                                  commonStyle.fontBold,
                                  styles.showMr_Ls_Text,
                                ]}>
                                {showMoreFlag
                                  ? translate('products.lbl_show_more')
                                  : translate('products.lbl_show_less')}
                              </Text>
                              <Image
                                source={
                                  showMoreFlag
                                    ? resourceImages.ic_arrow_down
                                    : resourceImages.ic_arrow_up
                                }
                                style={[{marginLeft: 7, marginTop: 8}]}
                                resizeMode="contain"
                              />
                            </TouchableOpacity>
                          </View>
                        )}
                    </View>

                    <View
                      style={[
                        styles.stockContainer,
                        commonStyle.margin_horizontal_16,
                        {backgroundColor: appTheme.InputBoxBGColor},
                      ]}>
                      {!loading && (
                        <Text
                          style={[
                            commonStyle.h5,
                            {
                              color:
                                appTheme.type === 'dark'
                                  ? colorResource.disable_clr
                                  : colorResource.Gray,
                            },
                          ]}>
                          {data &&
                          data.products.items.length > 0 &&
                          data.products.items[0].stock_status == 'IN_STOCK'
                            ? translate('products.lbl_in_stock')
                            : translate('products.lbl_out_stock')}
                        </Text>
                      )}

                      {data &&
                        data.products.items[0].stock_status == 'IN_STOCK' && (
                          <View style={styles.productDetailNavContainer}>
                            <Text
                              style={[
                                commonStyle.h5,
                                commonStyle.fontBold,
                                styles.stockNumberText,
                              ]}>
                              {data.products.items[0].only_x_left_in_stock ==
                              null
                                ? '10+'
                                : data.products.items[0].only_x_left_in_stock}
                            </Text>
                            <Text
                              style={[
                                commonStyle.h5,
                                commonStyle.fontBold,
                                {color: appTheme.text},
                              ]}>
                              {translate('products.lbl_pieces')}
                            </Text>
                          </View>
                        )}
                    </View>
                    <View style={commonStyle.paddingHorizontal_16}>
                      {
                        // Color & Size Blocks
                        data &&
                          data.products.items.length > 0 &&
                          data.products.items[0].configurable_options &&
                          data.products.items[0].configurable_options.map(
                            option => {
                              return (
                                <>
                                  <Text
                                    style={[
                                      commonStyle.h3,
                                      commonStyle.fontBold,
                                      styles.colorBlockText,
                                      {color: appTheme.text},
                                    ]}>
                                    {option.label}{' '}
                                  </Text>
                                  <ScrollView
                                    showsHorizontalScrollIndicator={false}
                                    horizontal={true}>
                                    <View style={styles.colorsview}>
                                      {option.values.map((optionValue, j) => {
                                        return (
                                          <View
                                            key={j}
                                            style={[
                                              commonStyle.marginBottom_20,
                                            ]}>
                                            {}
                                            <TouchableHighlight
                                              underlayColor={
                                                colorResource.transparent
                                              }
                                              onPress={() => {
                                                Helper.HandleVibration();
                                                selectVariants(
                                                  option.attribute_code,
                                                  optionValue,
                                                );
                                              }}>
                                              <View
                                                style={[
                                                  isSelectedOption(optionValue)
                                                    ? styles.variantsSelected
                                                    : styles.variantsUnSelected,
                                                  isSelectedOption(optionValue)
                                                    ? appTheme.type === 'dark'
                                                      ? {
                                                          backgroundColor:
                                                            colorResource.Green_03,
                                                        }
                                                      : null
                                                    : {
                                                        backgroundColor:
                                                          appTheme.InputBoxBGColor,
                                                      },
                                                ]}>
                                                <View
                                                  style={[
                                                    isSelectedOption(
                                                      optionValue,
                                                    )
                                                      ? styles.variantsSelectedChild
                                                      : styles.variantsUnSelectedChild,
                                                    isSelectedOption(
                                                      optionValue,
                                                    )
                                                      ? appTheme.type === 'dark'
                                                        ? {
                                                            backgroundColor:
                                                              '#0F4F33',
                                                          }
                                                        : null
                                                      : {
                                                          backgroundColor:
                                                            appTheme.InputBoxBGColor,
                                                        },
                                                  ]}>
                                                  {optionValue.swatch_data
                                                    .__typename ==
                                                  'ColorSwatchData' ? (
                                                    <View
                                                      style={[
                                                        styles.linearGradient,
                                                        {
                                                          backgroundColor:
                                                            optionValue
                                                              .swatch_data
                                                              .value,
                                                        },
                                                      ]}></View>
                                                  ) : (
                                                    <Text
                                                      style={{
                                                        color: appTheme.text,
                                                      }}>
                                                      {
                                                        optionValue.swatch_data
                                                          .value
                                                      }
                                                    </Text>
                                                  )}
                                                </View>
                                              </View>
                                            </TouchableHighlight>
                                            {optionValue.swatch_data
                                              .__typename ==
                                              'ColorSwatchData' && (
                                              <Text
                                                style={[
                                                  styles.txtclr,
                                                  {
                                                    color:
                                                      appTheme.type === 'dark'
                                                        ? isSelectedOption(
                                                            optionValue,
                                                          )
                                                          ? colorResource.Green
                                                          : colorResource.disable_clr
                                                        : isSelectedOption(
                                                            optionValue,
                                                          )
                                                        ? colorResource.Green
                                                        : colorResource.Gray,
                                                  },
                                                ]}>
                                                {optionValue.label}
                                              </Text>
                                            )}
                                          </View>
                                        );
                                      })}
                                    </View>
                                  </ScrollView>
                                </>
                              );
                            },
                          )
                      }
                    </View>
                    <View style={commonStyle.paddingHorizontal_16}>
                      {data &&
                        data.products.items.length > 0 &&
                        data.products.items[0].upsell_products.length > 0 && (
                          <View style={styles.ExtraAccess_SmlrProd_Container}>
                            <Text
                              style={[
                                commonStyle.h3,
                                commonStyle.fontBold,
                                styles.ExtraAccess_SmlrProd_Title,
                                {color: appTheme.text},
                              ]}>
                              {/* Extra accessories */}
                              {translate('products.lbl_extra_accessories')}
                            </Text>
                            {data.products.items[0].upsell_products.map(
                              (option, i) => {
                                return (
                                  <TouchableOpacity
                                    onPress={() => {
                                      Helper.HandleVibration();
                                      setIsLoadingSkelton(true);
                                      setcardId(option.sku);
                                      productInfoFunc({
                                        variables: {cardId: option.sku},
                                      });
                                    }}>
                                    <View
                                      key={i}
                                      style={styles.ExtraAccess_Container}>
                                      <View
                                        style={{
                                          height: 90,
                                          width: 90,
                                          backgroundColor:
                                            colorResource.transparent,
                                          borderRadius: 16,
                                          marginRight: 8,
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                        }}>
                                        <ProgressiveImage
                                          source={{
                                            uri:
                                              option.thumbnail.url +
                                              Helper.listImageSize,
                                          }}
                                          style={[
                                            commonStyle.he_wi_88,
                                            {
                                              backgroundColor:
                                                colorResource.transparent,
                                              borderRadius: 16,
                                            },
                                          ]}
                                          resizeMode="stretch"
                                        />
                                      </View>
                                      <View
                                        style={
                                          styles.ExtraAccess_TextContainer
                                        }>
                                        <Text
                                          style={[
                                            commonStyle.h6,
                                            commonStyle.fontBasics,
                                            styles.ExtraAccess_Text,
                                            {color: appTheme.text},
                                          ]}>
                                          {option.thumbnail.label}
                                        </Text>
                                        {renderPriceExtraAccess(option)}
                                      </View>
                                      <View
                                        style={[
                                          commonStyle.justifyContent_Center,
                                        ]}>
                                        <TouchableOpacity
                                          onPress={() => {
                                            Helper.HandleVibration();
                                            token
                                              ? addExtraAccessItem(option)
                                              : setLoginOverlayVisible(true);
                                          }}>
                                          <ProgressiveImage
                                            source={
                                              resourceImages.ic_buttonplus
                                            }
                                          />
                                        </TouchableOpacity>
                                      </View>
                                    </View>
                                  </TouchableOpacity>
                                );
                              },
                            )}
                          </View>
                        )}
                    </View>
                    {data &&
                      data.products.items.length > 0 &&
                      data.products.items[0].related_products && (
                        <View style={styles.ExtraAccess_SmlrProd_Container}>
                          {data.products.items[0].related_products.length >
                            0 && (
                            <Text
                              style={[
                                commonStyle.h3,
                                commonStyle.paddingHorizontal_16,
                                commonStyle.fontBold,
                                styles.ExtraAccess_SmlrProd_Title,
                                {color: appTheme.text},
                              ]}>
                              {/* Similar products */}
                              {translate('products.lbl_similar_product')}
                            </Text>
                          )}
                          <View style={[commonStyle.flex_1]}>
                            <FlatList
                              data={data.products.items[0].related_products}
                              renderItem={renderSimilarItem}
                              showsHorizontalScrollIndicator={false}
                              keyExtractor={item => item.sku}
                              extraData={selectedId}
                              horizontal={true}
                            />
                          </View>
                        </View>
                      )}
                  </>
                )}
                <View style={commonStyle.padding_16}>
                  {productDetailType == 'Spec' && (
                    <>
                      <Text
                        style={[
                          commonStyle.h3,
                          commonStyle.fontBold,
                          styles.Spec_Title_Text,
                          {color: appTheme.text},
                        ]}>
                        {/* Specification */}
                        {translate('products.lbl_specification')}
                      </Text>
                      {data &&
                        data.products.items.length > 0 &&
                        data.products.items[0].additional_attributes.map(
                          option => {
                            return (
                              <>
                                <View
                                  key={Math.random()}
                                  style={styles.Spec_Container}>
                                  <View style={[commonStyle.flex_5pt]}>
                                    <Text
                                      style={[
                                        commonStyle.h5,
                                        commonStyle.fontBold,
                                        {color: appTheme.text},
                                      ]}>
                                      {option.label}
                                    </Text>
                                  </View>
                                  <View style={[commonStyle.flex_5pt]}>
                                    <Text
                                      style={[
                                        commonStyle.h5,
                                        {
                                          color:
                                            appTheme.type === 'dark'
                                              ? colorResource.disable_clr
                                              : colorResource.Gray,
                                        },
                                      ]}>
                                      {option.value}
                                    </Text>
                                  </View>
                                </View>
                                <View style={styles.SectionLineStyles}></View>
                              </>
                            );
                          },
                        )}
                    </>
                  )}

                  {productDetailType == 'Description' &&
                    data &&
                    data.products.items.length > 0 && (
                      <>{renderHTML(data.products.items[0].description.html)}</>
                    )}
                </View>

                <CustomPBar showProgress={wishitemLoad} />
              </View>
            </>
          )}
        </ScrollView>
      </View>

      {data && data.products.items.length > 0 && (
        <View style={[{backgroundColor: appTheme.background}]}>
          <View
            style={[
              styles.Pay_Cart_Container,
              {padding: 12, alignItems: 'center'},
            ]}>
            <View style={[{flex: 4.8}]}>
              {renderPrice(data.products.items[0])}
            </View>
            <View
              style={[
                {
                  flex: 7,
                  alignSelf: 'flex-end',
                  flexDirection: 'row',
                  alignContent: 'space-between',
                },
              ]}>
              <Button
                containerStyle={[{width: '30%'}]}
                buttonStyle={[
                  commonStyle.btnStyle,
                  {
                    backgroundColor:
                      appTheme.type === 'dark'
                        ? colorResource.a696969
                        : colorResource.disable_clr,
                  },
                ]}
                titleStyle={[
                  styles.btn,
                  commonStyle.h6,
                  commonStyle.fontBold,
                  data.products.items[0].stock_status != 'IN_STOCK'
                    ? {color: colorResource.white}
                    : {color: appTheme.text},
                  width <= 375 ? {fontSize: width / 26} : null,
                ]}
                onPress={() => {
                  Helper.HandleVibration();

                  if (data.products.items[0].stock_status != 'IN_STOCK') {
                    return;
                  }
                  token ? InitFastCheckout() : setLoginOverlayVisible(true);
                }}
                title={translate('products.lbl_pay')}
              />
              <View style={{marginLeft: 8, width: '65%'}}>
                {cartConfiguredAddLoading || cartAddLoading ? (
                  <View
                    style={[
                      commonStyle.btnshwdow,
                      {
                        width: '100%',
                        height: 50,
                        borderRadius: 16,
                        backgroundColor: colorResource.Green,
                        justifyContent: 'center',
                        alignItems: 'center',
                      },
                    ]}>
                    <Image
                      source={require('../../../../assets/images/loader.gif')}
                    />
                  </View>
                ) : (
                  <CustomButton
                    title="products.lbl_add_to_cart"
                    containerStyle={[{width: '38%'}]}
                    onPress={async () => {
                      setcardId(data.products.items[0].sku);
                      Helper.HandleVibration();
                      if (data.products.items[0].stock_status != 'IN_STOCK') {
                        return;
                      }
                      token ? addToCart() : setLoginOverlayVisible(true);
                    }}
                    customTitleStyle={[
                      data.products.items[0].stock_status != 'IN_STOCK'
                        ? {color: colorResource.white}
                        : null,
                      {fontSize: 14},
                    ]}
                    customButtonStyle={[
                      data.products.items[0].stock_status == 'IN_STOCK'
                        ? commonStyle.btn_primary
                        : commonStyle.btn_disabled,
                    ]}
                  />
                )}
              </View>
            </View>
          </View>
        </View>
      )}
      {LoginOverlayvisible && (
        <View style={{width: '100%', position: 'absolute'}}>
          <LoginOverlay
            visibleView={LoginOverlayvisible}
            OnClose={() => {
              setLoginOverlayVisible(false);
            }}
            onPressEmail={() => {
              setLoginOverlayVisible(false);
              navigation.navigate(Routes.AUTHSCREENS, {screen: 'Email'});
            }}
          />
        </View>
      )}
    </>
  );
};
const styles = StyleSheet.create({
  //By JAMP 14-01-2026
  switchContainer: {
    justifyContent: 'center',
    alignSelf: 'center',
    width: '70%',
    flexDirection: 'row',
    backgroundColor: '#4c4c4c',
    borderRadius: 8,
    padding: 4,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#000000',
    zIndex: 10,
    columnGap: 7,
  },
  switchOption: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  switchOptionActive: {
    backgroundColor: '#9e9e9e',
    elevation: 2,
  },
  switchText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 2,
  },
  switchTextActive: {color: 'white'},
  creditivooMainContainer: {
    marginTop: -25,
    marginBottom: 15,
    paddingTop: 20,
    backgroundColor: '#4e4d4d',
    borderWidth: 2,
    borderRadius: 15,
  },
  selectorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    width: '100%',
  },
  percentageBtn: {
    flex: 0.2,
    width: 33,
    height: 30,
    paddingVertical: 4,
    marginHorizontal: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#21a72877',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0606066f',
  },
  percentageBtnCashea: {
    flex: 0.2,
    width: 33,
    height: 30,
    paddingVertical: 4,
    marginHorizontal: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fdfa3d',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0606066f',
  },
  percentageBtnActive: {backgroundColor: '#39a73f9e', borderColor: '#2E7D32'},
  percentageBtnActiveCashea: {
    backgroundColor: '#878822',
    borderColor: '#fdfa3d',
  },
  percentageText: {color: '#ffffff', fontSize: 13},
  percentageTextActive: {color: '#FFF', fontWeight: 'bold'},
  creditivooCartBadge: {
    padding: 12,
    alignItems: 'flex-start',
  },
  creditivooTag: {
    color: '#2E7D32',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
  creditivooCuotas: {color: '#FFF', fontSize: 16, marginTop: 10},
  casheaTag: {color: '#000', fontWeight: '900', fontSize: 14},
  casheaSubtext: {color: '#000', fontSize: 11, opacity: 0.7},
  hr: {
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    borderBottomWidth: 2,
    marginVertical: -2,
    width: '100%',
    alignSelf: 'center',
    marginTop: -5,
  },
  creditivooBadge: {
    marginTop: 4,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#b3b3b3',
    padding: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    borderColor: '#2E7D32',
    maxWidth: '95%',
  },
  //By JAMP 14-01-2026
  noProductFound: {lineHeight: 24, color: colorResource.blackShade},
  productHeader: {position: 'absolute', zIndex: 1, display: 'flex'},
  productImageSlider: {
    alignItems: 'center',
    zIndex: 8,
    backgroundColor: colorResource.backgroudGray,
  },
  productSliderPagination: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colorResource.Gray,
  },
  productDetailsContainer: {
    position: 'relative',
    zIndex: 6666,
    display: 'flex',
  },
  productDetailNavContainer: {flexDirection: 'row', flexWrap: 'nowrap'},
  navTitleView: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  navTitleText: {textAlign: 'center', color: colorResource.Gray},
  showMr_Ls_ContentView: {maxHeight: 96, minHeight: 96, overflow: 'hidden'},
  showMr_Ls_Container_Sub: {
    borderRadius: 16,
    paddingRight: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  showMr_Ls_Container: {marginTop: 10},
  showMR_top: {
    width: '100%',
    height: 100,
    position: 'absolute',
    bottom: 0,
    zIndex: 999,
  },
  showMr_Ls_Text: {textAlign: 'center', color: colorResource.Green},
  stockContainer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    padding: 16,
    height: 56,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 40,
    backgroundColor: colorResource.SmokeWhite,
    borderRadius: 16,
  },
  stockNumberText: {marginRight: 10, color: colorResource.Green},
  ExtraAccess_SmlrProd_Container: {width: '100%', marginTop: 20},
  ExtraAccess_SmlrProd_Title: {
    lineHeight: 36,
    marginTop: 5,
    marginBottom: 15,
    color: colorResource.blackShade,
  },
  ExtraAccess_Container: {flexDirection: 'row', marginBottom: 18},
  ExtraAccess_TextContainer: {
    marginLeft: 16,
    flex: 1,
    justifyContent: 'center',
  },
  ExtraAccess_Text: {
    lineHeight: 20,
    marginBottom: 5,
    color: colorResource.blackShade,
  },
  ExtraAccess_Text_price_Regular: {
    color: colorResource.disc_rate_clr,
    textDecorationLine: 'line-through',
  },
  ExtraAccess_Text_price_Final: {
    color: colorResource.pink_product_price,
    fontWeight: 'bold',
  },
  ExtraAccess_Text_price_Regular1: {
    color: colorResource.blackShade,
    fontWeight: 'bold',
  },

  Spec_Title_Text: {
    lineHeight: 36,
    color: colorResource.blackShade,
    marginBottom: 30,
  },
  Spec_Container: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start',
  },

  Pay_Cart_Container: {flexDirection: 'row', marginTop: 20},

  renderSimilaritemSubcontainer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    overflow: 'hidden',
    backgroundColor: colorResource.SmokeWhite,
    position: 'relative',
    borderRadius: 16,
    justifyContent: 'center',
  },
  renderSimilarItemText: {lineHeight: 16, marginTop: 5, width: 150},
  renderSimilarItemPrice: {
    lineHeight: 16,
    marginTop: 5,
    color: colorResource.blackShade,
  },

  productTitle: {lineHeight: 36, color: colorResource.blackShade},
  whitebackground: {backgroundColor: colorResource.white},
  GrayColor: {color: colorResource.Gray},

  variantsSelected: {
    height: 88,
    width: 88,
    backgroundColor: colorResource.variantSelections,
    borderRadius: 16,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  variantsUnSelected: {
    height: 88,
    width: 88,
    backgroundColor: colorResource.SmokeWhite,
    borderRadius: 16,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  variantsSelectedChild: {
    height: 50,
    width: 50,
    backgroundColor: colorResource.white,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colorResource.Green,
  },
  variantsUnSelectedChild: {
    height: 50,
    width: 50,
    backgroundColor: colorResource.SmokeWhite,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colorResource.SmokeWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btn_gray: {
    backgroundColor: colorResource.disable_clr,
    borderColor: colorResource.disable_clr,
  },
  btn: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Inter-Regular',
  },
  image: {
    width: width,
    height: width,
  },
  paginationcarousel: {
    position: 'absolute',
    bottom: 4,
  },
  footeraddtocart: {
    padding: 16,
  },
  footertotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  btngreen: {
    backgroundColor: colorResource.Green,
    height: 40,
    width: 40,
    alignContent: 'center',
    justifyContent: 'center',
    paddingLeft: 8,
    borderRadius: 8,
  },
  colorBlockText: {
    lineHeight: 36,
    marginBottom: 15,
    color: colorResource.blackShade,
  },
  colorblock: {
    height: 88,
    width: 88,
    backgroundColor: colorResource.Orange,
    borderRadius: 16,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorsview: {
    flex: 1,
    overflow: 'scroll',
    flexDirection: 'row',
  },

  linearGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    height: 32,
    width: 32,
    borderWidth: 1,
    borderColor: colorResource.Blue_Magenta,
  },
  linearGradientwhite: {
    height: 50,
    width: '100%',
  },
  SectionLineStyles: {
    width: '100%',
    height: 1.5,
    backgroundColor: colorResource.lightgrey,
    marginVertical: 10,
  },
  txtclr: {
    textAlign: 'center',
    textAlignVertical: 'center',
    marginTop: 8,
    color: colorResource.Gray,
  },
  lhContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lhImage: {
    width: 300,
    height: 300,
  },
  iconContainer: {
    flexDirection: 'row',
    marginRight: 5,
  },
  icon: {
    width: 16,
    height: 16,
    marginRight: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 15,
  },
  closeButtonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  percentageTextActiveCashea: {
    color: '#fdfa3d',
    fontWeight: 'bold',
  },
});

export default ProductDetails;
