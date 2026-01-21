import {useLazyQuery} from '@apollo/client';
import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState, useRef, useContext} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Animated,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import commonStyle from '../../../../commonStyle';
import {productInfo} from '../../../Queries/queries';
import ProgressiveImage from '../../../Components/ProgressiveImage';
import Helper from '../../../Utils/Helper';
import {translate} from '../../../locales';
import clrs from '../../../Utils/Colors';
import {useSelector} from 'react-redux';
import {Routes} from '../../../Utils/NavigationRoutes';
import LoginOverlay from '../Cart/LoginOverlay';
import {Icon, Text} from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';
import * as Progress from 'react-native-progress';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {getSalesProgressData} from '../../../Utils/pbutils';
import WishlistButton from '../Wishlist/WishlistButton';
import ResColors from '../../../Utils/Colors';
import {AppContext} from '../../AppContext';
import {AnalyticsEvent} from './../../../helpers/analyticHelper';
import TrackEvents from '../../../Utils/TrackingEvent';
import ProductListSkelton from '../../../Components/Skeleton/ProductListSkelton';

// Used for Sales Product List
const ProductList = props => {
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [
    productInfoFunc,
    {loading: loadingB, data: productsResponse, fetchMore},
  ] = useLazyQuery(productInfo);

  const navigation = useNavigation();
  const global_data = useSelector((state: any) => state.commonReducer);

  const [LoginOverlayvisible, setLoginOverlayvisible] = useState(false);

  const [remainingTime, setRemainingTime] = useState('0:0:0');
  const [progressPercent, setProgressPercent] = useState(0);
  let theme = props.route.params.headerOption.theme.split(',');
  theme = theme.length != 2 ? ['#FFE5DA', '#FFCDF1'] : theme;
  theme[0] = theme[0].trim();
  theme[1] = theme[1].trim();

  const colorTheme = props.route.params.headerOption.themeName;

  //#region Animations
  const scrollOffsetY = useRef(new Animated.Value(0)).current;
  const screenWidth = Dimensions.get('window').width;
  let HEADER_MAX_HEIGHT = 300;
  const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 60 : 73;

  HEADER_MAX_HEIGHT = Platform.OS === 'ios' ? -300 : 0;

  let titleLen = props.route.params.headerOption.saleType.length;
  let factor = 7;
  if (titleLen <= 3) {
    factor = 9.7;
  } else if (titleLen <= 6) {
    factor = 8.7;
  } else if (titleLen <= 9) {
    factor = 8.1;
  } else if (titleLen <= 12) {
    factor = 6.8;
  } else if (titleLen <= 15) {
    factor = 6.6;
  } else if (titleLen <= 18) {
    factor = 6.1;
  } else if (titleLen <= 21) {
    factor = 5.7;
  } else if (titleLen <= 24) {
    factor = 5.5;
  } else if (titleLen <= 27) {
    factor = 5;
  } else {
    factor = 4.8;
  }

  const YTranslate = scrollOffsetY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, Platform.OS == 'ios' ? -44 : -48],
    extrapolate: 'clamp',
  });

  let sw12 = screenWidth / 2 - factor * titleLen;
  let sw0 = 0;

  const XTranslate = scrollOffsetY.interpolate({
    inputRange: [0, 100],
    outputRange: [sw0, sw12],
    extrapolate: 'clamp',
  });

  const insets = useSafeAreaInsets();

  const headerHeight = scrollOffsetY.interpolate({
    inputRange: [0, HEADER_MIN_HEIGHT],
    outputRange: [HEADER_MIN_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  if (props.route.params.headerOption.data) {
    const {sale_start_date, sale_end_date, current_date} =
      props.route.params.headerOption.data;
    let current_time = new Date(current_date);

    const [currentDate, setCurrentDate] = useState(current_time);

    const setProgressInformation = current_date => {
      const {progressValue, remainingValue} = getSalesProgressData(
        sale_start_date,
        sale_end_date,
        current_date,
      );
      setProgressPercent(progressValue);
      setRemainingTime(remainingValue);
    };
    const timer = () => {
      let new_current_date = currentDate;
      new_current_date.setSeconds(new_current_date.getSeconds() + 1); //set new ticker date and time according to time interval e.g. 5 sec
      setCurrentDate(new_current_date);
      setProgressInformation(new_current_date);
    };

    useEffect(() => {
      setProgressInformation(currentDate);
      const id = setInterval(timer, 1000);
      return () => clearInterval(id);
    });
  }

  //#endregion

  useEffect(() => {
    console.log('====== Initiated PRoduct======');
    console.log({
      variables: {
        pageSize: 20,
        filters: {
          category_id: {eq: props.route.params.id},
        },
        sort: {name: 'DESC'},
        currentPage: 1,
      },
    });
    console.log('====================================');
    productInfoFunc({
      variables: {
        filters: {
          category_id: {eq: props.route.params.id},
        },
        pageSize: 20,
        sort: {name: 'DESC'},
        currentPage: 1,
      },
    });
  }, []);
  const [items, setItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  useEffect(() => {
    AnalyticsEvent(TrackEvents.Category, {
      userEmail: global_data.email,
      category_id: props.route.params.headerOption.id,
      saleType: props.route.params.headerOption.saleType,
    });

    if (productsResponse) {
      console.log(
        'productsResponse === new ===',
        productsResponse.products.items.length,
      );
      console.log(productsResponse);
      setItems(productsResponse.products.items);
      setCurrentPage(productsResponse.products.page_info.current_page);
      setTotalPage(productsResponse.products.page_info.total_pages);
    }
  }, [productsResponse]);
  /**
   *
   * @param item - Items from Response
   * @param isTrue - True when product count is less then 5
   */
  const renderDom = (item: any, index: any, isTrue: Boolean) => {
    return (
      <TouchableOpacity
        key={item.sku}
        style={[
          commonStyle.marginBottom_20,
          {
            marginHorizontal: 0,
            width: !isTrue ? '50%' : undefined,
            marginTop: isTrue ? 20 : null,
          },
        ]}
        onPress={() => {
          Helper.HandleVibration(),
            navigation.navigate(Routes.NAVIGATION_TO_PRODUCTDETAILS, {
              heading: item.name,
              id: item.sku,
              price: item.price_range.minimum_price.regular_price.value,
            });
        }}>
        <View style={[commonStyle.productCardMainContainer]}>
          <View
            style={[
              isTrue
                ? null
                : [
                    index % 2 == 0 ? styles.rightspace : styles.leftspace,
                    {
                      width: Dimensions.get('window').width / 2 - 20,
                      height: Dimensions.get('window').width / 2 - 20,
                    },
                  ],
            ]}>
            {item.small_image != undefined && (
              <View style={styles.cardStyle}>
                {isTrue ? (
                  <ProgressiveImage
                    source={{uri: item.small_image.url + Helper.gridImageSize}}
                    style={styles.whishIcon}
                  />
                ) : (
                  <ProgressiveImage
                    source={{uri: item.small_image.url + Helper.gridImageSize}}
                    style={{
                      width: Dimensions.get('window').width / 2 - 20,
                      height: Dimensions.get('window').width / 2 - 20,
                    }}
                  />
                )}
              </View>
            )}

            <WishlistButton
              SKU={item.sku}
              pagetype={'other'}
              setLoginOverlay={login => {
                setLoginOverlayvisible(login);
              }}
            />
          </View>
          <Text
            style={[
              commonStyle.h6,
              commonStyle.marginTop_5,
              styles.productInfoItem,
              {color: appTheme.text},
            ]}>
            {item.name}
          </Text>
          <View style={[commonStyle.flexDir_Row]}>{renderPrice(item)}</View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderPrice = item => {
    if (
      item.price_range.minimum_price.regular_price.value != 0 &&
      item.price_range.minimum_price.regular_price.value !=
        item.price_range.minimum_price.final_price.value
    ) {
      return (
        <>
          <View style={{marginLeft: 8, marginRight: 10}}>
            <Text
              style={[
                commonStyle.h6,
                styles.productDiscRate,
                {color: appTheme.disc_rate_clr},
              ]}>
              {Helper.currencyFormat(
                item.price_range.minimum_price.regular_price.value,
              )}
            </Text>
          </View>
          <View>
            <Text
              style={[
                commonStyle.h6,
                commonStyle.fontBold,
                styles.productInfoPrice,
              ]}>
              {Helper.currencyFormat(
                item.price_range.minimum_price.final_price.value,
              )}
            </Text>
          </View>
        </>
      );
    } else {
      return (
        <View>
          <Text
            style={[
              commonStyle.h6,
              commonStyle.fontBold,
              styles.finalPriceblack,
              {
                color:
                  appTheme.type === 'dark'
                    ? ResColors.white
                    : ResColors.blackShade,
              },
            ]}>
            {Helper.currencyFormat(
              item.price_range.minimum_price.regular_price.value,
            )}
          </Text>
        </View>
      );
    }
  };
  const renderItem = ({item, index}) => {
    return renderDom(item, index, false);
  };

  const {appTheme} = useContext(AppContext);

  const [isLoadingSkelton, setIsLoadingSkelton] = useState(true);

  useEffect(() => {
    if (!loadingB) {
      setTimeout(() => {
        setIsLoadingSkelton(false);
      }, Helper.skeletonTimeout);
    }
  }, [loadingB]);

  // const loadMoreData = () => {
  //   if (isLoadingMore) {
  //     return;
  //   }
  //
  //   if (currentPage < totalPage) {
  //     setIsLoadingMore(true);
  //     setCurrentPage(currentPage + 1);
  //   } else {
  //     return;
  //   }
  //
  //   fetchMore({
  //     variables: {
  //       filters: {
  //         category_id: {eq: props.route.params.id},
  //       },
  //       pageSize: 20,
  //       sort: {name: 'DESC'},
  //       currentPage: currentPage + 1,
  //     },
  //   }).then(fetchMoreResult => {
  //     console.log('******* Loading More');
  //     console.log([...items, ...fetchMoreResult.data.products.items].length);
  //     setItems([...items, ...fetchMoreResult.data.products.items]);
  //     setIsLoadingMore(false);
  //   });
  // };

  const loadMoreData = () => {
    if (isLoadingMore || currentPage >= totalPage) return;

    setIsLoadingMore(true);

    try {
      const nextPage = currentPage + 1;

      const {data: fetchMoreResult} = fetchMore({
        variables: {
          filters: {category_id: {eq: props.route.params.id}},
          pageSize: 20,
          sort: {name: 'DESC'},
          currentPage: nextPage,
        },
        updateQuery: (previousResult, {fetchMoreResult}) => {
          if (!fetchMoreResult?.products) return previousResult;

          // Merge data in Apollo cache
          const merged = {
            ...fetchMoreResult,
            products: {
              ...fetchMoreResult.products,
              items: [
                ...previousResult.products.items,
                ...fetchMoreResult.products.items,
              ],
            },
          };

          return merged;
        },
      });

      // Also update local state
      const newItems = fetchMoreResult?.products?.items ?? [];
      setItems(prev => [...prev, ...newItems]);
      setCurrentPage(nextPage);
    } catch (error) {
      console.error('Error loading more data:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const renderFooter = () => {
    try {
      // Check If Loading
      if (isLoadingMore) {
        return (
          <View style={{width: Dimensions.get('window').width}}>
            <ActivityIndicator size="large" color={ResColors.Green} />
          </View>
        );
      }
    } catch (error) {}
    return <></>;
  };

  return (
    <View style={[commonStyle.flex_1, {backgroundColor: appTheme.background}]}>
      {!isLoadingSkelton && (
        <LinearGradient colors={theme}>
          <View style={[styles.headerWrap, {marginTop: insets.top}]}>
            <TouchableOpacity
              style={[
                styles.ButtonViewStyles,
                {padding: 5, paddingVertical: 8},
              ]}
              onPress={() => {
                Helper.HandleVibration();
                navigation.goBack();
              }}>
              <Icon
                name="arrow-left"
                type="font-awesome-5"
                color={colorTheme}
                onPress={() => {
                  Helper.HandleVibration();
                  navigation.goBack();
                }}
              />
            </TouchableOpacity>
          </View>
          <Animated.View
            style={{
              flexDirection: 'row',
              height: scrollOffsetY.interpolate({
                inputRange: [0, 156],
                outputRange: [50, 0],
                extrapolate: 'clamp',
              }),
              justifyContent: 'space-between',
            }}>
            <Animated.View
              style={[
                {
                  paddingHorizontal: screenWidth * 0.05,
                  height: headerHeight,
                  alignContent: 'flex-end',
                },
              ]}>
              <Animated.Text
                numberOfLines={1}
                style={[
                  commonStyle.fontBold,
                  {
                    alignItems: 'flex-start',
                    marginTop: 10,
                    fontFamily: 'Gilroy-Bold',
                    fontWeight: '700',
                    width: scrollOffsetY.interpolate({
                      inputRange: [0, 100],
                      outputRange: [screenWidth / 1.8, screenWidth / 1.8],
                      extrapolate: 'clamp',
                    }),
                    color: colorTheme,
                    transform: [
                      {translateY: YTranslate},
                      {translateX: XTranslate},
                    ],
                    fontSize: scrollOffsetY.interpolate({
                      inputRange: [0, 100],
                      outputRange: [25, 20],
                      extrapolate: 'clamp',
                    }),
                  },
                ]}>
                {props.route.params.headerOption.saleType}
              </Animated.Text>
            </Animated.View>
            <Animated.View
              style={[
                {
                  paddingHorizontal: 20,
                },
              ]}>
              <Animated.Text
                style={[
                  {
                    color: colorTheme,
                    marginTop: scrollOffsetY.interpolate({
                      inputRange: [0, 156],
                      outputRange: [15, 13],
                      extrapolate: 'clamp',
                    }),
                    height: headerHeight,
                    transform: [
                      {
                        translateY: YTranslate,
                      },
                    ],
                    fontSize: 16,
                  },
                ]}>
                {remainingTime}
              </Animated.Text>
            </Animated.View>
          </Animated.View>

          <Animated.View style={{paddingHorizontal: 20, marginBottom: 20}}>
            <Progress.Bar
              progress={progressPercent}
              width={null}
              color={colorTheme}
              unfilledColor={clrs.White80}
              borderColor={clrs.White80}
            />
          </Animated.View>
        </LinearGradient>
      )}
      {
        <View
          style={[
            commonStyle.paddingHorizontal_16,
            {backgroundColor: appTheme.background},
          ]}>
          {productsResponse &&
            items &&
            (productsResponse.products.items.length == 0 ? (
              <Text
                style={[
                  commonStyle.h5,
                  commonStyle.marginTop_40,
                  {color: appTheme.text},
                ]}>
                {translate('products.lbl_no_product_found')}
              </Text>
            ) : items.length > 5 ? (
              <View style={[{marginBottom: 115}]}>
                <FlatList
                  showsVerticalScrollIndicator={false}
                  data={items}
                  renderItem={renderItem}
                  keyExtractor={item => item.sku}
                  numColumns={2}
                  removeClippedSubviews={true}
                  contentContainerStyle={[
                    commonStyle.productListcontentContainerStyle,
                  ]}
                  columnWrapperStyle={[
                    commonStyle.justifyContent_space_between,
                  ]}
                  onScroll={Animated.event(
                    [
                      {
                        nativeEvent: {contentOffset: {y: scrollOffsetY}},
                      },
                    ],
                    {useNativeDriver: false},
                  )}
                  onEndReached={loadMoreData}
                  onEndReachedThreshold={0.1}
                  ListFooterComponent={renderFooter}
                />
              </View>
            ) : (
              <Animated.ScrollView
                removeClippedSubviews={true}
                style={{backgroundColor: appTheme.background}}
                onScroll={Animated.event(
                  [
                    {
                      nativeEvent: {contentOffset: {y: scrollOffsetY}},
                    },
                  ],
                  {useNativeDriver: false},
                )}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                scrollEventThrottle={8}>
                <View style={{marginBottom: 60}}>
                  {items.map((option, index) => {
                    return renderDom(option, index, true);
                  })}
                </View>
              </Animated.ScrollView>
            ))}
        </View>
      }
      {isLoadingSkelton && (
        <View
          style={{
            width: Dimensions.get('window').width,
            position: 'absolute',
            top: 0,
            backgroundColor: appTheme.background,
            paddingTop: insets.top,
          }}>
          <ProductListSkelton showTab={false} />
        </View>
      )}
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
    </View>
  );
};

const styles = StyleSheet.create({
  // productInfoImageContainer: { flexDirection: "row", flexWrap: "nowrap", overflow: 'hidden', backgroundColor: clrs.white, position: "relative", borderRadius: 16, justifyContent: "center" },
  whishIcon: {
    width: '100%',
    height: undefined,
    maxHeight: 260,
    aspectRatio: 1 / 1,
  },
  productInfoItem: {lineHeight: 16, paddingLeft: 8},
  finalPriceblack: {
    lineHeight: 16,
    marginTop: 5,
    color: ResColors.blackShade,
    paddingLeft: 8,
  },
  rightspace: {
    marginRight: 4,
    // backgroundColor:"pink"
  },
  leftspace: {
    marginLeft: 4,
    //  backgroundColor:"blue"
  },
  header: {
    backgroundColor: 'whitesmoke',
    borderBottomWidth: 1,
    borderColor: 'gainsboro',
  },
  cardStyle: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    overflow: 'hidden',
    backgroundColor: ResColors.F4F4F4F4,
    position: 'relative',
    borderRadius: 16,
    justifyContent: 'center',
    marginRight: 0,
    marginLeft: 0,
  },
  headerWrap: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  ButtonViewStyles: {
    flex: 0.1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flexGrow: 1,
  },
  titleStyle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  productInfoPrice: {
    lineHeight: 16,
    marginTop: 5,
    color: clrs.pink_product_price,
  },
  productDiscRate: {
    lineHeight: 16,
    marginTop: 5,
    color: clrs.disc_rate_clr,
    textDecorationLine: 'line-through',
  },
});

export default ProductList;
