import {useLazyQuery} from '@apollo/client';
import {useNavigation} from '@react-navigation/native';
import React, {useContext, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
  Animated,
  ActivityIndicator,
  StatusBar,
  TouchableHighlight,
} from 'react-native';
import commonStyle from '../../../../../commonStyle';
import CustomPBar from '../../../../Components/CustomPBar';
import {Layout} from '../../../../Components/Layout';
import ProgressiveImage from '../../../../Components/ProgressiveImage';
import Helper from '../../../../Utils/Helper';
import {translate} from '../../../../locales';
import {CustomerOrderList} from '../../../../Queries/queries';
import clrs from '../../../../Utils/Colors';
import {Routes} from '../../../../Utils/NavigationRoutes';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import ResColors from '../../../../Utils/Colors';
import {AppContext} from '../../../AppContext';
import 'moment/src/locale/es';
import moment from 'moment';
import {FlatList} from 'react-native-gesture-handler';
import {useState} from 'react';
import {Icon} from 'react-native-elements';

const OrderHistory = () => {
  const {appTheme} = useContext(AppContext);

  const navigation = useNavigation();
  const [OrderList, {loading, error, data, fetchMore}] =
    useLazyQuery(CustomerOrderList);
  const notifaction = useSelector(
    (state: any) => state.OrderNotificationReducer,
  );
  const insets = useSafeAreaInsets();

  useEffect(() => {
    OrderList({
      variables: {
        currentPage: currentPage,
      },
    });
  }, []);

  useEffect(() => {
    console.log(
      '*************************: OrderHistory : notifaction :****************************',
    );
    OrderList({
      variables: {
        currentPage: currentPage,
      },
    });
  }, [notifaction]);

  function getFormatedDate(date) {
    let trLocale = require('moment/locale/es');
    moment.updateLocale('es', trLocale);
    const formattedDate = moment(date).format('MMMM DD, yyyy');
    return formattedDate;
  }

  const renderHeader = () => {
    return (
      <View
        style={{
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}>
        <Text
          style={[
            commonStyle.h2,
            commonStyle.fontBold,
            commonStyle.titlePageHeaderText,
            styles.titleinprofile,
            {color: appTheme.text},
          ]}>
          {translate('order.lbl_order_history')}
        </Text>
      </View>
    );
  };

  const renderItem = ({item}) => {
    return renderDom(item);
  };

  const renderDom = item => {
    if (item.status_code) {
      var bgColor = '';
      var OrderId = item.increment_id.match(/.{1,3}/g).join(' ');
      var orderType: String = item.shipping_method;
      //console.log( 'item.status_code -->', item.status_code )
      switch (item.status_code.toLowerCase()) {
        case 'finished':
          bgColor = clrs.Green;
          break;
        case 'complete':
          bgColor = clrs.Green;
          break;
        case 'canceled':
          bgColor = clrs.pink_product_price;
          break;
        case 'rejected':
          bgColor = clrs.pink_product_price;

          break;
        case 'delivered':
          bgColor = clrs.Green;
          break;
        case 'on_the_way' || 'ready_for_pickup':
          bgColor = clrs.DarkOrange;
          break;
        default:
          bgColor = clrs.Orange;
          break;
      }
      return (
        <TouchableOpacity
          key={item.increment_id}
          style={{marginHorizontal: 0, width: '100%', marginBottom: 40}}
          onPress={() => {
            Helper.HandleVibration();
            navigation.navigate(Routes.NAVIGATION_TO_ORDERHISTORYDETAIL, {
              id: item.increment_id,
            });
          }}>
          <View
            style={[
              styles.bg_container,
              {backgroundColor: appTheme.InputBoxBGColor},
            ]}></View>
          <View>
            <View style={styles.container_images}>
              {item.items.map((option, index) => {
                if (index < 4) {
                  return renderProductDom(option, index, item.items.length);
                }
              })}
            </View>
            <View style={styles.item_status_container}>
              <View style={{borderRadius: 8, backgroundColor: bgColor}}>
                <Text style={[styles.text_status]}>{item.status}</Text>
              </View>
              <Text style={[styles.text_Time, {color: appTheme.text}]}>
                {getFormatedDate(item.order_date)}
              </Text>
            </View>
            <View style={styles.item_top_container}>
              <Text
                style={[
                  styles.text_ID,
                  {color: appTheme.text},
                ]}>{`ID: ${OrderId}`}</Text>
              <Text style={[styles.text_price, {color: appTheme.text}]}>
                {Helper.currencyFormat(item.total.grand_total.value)}
              </Text>
            </View>
            <View style={styles.item_top_container}></View>
          </View>
        </TouchableOpacity>
      );
    }
  };

  const renderProductDom = (item: any, index: number, totalCount: number) => {
    return (
      <View style={styles.item_container} key={Math.random()}>
        {(index < 3 || totalCount < 5) && (
          <ProgressiveImage
            source={{uri: item.product_small_image + Helper.listImageSize}}
            style={styles.item_image}
          />
        )}
        {totalCount > 4 && index == 3 && (
          <Text style={[styles.text_item]}>{`+${totalCount - 3}`} </Text>
        )}
      </View>
    );
  };
  const [items, setItems] = useState(null);

  useEffect(() => {
    if (error) {
      //console.log( '=== error ===' );
      console.log(error);
    }
  }, [error]);

  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => {
    if (data) {
      //{"customer": {"__typename": "Customer", "orders": {"__typename": "CustomerOrders", "items": [Array], "page_info": [Object]}}}
      setItems(data.customer.orders.items);
      setTotal_pages(data.customer.orders.page_info.total_pages);
    }
  }, [data]);
  const [total_pages, setTotal_pages] = useState(1);

  // const loadMoreData = () => {
  //   console.log(
  //     currentPage,
  //     '====================================',
  //     total_pages,
  //   );
  //   if (isLoadingMore) {
  //     return;
  //   }
  //   if (currentPage < total_pages) {
  //     setIsLoadingMore(true);
  //     setCurrentPage(currentPage + 1);
  //   } else {
  //     return;
  //   }
  //
  //   fetchMore({
  //     variables: {
  //       currentPage: currentPage + 1,
  //     },
  //   }).then(fetchMoreResult => {
  //     setItems([...items, ...fetchMoreResult.data.customer.orders.items]);
  //     setIsLoadingMore(false);
  //   });
  // };


    const loadMoreData = async () => {
        console.log(currentPage, '===', total_pages);

        // Stop early if already loading or no more pages
        if (isLoadingMore || currentPage >= total_pages) return;

        setIsLoadingMore(true);

        try {
            const nextPage = currentPage + 1;

            const { data } = await fetchMore({
                variables: { currentPage: nextPage },
                // Optional but recommended: merge results directly in Apollo cache
                updateQuery: (previousResult, { fetchMoreResult }) => {
                    if (!fetchMoreResult?.customer?.orders?.items) return previousResult;

                    return {
                        ...fetchMoreResult,
                        customer: {
                            ...fetchMoreResult.customer,
                            orders: {
                                ...fetchMoreResult.customer.orders,
                                items: [
                                    ...previousResult.customer.orders.items,
                                    ...fetchMoreResult.customer.orders.items,
                                ],
                            },
                        },
                    };
                },
            });

            //  Safely extract new items
            const newItems = data?.customer?.orders?.items ?? [];

            if (newItems.length > 0) {
                //  Append new page of results
                setItems(prev => [...prev, ...newItems]);
                setCurrentPage(nextPage);
            } else {
                console.warn('No additional items returned for page', nextPage);
            }
        } catch (error) {
            console.error('Error loading more data:', error);
        } finally {
            // Always reset the loading flag
            setIsLoadingMore(false);
        }
    };


    const [isLoadingMore, setIsLoadingMore] = useState(false);
  const renderFooter = () => {
    try {
      // Check If Loading
      if (isLoadingMore) {
        return (
          <View style={[styles.container, styles.horizontal]}>
            <ActivityIndicator size="large" color={ResColors.Green} />
          </View>
        );
      } else {
        return (
          <View
            style={{backgroundColor: ResColors.transparent, height: 0}}></View>
        );
      }
    } catch (error) {
      //  console.log( error );
    }
  };

  return (
    <View
      style={{
        paddingLeft: 16,
        paddingRight: 16,
        flex: 1,
        backgroundColor: appTheme.background,
      }}>
      <View
        style={[
          styles.headerWrap,
          {
            position: 'absolute',
            top: Platform.OS === 'ios' ? insets.top : StatusBar.currentHeight,
            width: '100%',
            zIndex: 9999,
            backgroundColor: ResColors.transparent,
          },
        ]}>
        <StatusBar
          translucent={true}
          backgroundColor={ResColors.transparent}
          barStyle={appTheme.statusBar}
        />

        <TouchableHighlight
          style={[
            styles.ButtonViewStyles,
            {paddingTop: 5, paddingRight: 8, paddingBottom: 5, paddingLeft: 4},
          ]}
          onPress={() => {
            Helper.HandleVibration();
            navigation.goBack();
          }}
          underlayColor={ResColors.transparent}>
          <Icon
            name="arrow-left"
            type="font-awesome-5"
            color={appTheme.backiconColor}
            // onPress={() =>
            // {
            //   Helper.HandleVibration();
            //   navigation.goBack();
            // }}
          />
        </TouchableHighlight>
      </View>
      {renderHeader()}
      {
        // items && items.length > 0 &&
        // items.map( ( option, index ) =>
        // {

        //     return renderItem( option )
        // } )

        items && items.length > 0 && (
          <FlatList
            data={items}
            renderItem={renderItem}
            removeClippedSubviews={true}
            keyExtractor={item => item.sku}
            showsVerticalScrollIndicator={false}
            style={{flex: 1}}
            contentContainerStyle={[{backgroundColor: appTheme.background}]}
            onEndReached={loadMoreData}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            scrollEventThrottle={50}
          />
        )
      }
      {data && data.length == 0 && (
        <View>
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              height: Dimensions.get('window').height / 2,
            }}>
            <Text style={[commonStyle.h5, {color: appTheme.text}]}>
              {translate('order.lbl_no_order_found')}
            </Text>
          </View>
        </View>
      )}
      <CustomPBar showProgress={loading} />
    </View>
  );
};

export default OrderHistory;

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    justifyContent: 'center',
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
  horizontal: {
    // flexDirection: "row",
    justifyContent: 'space-around',
  },
  item_image: {
    aspectRatio: 1,
    resizeMode: 'stretch',
    borderRadius: Platform.OS === 'ios' ? 16 : 16,
    padding: 0,
    // paddingVertical:8,
    backgroundColor: ResColors.transparent,
  },
  bg_container: {
    backgroundColor: ResColors.SmokeWhite,
    borderRadius: 16,
    height: 140,
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
  container_images: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  item_container: {
    marginLeft: 16,
    // padding:8,
    borderRadius: Platform.OS === 'ios' ? 16 : 16,
    width: 60,
    aspectRatio: 1,
    shadowColor: 'black',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: {width: 0, height: 0},
    backgroundColor: ResColors.transparent,
    justifyContent: 'center',
  },
  text_item: {
    lineHeight: 28,
    fontSize: 18,
    color: 'rgba(36, 43, 45, 1)',
    fontWeight: '600',
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
  },

  item_top_container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 16,
    marginTop: 8,
    marginBottom: 4,
  },
  item_status_container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 16,
    marginTop: 20,
    marginBottom: 4,
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
  text_Time: {
    lineHeight: 16,
    fontSize: 11,
    paddingLeft: 10,
    color: ResColors.blackShade,
    fontWeight: '700',
    fontFamily: 'Inter-Regular',
  },
  text_ID: {
    lineHeight: 24,
    fontSize: 16,
    color: ResColors.blackShade,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
  },
  text_price: {
    lineHeight: 24,
    fontSize: 16,
    color: ResColors.blackShade,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
  },
  titleinprofile: {marginTop: 40, marginBottom: Platform.OS === 'ios' ? 0 : 30},
});
