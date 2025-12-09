import {useLazyQuery} from '@apollo/client';
import {useNavigation} from '@react-navigation/native';
import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  StyleSheet,
  Platform,
  Dimensions,
  RefreshControl,
} from 'react-native';
import commonStyle from '../../../../../commonStyle';
import CustomPBar from '../../../../Components/CustomPBar';
import ProgressiveImage from '../../../../Components/ProgressiveImage';
import Helper from '../../../../Utils/Helper';
import {translate} from '../../../../locales';
import {CustomerOrderProducts} from '../../../../Queries/queries';
import {Routes} from '../../../../Utils/NavigationRoutes';
import ResColors from '../../../../Utils/Colors';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AppContext} from '../../../AppContext';
import {useDispatch, useSelector} from 'react-redux';
import {CLEAR_ORDERED_PRODUCTS} from '../../../../redux/actionTypes';
import {TouchableHighlight} from 'react-native-gesture-handler';
import {Icon} from 'react-native-elements';

const OrderedProduct = () => {
  const navigation = useNavigation();
  const {appTheme} = useContext(AppContext);
  const dispatch = useDispatch();
  const OrderedProductdata = useSelector(
    (state: any) => state.OrderedProductReducer,
  );
  const [refreshing, setRefreshing] = useState(false);

  const [OrderList, {loading, error, data}] = useLazyQuery(
    CustomerOrderProducts,
  );

  const [orderedProductList, setorderedProductList] = useState([]);

  useEffect(() => {
    if (OrderedProductdata.orderedProducts.length == 0) {
      OrderList();
    } else {
      setorderedProductList(OrderedProductdata.orderedProducts.orderedProducts);
      dispatch({type: CLEAR_ORDERED_PRODUCTS});
    }
    ////  dispatch( { type: CLEAR_ORDERED_PRODUCTS } );
  }, []);

  useEffect(() => {
    if (data) {
      if (data.customer.orders.items.length > 0) {
        var products = [];
        for (let i = 0; i < data.customer.orders.items.length; i++) {
          let order = data.customer.orders.items[i];
          for (let index = 0; index < order.items.length; index++) {
            const element = order.items[index];

            const isExist = products.some(
              item => item.product_sku == element.product_sku,
            );
            if (!isExist) {
              products = products.concat(element);
            }
          }
        }
        setorderedProductList(products);
      }
    }
  }, [data]);

  const goToNext = (option: any) => {
    //Helper.HandleVibration();
    navigation.navigate(Routes.NAVIGATION_TO_PRODUCTDETAILS, {
      heading: option.product_name,
      id: option.product_sku,
    }); //"ProductDetails"
  };

  const renderDom = (option, index) => {
    return (
      <TouchableOpacity
        key={index}
        style={styles.renderDomContainer}
        onPress={() => goToNext(option)}>
        <View style={{flex: 0.24, borderRadius: 16, width: 90, height: 90}}>
          <ProgressiveImage
            source={{uri: option.product_small_image + Helper.listImageSize}}
            style={{width: 88, height: 88, borderRadius: 16}}
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
                {maxWidth: '100%', color: appTheme.text},
              ]}>
              {option.product_name}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            {/* <Text style={[commonStyle.h6, commonStyle.fontBold, { color: "green" }]}> {translate( 'cart.lbl_qty' )}: {option.quantity_ordered}</Text> */}
            <View>
              <Text
                style={[
                  commonStyle.h6,
                  commonStyle.fontBold,
                  {color: appTheme.text},
                ]}>
                {Helper.currencyFormat(option.product_sale_price.value)}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderItem = item => {
    return renderDom(item, item.index);
  };
  const insets = useSafeAreaInsets();

  const renderHeader = () => {
    return (
      <View
        style={{
          paddingTop: insets.top + 20,
          paddingLeft: 24,
          paddingRight: 16,
        }}>
        <Text
          style={[
            commonStyle.h2,
            commonStyle.fontBold,
            commonStyle.titlePageHeaderText,
            styles.titlein,
            {color: appTheme.text},
          ]}>
          {translate('profile.lbl_ordered_products')}
        </Text>
      </View>
    );
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    OrderList();

    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, [refreshing]);

  return (
    <View style={{flex: 1, backgroundColor: appTheme.background}}>
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
          />
        </TouchableHighlight>
      </View>
      {renderHeader()}

      {
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
          <View
            style={{
              paddingHorizontal: 24,
              backgroundColor: appTheme.background,
            }}>
            {orderedProductList &&
              orderedProductList.length > 0 &&
              orderedProductList.map((option, index) => {
                return renderItem(option);
              })}
          </View>
        </ScrollView>
      }
      {orderedProductList && orderedProductList.length == 0 && !loading && (
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            height: Dimensions.get('window').height / 2,
          }}>
          <Text style={[commonStyle.h5, {padding: 16, color: appTheme.text}]}>
            {translate('products.lbl_no_product_found')}
          </Text>
        </View>
      )}
      <CustomPBar showProgress={loading} />
    </View>
  );
};

export default OrderedProduct;

const styles = StyleSheet.create({
  headerWrap: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  ButtonViewStyles: {
    flex: 0.1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text_header: {
    marginTop: 8,
  },

  item_image: {
    aspectRatio: 1,
    resizeMode: 'stretch',
    borderRadius: 8,
    padding: 8,
    paddingVertical: 8,
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
    padding: 8,
    borderRadius: 16,
    width: 68,
    aspectRatio: 1,
    shadowColor: 'black',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: {width: 0, height: 0},
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
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
    fontWeight: '600',
    fontFamily: 'Inter-Bold',
  },
  text_price: {
    lineHeight: 24,
    fontSize: 16,
    color: ResColors.blackShade,
    fontWeight: '600',
    fontFamily: 'Inter-Bold',
  },
  renderDomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  titlein: {marginTop: 30, marginBottom: 10},
});
