import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Pressable,
  StatusBar,
  Platform,
  RefreshControl,
  Alert,
} from 'react-native';
import {ScrollView} from 'react-native';
import commonStyle from '../../../commonStyle';
import {CustomCarousel} from '../../Components/CustomCraousel';
import {ImageCard} from '../../Components/ImageCard';
import Sales from '../../Components/Sales';
import {useLazyQuery, useQuery} from '@apollo/client';
import {
  homeInfo,
  getLatestPendingOrder,
  homeSections,
  userWishlist,
  storeConfig,
  customerAddressList,
  getAppReleaseInfo,
  sendLocationToServer,
  setNewPasswordQuery,
} from '../../Queries/queries';
import {useDispatch, useSelector} from 'react-redux';
import {useNetInfo} from '@react-native-community/netinfo';
import {useNavigation} from '@react-navigation/native';
import {TouchableHighlight} from 'react-native-gesture-handler';
import {Icon, Badge} from 'react-native-elements';
import ProgressiveImage from '../../Components/ProgressiveImage';
import Helper from '../../Utils/Helper';
import {translate} from '../../locales';
import {
  LOCATION_FETCHED,
  storeConfig as storeConfig1,
} from '../../redux/actionTypes';
import colorResource from '../../Utils/Colors';
import ImageResource from '../../Utils/Image';
import {Routes} from '../../Utils/NavigationRoutes';
import {FavItemAdd} from '../../redux/wishlistreducers/favAction';
import WishlistButton from './Wishlist/WishlistButton';
import LoginOverlay from './Cart/LoginOverlay';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';
import {AppContext} from '../AppContext';
import PermissionHandler from '../../Utils/PermissionHandler';
import {
  getItemFromStorage,
  getObjectFromStore,
  removeStoreItem,
  setItemInStorage,
  setObjectInStore,
} from '../../Utils/Storage';
import {AnalyticsEvent} from './../../helpers/analyticHelper';
import TrackEvents from '../../Utils/TrackingEvent';
import {ADDRESSAdd} from '../../redux/DeliveryAddressReducers/DeliveryAddressAction';
import {ISAddressCacheUpdated} from './../../redux/DeliveryAddressReducers/DeliveryAddressAction';
import HomeSkeleton from '../../Components/Skeleton/HomeSkelton';
import DeviceInfo from 'react-native-device-info';
import {BackHandler, Linking, Animated, Easing} from 'react-native';
import crashlytics from '@react-native-firebase/crashlytics';
import {
  check,
  PERMISSIONS,
  request,
  requestMultiple,
  RESULTS,
} from 'react-native-permissions';
import {deepLinkAction, homeDeepLinkAction} from "../../redux/actions/deepLinkAction";
//import {firebase} from "@react-native-firebase/dynamic-links";


const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

const Home = () => {
  const netInfo = useNetInfo();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [selectedId, setSelectedId] = useState(null);

  const [isFirstTime, setIsFirstTime] = useState(true);
  const animatedValue = useRef(new Animated.Value(0)).current;

  const global_data = useSelector((state: any) => state.commonReducer);
  const PushData = useSelector((state: any) => state.PushCounterReducer);
  const deepLinkData = useSelector((state: any) => state.deepLinkReducer);
  const notifaction = useSelector(
    (state: any) => state.OrderNotificationReducer,
  );
  const StoreConfig_data = useSelector(
    (state: any) => state.StoreConfigReducer,
  );
  const DeliveryAddressReducer = useSelector(
    (state: any) => state.DeliveryAddressReducer,
  );

  const [PushCounter, setPushCounter] = useState(0);
  const {appTheme} = useContext(AppContext);
  //console.log('App theme value ---->>', appTheme);

  const [
    saveLocation,
    {loading: locationLoading, error: locationError, data: locationData},
  ] = sendLocationToServer();

  const [GethomeInfo, {loading, error, data}] = useLazyQuery(homeInfo);
  const [
    GethomeSections,
    {loading: LhomeSections, error: EhomeSections, data: DhomeSections},
  ] = useLazyQuery(homeSections);
  const [
    GetstoreConfig,
    {loading: loadstoreConfig, error: errstoreConfig, data: datastoreConfig},
  ] = useLazyQuery(storeConfig);

  const [
    getOrder,
    {loading: loadPending, error: errorPending, data: dataPending},
  ] = useLazyQuery(getLatestPendingOrder);
  const [getWishlist, {loading: wishLoad, error: wisherr, data: wishdata}] =
    useLazyQuery(userWishlist);
  const {
    loading: appInfoLoad,
    error: appInfoerr,
    data: appInfodata,
  } = useQuery(getAppReleaseInfo, {
    variables: {
      app_type: Platform.OS,
      current_app_version: DeviceInfo.getVersion(),
    },
  });

  const [
    getAddress,
    {loading: addresslistload, error: addresslisterr, data: addresslistdata},
  ] = useLazyQuery(customerAddressList);
  const [wishitemLoad, setwishitemLoad] = useState(false);
  const [LoginOverlayvisible, setLoginOverlayvisible] = useState(false);
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [isConnected, setisConnected] = useState(false);

  useEffect(() => {
    const productId = deepLinkData.value.id;
    if (deepLinkData.value == "home") {
      dispatch(homeDeepLinkAction(''));
      navigation.reset({index: 1, routes: [{name: Routes.APPSCREENS},], key: null})
    } else if (productId != null) {
      navigation.reset({index: 1, routes: [{name: Routes.APPSCREENS},], key: null})
      navigation.navigate(Routes.NAVIGATION_TO_PRODUCTDETAILS, {
        id: productId,
      });
      dispatch(deepLinkAction(''));
    }
  }, [deepLinkData]);

  useEffect(() => {
    appInfodata && console.log(appInfodata);
    if (appInfodata) {
      // {"getAppReleaseInfo": [{"__typename": "GetAppReleaseInfo", "app_type": "ANDROID", "is_manadat_update": false, "latest_app_version": "2.0.2", "release_date": "2021-11-25 04:56:00", "release_note": null}]}
      if (appInfodata.getAppReleaseInfo != null) {
        if (appInfodata.getAppReleaseInfo.length > 0) {
          if (appInfodata.getAppReleaseInfo[0].is_manadat_update) {
            Alert.alert(
              `Actualización disponible (${appInfodata.getAppReleaseInfo[0].latest_app_version})`,
              `Deberá actualizar su aplicación a la última versión para continuar usándola.`,
              [
                {
                  text: 'Actualizar la versión actual',
                  onPress: () => {
                    BackHandler.exitApp();
                    Linking.openURL(
                      Platform.OS == 'android'
                        ? Helper.androidStoreURL
                        : Helper.iOSStoreURL,
                    );
                  },
                  style: 'cancel',
                },
              ],
              {
                cancelable: false,
              },
            );
          } else {
            getItemFromStorage('nextUpdateCheck').then(dt => {
              var _date = new Date();
              let nData = new Date(dt) ?? _date;

              if (nData <= _date) {
                Alert.alert(
                  `Actualización disponible (${appInfodata.getAppReleaseInfo[0].latest_app_version})`,
                  '',
                  [
                    {
                      text: 'Actualizar la versión actual',
                      onPress: () => {
                        BackHandler.exitApp();
                        Linking.openURL(
                          Platform.OS == 'android'
                            ? Helper.androidStoreURL
                            : Helper.iOSStoreURL,
                        );
                      },
                      style: 'cancel',
                    },
                    {
                      text: 'Recuérdame más tarde',
                      onPress: () => {
                        remindLater();
                      },
                    },
                  ],
                  {
                    cancelable: true,
                    onDismiss: () => {
                      remindLater();
                    },
                  },
                );
              }
            });
          }
        }
      }
    }
  }, [appInfodata]);

  const getResolveDeepLink = async () => {
   // const link = await firebase.dynamicLinks().resolveLink("https://ivoo.page.link/Mzc8FioGQHStkE9Q8");
    var regex = /[?&]([^=#]+)=([^&#]*)/g;
    var params: any = {}; // Initialize an empty object to store the parameters
    var match;

    while ((match = regex.exec(link.url))) {
      params[match[1]] = match[2];
    }

    console.log("resolve link:",link.url);
    console.log("resolve link:",params.id);

  }

  // const generateLink = async () => {
  //   const link = await firebase.dynamicLinks().buildShortLink({
  //     domainUriPrefix: 'https://ivoo.page.link',
  //     link: `https://ivoo.page.link/home`,
  //     ios: {
  //       bundleId: 'com.siragon',
  //       appStoreId: '1479559802',
  //     },
  //     android: {
  //       packageName: 'com.ivoo.android',
  //     },
  //   });
  //   console.log("home page url",link);
  //   return link;
  // };


  const remindLater = () => {
    setItemInStorage(
      'nextUpdateCheck',
      Helper.addHourstoSystemDate(24).toString(),
    );
  };

  useEffect(() => {
    console.log('***: Home : notifaction :*********');
    global_data.token && getOrder();
  }, [notifaction]);

  useEffect(() => {
    PushData.PUSH_COUNTER_CHECK.filter(item => item.token === global_data.email)
      .length > 0
      ? setPushCounter(
          PushData.PUSH_COUNTER_CHECK.filter(
            item => item.token === global_data.email,
          )[0].count,
        )
      : setPushCounter(0);
  }, [PushData]);

  useEffect(() => {
    datastoreConfig &&
      dispatch({type: storeConfig1, payload: {storeConfig: datastoreConfig}});
  }, [datastoreConfig]);

  useEffect(() => {
    if (isConnected) {
      if (error) {
        error && Helper.ShowAlert(`${error}`);
      } else if (errorPending) {
        errorPending && Helper.ShowAlert(`${errorPending}`);
      } else if (EhomeSections) {
        EhomeSections && Helper.ShowAlert(`${EhomeSections}`);
      }
    }
  }, [error, errorPending, EhomeSections]);

  const onRefresh = React.useCallback(async () => {
    setIsLoadingSkelton(true);
    setRefreshing(true);
    GetstoreConfig();
    GethomeInfo();
    GethomeSections();
    global_data.token && (getOrder(), getWishlist(), getAddress());
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, [refreshing]);

  // fetching and storing all items reducer
  useEffect(() => {
    if (wishdata) {
      wishdata.customer.wishlist.items.map(product => {
        dispatch(FavItemAdd(product.product.sku, product.id, product.product));
      });
    }
  }, [wishdata]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setisConnected(state.isConnected);
      !state.isConnected && Helper.ShowAlert(translate('home.msg_offline'));
    });

    return unsubscribe;
  }, [netInfo.isConnected]);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 800,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start(() => {
      setIsFirstTime(false);
    });

    global_data.token &&
      (getWishlist(), !DeliveryAddressReducer.isUpdated ? getAddress() : null);
    GethomeInfo();
    GethomeSections();
  }, []);

  useEffect(() => {
    if (addresslistdata) {
      addresslistdata.customer.addresses.map((product, index) => {
        dispatch(ADDRESSAdd(product, product.id));
        dispatch(ISAddressCacheUpdated(true));
      });
    }
  }, [addresslistdata]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async e => {
      console.log('Global data value ----->> ', global_data);
      global_data.token ? await handleLOCATIONPermission() : null;
      global_data.token && getOrder();
    });
    return unsubscribe;
  }, [navigation]);

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

  // Check the user location permission access permission every 7 dyas
  const handleLOCATIONPermission = async () => {
    const hasPermission = await PermissionHandler.hasLocationPermission();
    if (hasPermission) {
      await PermissionHandler.getCurrentLatLong();
    }

    const permissionReqTimeStr = await getItemFromStorage('PermissionReqTime');
    const permissionReqTime = new Date(permissionReqTimeStr);
    const nowDT = new Date();

    if (nowDT >= permissionReqTime) {
      // Saving next permission expiry date time
      nowDT.setDate(nowDT.getDate() + 7);
      setItemInStorage('PermissionReqTime', nowDT.toISOString());
    }

    setTimeout(async () => {
      if (hasPermission) {
        const data = await getObjectFromStore('locationData');
        const locRefreshTimeInMin =
          (await getItemFromStorage('minLocationTime')) || '1440';
        console.log('Data of local storage object is -------->>', data);
        if (data == null) {
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
            'homepage',
            await getItemFromStorage('cityNameVal'),
            'true',
          );
        } else {
          const storedLat = await getItemFromStorage('lat');
          const storedLng = await getItemFromStorage('lng');
          const lastLocDate = await data.lastLocDate;

          console.log(
            'Data of local storage is -------->>',
            storedLat,
            storedLng,
            lastLocDate,
          );

          if (lastLocDate !== '' || lastLocDate !== null) {
            const lastStoredDate = new Date(
              lastLocDate?.toString() || nowDT.toString(),
            );

            console.log('Time between dates is ------>>', lastLocDate, nowDT);

            const timeDiff = nowDT.getTime() - lastStoredDate.getTime();
            const differenceMinutes = Math.floor(timeDiff / (1000 * 60));

            console.log(
              'Time difference between dates is ------>>',
              differenceMinutes,
            );
            if (differenceMinutes > parseInt(locRefreshTimeInMin)) {
              await removeStoreItem('locationData');
              const locationData = {
                latitude: await getItemFromStorage('lat'),
                longitude: await getItemFromStorage('lng'),
                lastLocDate: new Date(nowDT.toString()),
                city: await getItemFromStorage('cityNameVal'),
              };
              await setObjectInStore('locationData', locationData);
              console.log(
                'Time diff between dates is ------>>',
                differenceMinutes,
              );
              await sendLocationDataToServer(
                data.latitude,
                data.longitude,
                'homepage',
                data.city,
                'true',
              );
            } else {
              console.log('No need to sync the data to the server');
            }
          }
        }
      }
    }, 5000);
  };
  const goToCardDeatil = option => {
    Helper.HandleVibration();
    if (option.length > 0) {
      navigation.navigate(Routes.NAVIGATION_TO_CARDDETAILS, {
        heading: option.name,
        id: option.id,
      });
    } else {
      navigation.navigate(Routes.NAVIGATION_TO_CATEGORYDETAIL, {
        id: option.id,
        name: option.name,
      }); //"CategoryDetail"
    }
  };

  const renderOrderStatus = item => {
    if (item.status_code) {
      var orderStatus = item.status;
      var orderStatuscode = item.status_code;
      var statusColor = colorResource.Orange;
      var orderType: String = item.shipping_method;
      var isPickup = orderType.includes('In-Store Pickup');
      //  console.log( orderStatuscode, ' -- -- ', orderStatus )
      switch (item.status_code.toLowerCase()) {
        case 'finished':
          statusColor = colorResource.Green;
          break;
        case 'delivered':
          statusColor = colorResource.Green;
          break;
        case 'canceled':
          statusColor = colorResource.pink_product_price;
          break;
        case 'on_the_way':
          statusColor = colorResource.DarkOrange;
          break;
        case 'ready_for_pickup':
          statusColor = colorResource.DarkOrange;
          break;
        case 'holded':
          statusColor = colorResource.DarkOrange;
          break;
        case 'processing':
          statusColor = colorResource.Orange;
          break;
        case 'preparing':
          statusColor = colorResource.Orange;
          break;
        default:
          statusColor = colorResource.Orange;
          break;
      }

      return (
        <TouchableOpacity
          key={Math.random()}
          style={[commonStyle.marginTop_8, commonStyle.flex_1]}
          onPress={() => {
            Helper.HandleVibration(),
              navigation.navigate(Routes.NAVIGATION_TO_ORDERHISTORYDETAIL, {
                id: item.increment_id,
              });
          }}>
          <View style={[styles.Order_Title_Status]}>
            <Text style={[styles.text_heading_text, {color: appTheme.text}]}>
              {/* Status */}
              {/* {translate( 'order.lbl_status' )} */}#{item.increment_id}
            </Text>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View style={{borderRadius: 8, backgroundColor: statusColor}}>
                <Text style={styles.text_status}>{orderStatus}</Text>
              </View>
              <ProgressiveImage
                style={commonStyle.he_wi_15}
                source={ImageResource.ic_arrow}></ProgressiveImage>
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
                  orderStatuscode !== 'pending_payment_review' ||
                  orderStatuscode !== 'pending'
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
                  orderStatuscode == 'delivered' ||
                  orderStatuscode == 'complete' ||
                  orderStatuscode == 'ready_for_pickup' ||
                  orderStatuscode == 'on_the_way' ||
                  orderStatuscode == 'holded' ||
                  orderStatuscode == 'preparing' ||
                  orderStatuscode == 'processing'
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
                  orderStatuscode == 'complete' ||
                  orderStatuscode == 'delivered' ||
                  orderStatuscode == 'canceled'
                    ? statusColor
                    : colorResource.disable_clr,
              }}
            />
            {/* || orderStatuscode == "on_the_way" */}

            {!isPickup && (
              <View
                style={{
                  height: 4,
                  flex: 0.24,
                  borderRadius: 8,
                  backgroundColor:
                    orderStatuscode == 'delivered' ||
                    orderStatuscode == 'complete' ||
                    orderStatuscode == 'delivered'
                      ? statusColor
                      : colorResource.disable_clr,
                }}
              />
            )}
          </View>
        </TouchableOpacity>
      );
    }
  };
  const renderItem = ({item, index}) => {
    return (
      <TouchableOpacity
        style={[
          commonStyle.marginRight_10,
          index === 0 ? commonStyle.margin_left_24 : commonStyle.margin_left_0,
        ]}
        onPress={() => {
          Helper.HandleVibration();
          navigation.navigate(Routes.NAVIGATION_TO_PRODUCTDETAILS, {
            id: item.sku,
          });
        }}>
        <View style={[commonStyle.productCardMainContainer]}>
          <View style={[commonStyle.productCardImageContainer]}>
            {item.small_image != undefined && (
              <View>
                <ProgressiveImage
                  source={{uri: item.small_image.url + Helper.listImageSize}}
                  style={{
                    width: (width / 2) * 0.86,
                    height: (width / 2) * 0.86,
                  }}
                  resizeMode="cover"
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
                setLoginOverlayvisible(login);
              }}
            />
          </View>
          <Text
            style={[
              commonStyle.h6,
              styles.renderItemText,
              {color: appTheme.text},
            ]}>
            {item.name}
          </Text>
          <View style={[commonStyle.flexDir_Row]}>
            <View>
              <Text
                style={[
                  commonStyle.h6,
                  commonStyle.fontBold,
                  styles.renderItemPrice,
                  {color: appTheme.text},
                ]}>
                {Helper.currencyFormat(
                  item.price_range.minimum_price.final_price.value,
                )}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const [isLoadingSkelton, setIsLoadingSkelton] = useState(true);
  useEffect(() => {
    if (!(loading || LhomeSections)) {
      setTimeout(() => {
        setIsLoadingSkelton(false);
      }, Helper.skeletonTimeout);
    }
  }, [loading, LhomeSections]);

  async function requestMultiplePermissions() {
    const permissionsArray = [
      PERMISSIONS.ANDROID.POST_NOTIFICATIONS,
      PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      // Add more permissions as needed
    ];

    const statuses = await Promise.all(
      permissionsArray.map(permission => requestMultiple(permissionsArray)),
    );

    statuses.forEach((status, index) => {
      console.log('All', `${permissionsArray[index]} status: ${status}`);
    });
  }

  useEffect(() => {
    if (Platform.OS === 'android') {
      requestMultiplePermissions();
    }
  }, []);

  // useEffect(() => {
  //   setloading(true);
  //   const encodedAddress = encodeURI(Address);

  //   Address &&
  //     fetch(
  //       `https://maps.googleapis.com/maps/api/geocode/json?country=Venezuela&region=VE&language=es&address=${encodedAddress}&key=${
  //         Platform.OS == 'ios'
  //           ? 'AIzaSyDJLaZGw_hepaXX3Z4Jf1RPKUtoObR974o'
  //           : 'AIzaSyAKRXEFlzaa65i4vVWP2Rk2A028nbw8HIo'
  //       }`,
  //     )
  //       .then(response => response.json())
  //       .then(json => {
  //         if (json.results.length > 0) {
  //           console.log('Chagned from API marker -- ');

  //           const location1 = json.results[0].geometry.location;
  //           setlocation(location1);
  //           // setMarker(
  //           //   [{
  //           //     latitude: location.lat,
  //           //     longitude: location.lng,
  //           //     latitudeDelta: LATITUDE_DELTA,
  //           //     longitudeDelta: LONGITUDE_DELTA
  //           //   }]
  //           // )
  //         } else {
  //           setloading(false);
  //           const addrs = props.Useraddress.city + ' Venezuela';
  //           setAddress(addrs);
  //         }
  //       })
  //       .catch(error => {
  //         Helper.ShowAlert(error);
  //         setloading(false);
  //       });
  // }, [Address]);

  return (
    <View style={{flex: 1, backgroundColor: appTheme.background}}>
      <StatusBar
        translucent={true}
        backgroundColor={colorResource.transparent}
        barStyle={appTheme.statusBar}
      />
      <ScrollView
        removeClippedSubviews={true}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[commonStyle.wrapper]}
        refreshControl={
          <RefreshControl
            progressViewOffset={insets.top}
            refreshing={false}
            onRefresh={onRefresh}
          />
        }>
        <View style={{backgroundColor: appTheme.background}}>
          <View
            style={{
              marginTop: insets.top + 10,
              height: 80,
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
            }}>
            {
              <View style={{flex: 0.85, alignItems: 'center'}}>
                <ProgressiveImage
                  style={{height: 70}}
                  resizeMode="contain"
                  source={
                   // ImageResource.ic_Home_Green_Theme2
                    appTheme.type === 'dark'
                      ? ImageResource.ic_home_logo_black_theme
                      : ImageResource.ic_home_logo_white_theme
                  }
                />
              </View>
            }
            {
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate(Routes.NAVIGATION_TO_NOTIFICATIONLIST);
                }}
                style={[
                  {position: 'absolute', right: 16, alignItems: 'flex-end'},
                ]}>
                <View>
                  <ProgressiveImage
                    style={[commonStyle.he_wi_35]}
                    source={
                      ImageResource.ic_bell
                      // appTheme.type == 'green'
                      //   ? ImageResource.ic_bell
                      //   : ImageResource.ic_notification_bell
                    }
                  />
                  {PushCounter != 0 && (
                    <Badge
                      value={PushCounter > 9 ? '9+' : PushCounter}
                      // value={PushCounter}
                      status="error"
                      containerStyle={[
                        {position: 'absolute', top: -4, right: -5},
                      ]}
                    />
                  )}
                </View>
              </TouchableOpacity>
            }
          </View>

          {isLoadingSkelton && <HomeSkeleton />}

          {data && (
            <View
              style={{paddingBottom: 10, backgroundColor: appTheme.background}}>
              {
                //Order Progress Section

                dataPending && dataPending.customer.orders.items.length > 0 && (
                  <View
                    style={[
                      commonStyle.flex_1,
                      commonStyle.paddingHome_24,
                      {marginBottom: 20},
                    ]}>
                    <View style={styles.Order_Title_Status}>
                      <View>
                        <Text
                          style={[
                            styles.text_heading_text,
                            {marginTop: 24, color: appTheme.text},
                          ]}>
                          {translate('home.lbl_your_orders_process')}
                        </Text>
                      </View>
                    </View>

                    {dataPending.customer.orders.items.map((option, index) => {
                      //console.log( JSON.stringify( dataPending.customer.orders.items ) )
                      return renderOrderStatus(option);
                    })}
                  </View>
                )
              }
              {
                //Sales
                <View style={{marginBottom: 10}}>
                  {StoreConfig_data &&
                  StoreConfig_data.storeConfig.storeConfig.storeConfig
                    .homepage_section1_display_mode == 2
                    ? data.homeSection.section1[0].children.map(
                        (option, index) => {
                          option.current_date =
                            StoreConfig_data.storeConfig.storeConfig.store_time.datetime;
                          return (
                            <View
                              style={[
                                commonStyle.paddingHome_24,
                                {marginTop: 20, marginBottom: 23},
                              ]}
                              key={option.name}>
                              <Sales
                                data={option}
                                themeName={option.text_color}
                                id={option.id}
                                imgName={option.icon}
                                saleType={option.name}
                                theme={option.category_background_css}
                              />
                            </View>
                          );
                        },
                      )
                    : data.homeSection.section1[0].children.map(
                        (option, index) => {
                          return (
                            <TouchableHighlight
                              key={option.name}
                              underlayColor="transparent"
                              onPress={() => {
                                goToCardDeatil(option);
                              }}
                              style={commonStyle.paddingHome_24}>
                              <ImageCard
                                onPressFlag={true}
                                imageTagName={option.name}
                                thumbnail={option.big_banner_image}
                              />
                            </TouchableHighlight>
                          );
                        },
                      )}
                </View>
              }
              {DhomeSections &&
                DhomeSections.homeSections.length > 0 &&
                DhomeSections.homeSections.map((option, index) => {
                  return (
                    <View
                      key={index}
                      style={[
                        styles.section2_mode2Container,
                        {marginBottom: 0},
                      ]}>
                      {option.mode == 1 ? (
                        <View style={[commonStyle.paddingHome_24]}>
                          {option &&
                            option.category.products.total_count > 0 && (
                              <CustomCarousel
                                id={option.category.id}
                                totalCount={
                                  option.category.products.total_count
                                }
                                heading={option.category.name}
                                priceTag={true}
                                discount={false}
                                sliderItem={option.category.products.items}
                              />
                            )}
                        </View>
                      ) : (
                        <View style={{marginBottom: -20}}>
                          {option &&
                            option.category.products.total_count > 0 && (
                              <>
                                <View
                                  style={[
                                    styles.container_CorosouleText,
                                    commonStyle.paddingHome_24,
                                    {
                                      marginTop:
                                        option.category.products.items
                                          .length === 1
                                          ? 30
                                          : 10,
                                    },
                                  ]}>
                                  <Text
                                    style={[
                                      commonStyle.h3,
                                      commonStyle.fontBold,
                                      {
                                        flex:
                                          option &&
                                          option.category.products.total_count >
                                            4
                                            ? 0.5
                                            : 1,
                                        color: appTheme.text,
                                      },
                                    ]}>
                                    {option && option.category.name}
                                  </Text>
                                  {option &&
                                    option.category.products.total_count >
                                      4 && (
                                      <View
                                        style={[
                                          styles.homcesection2SubContainer,
                                        ]}>
                                        <Pressable
                                          onPress={() => {
                                              console.log("prod count---->" + option.category.products.total_count)
                                            Helper.HandleVibration();
                                            AnalyticsEvent(
                                              TrackEvents.Category,
                                              {
                                                userEmail: global_data.email,
                                                category_id: option.category.id,
                                                saleType: option.category.name,
                                              },
                                            );

                                            navigation.navigate(
                                              Routes.NAVIGATION_TO_CATEGORYDETAIL,
                                              {
                                                id:
                                                  option && option.category.id,
                                                name:
                                                  option &&
                                                  option.category.name,
                                              },
                                            );
                                          }}
                                          underlayColor={
                                            colorResource.transparent
                                          }>
                                          <View
                                            style={[styles.seeAllContainer]}>
                                            <Text
                                              style={[
                                                commonStyle.h4,
                                                commonStyle.fontBold,
                                                commonStyle.colorCategory,
                                                commonStyle.marginRight_10,
                                              ]}>
                                              {' '}
                                              {translate('home.lbl_seeall')}
                                            </Text>
                                            <Icon
                                              name="play"
                                              type="font-awesome-5"
                                              iconStyle={commonStyle.colorCategory}
                                              size={12}
                                            />
                                          </View>
                                        </Pressable>
                                      </View>
                                    )}
                                </View>
                                {
                                  <View
                                    style={[
                                      commonStyle.flex_1,
                                      {
                                        marginBottom:
                                          option.category.products.items
                                            .length === 1
                                            ? 0
                                            : 32,
                                      },
                                    ]}>
                                    <FlatList
                                      data={
                                        option && option.category.products.items
                                      }
                                      renderItem={renderItem}
                                      keyExtractor={item => item.sku}
                                      extraData={selectedId}
                                      horizontal={true}
                                      showsHorizontalScrollIndicator={false}
                                    />
                                  </View>
                                }
                              </>
                            )}
                        </View>
                      )}
                    </View>
                  );
                })}
            </View>
          )}

          {/* {!refreshing && <CustomPBar showProgress={wishitemLoad} />} */}
        </View>
      </ScrollView>

      {LoginOverlayvisible === true ? (
        <View style={{width: '100%', position: 'absolute'}}>
          <LoginOverlay
            visibleView={LoginOverlayvisible}
            OnClose={() => {
              setLoginOverlayvisible(false);
            }}
            onPressEmail={() => {
              setLoginOverlayvisible(false);
              navigation.navigate(Routes.AUTHSCREENS, {screen: 'Email'});
            }}
          />
        </View>
      ) : null}
      {isFirstTime && (
        <Animated.Image
          source={require('../../../assets/images/black_bg.png')}
          resizeMode="stretch"
          style={{
            tintColor: 'white',
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            height: height,
            width: width,
            transform: [
              {
                translateX: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0],
                }),
              },
              {
                translateY: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 350],
                }),
              },
              {
                scaleX: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 15],
                }),
              },
              {
                scaleY: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 12.5],
                }),
              },
            ],
          }}
        />
      )}
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  section2_mode2Container: {paddingHorizontal: 2},
  homcesection2SubContainer: {flex: 0.5, justifyContent: 'flex-end'},
  seeAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  seeAllIcon: {fontSize: 12},

  topMargin10: {
    marginTop: 10,
  },
  homeSection3: {
    marginTop: 2,
  },
  container_CorosouleText: {
    flex: 1,
    marginTop: 0,
    marginBottom: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  text_heading_text: {
    fontSize: 20,
    lineHeight: 28,
    fontFamily: 'Gilroy-Bold',
    fontWeight: '700',
    color: colorResource.blackShade,
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
  renderItemText: {lineHeight: 16, marginTop: 5, width: 135},
  renderItemPrice: {
    lineHeight: 16,
    marginTop: 5,
    color: colorResource.blackShade,
  },
  safeareaMainContainer: {flex: 1, backgroundColor: colorResource.white},
  Order_Title_Status: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
