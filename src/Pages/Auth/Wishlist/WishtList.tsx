import {useLazyQuery} from '@apollo/client';
import {useNavigation} from '@react-navigation/native';
import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
  ScrollView,
  Dimensions,
  RefreshControl,
} from 'react-native';
import commonStyle from '../../../../commonStyle';
import CustomPBar from '../../../Components/CustomPBar';
import {userWishlist, removeWishlist} from '../../../Queries/queries';
import ProgressiveImage from '../../../Components/ProgressiveImage';
import {translate} from '../../../locales';
import imgResources from '../../../Utils/Image';
import {Routes} from '../../../Utils/NavigationRoutes';
import ResorceColor from '../../../Utils/Colors';
import Helper from '../../../Utils/Helper';
import {useDispatch, useSelector} from 'react-redux';
import {FavItemDelete} from '../../../redux/wishlistreducers/favAction';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AppContext} from '../../AppContext';
import {FavItemAdd} from './../../../redux/wishlistreducers/favAction';

const WishtList = () => {
  const {appTheme} = useContext(AppContext);
  const global_data = useSelector((state: any) => state.commonReducer);

  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [getWishlist, {loading, error, data}] = useLazyQuery(userWishlist);
  const [
    removeWishlistCall,
    {loading: removeLoading, error: removeError, data: removeData},
  ] = removeWishlist();

  const favitems = useSelector((state: any) => state.favItemReducer);

  const [wishlistArray, setwishlistArray] = useState(null);

  const [Witemid, setWitemid] = useState(0);
  const [Wsku, setWsku] = useState(0);

  const removeWishlistItem = (id: any, sku, item) => {
    Helper.HandleVibration();

    setWitemid(id);
    setWsku(sku);

    removeWishlistCall({
      variables: {
        wishlistId: global_data.wishListId,
        ItemsId: item.pid,
      },
    });
  };

  useEffect(() => {
    if (removeData) {
      if (removeData.removeProductsFromWishlist) {
        dispatch(FavItemDelete(Wsku, Witemid));
      }
    }
  }, [removeData]);

  useEffect(() => {
    if (data) {
      data.customer.wishlist.items.map(product => {
        dispatch(FavItemAdd(product.product.sku, product.id, product.product));
      });
    }
  }, [data]);

  useEffect(() => {
    favitems.FAVITEMS.length > 0
      ? setwishlistArray(favitems.FAVITEMS)
      : getWishlist();
  }, [navigation]);

  useEffect(() => {
    console.log(favitems.FAVITEMS);
    setwishlistArray(favitems.FAVITEMS);
  }, [favitems]);

  const renderDom = (item: any, index, isTrue) => {
    return (
      <TouchableOpacity
        key={index}
        onPress={() => {
          Helper.HandleVibration();
          navigation.navigate(Routes.NAVIGATION_TO_PRODUCTDETAILS, {
            id: item.product.sku,
          });
        }}>
        <View style={[commonStyle.productCardMainContainer]}>
          <View
            style={[
              commonStyle.productCardImageContainer,
              {backgroundColor: isTrue ? ResorceColor.F4F4F4F4 : null},
            ]}>
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
              {item.product.small_image != undefined && (
                <View style={styles.cardStyle}>
                  {isTrue ? (
                    <ProgressiveImage
                      source={{
                        uri:
                          item.product.small_image.url + Helper.cardImageSize,
                      }}
                      style={{
                        width: '100%',
                        height: undefined,
                        aspectRatio: 109 / 80,
                        resizeMode: 'contain',
                      }}
                    />
                  ) : (
                    <ProgressiveImage
                      source={{
                        uri:
                          item.product.small_image.url + Helper.gridImageSize,
                      }}
                      style={{
                        width: Dimensions.get('window').width / 2 - 20,
                        height: Dimensions.get('window').width / 2 - 20,
                      }}
                      resizeMode="cover"
                    />
                  )}
                </View>
              )}
            </View>
            <View style={[commonStyle.wishlistImage]}>
              <TouchableOpacity
                onPress={() =>
                  removeWishlistItem(item.id, item.product.sku, item)
                }>
                <ProgressiveImage
                  source={imgResources.ic_wishlist_active}
                  style={[commonStyle.he_wi_30]}
                  resizeMode="stretch"
                />
              </TouchableOpacity>
            </View>
          </View>
          <Text
            style={[
              commonStyle.h6,
              styles.productTextStyle,
              {
                width: isTrue
                  ? '100%'
                  : Dimensions.get('window').width / 2 - 20,
                color: appTheme.text,
              },
            ]}>
            {item.product.name}
          </Text>
          <View style={[commonStyle.flexDir_Row]}>
            <View style={[commonStyle.marginRight_10]}>
              {renderPrice(item)}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderItem = ({item, index}) => {
    return renderDom(item, index, false);
  };
  const renderPrice = item => {
    if (
      item.product.price_range.minimum_price.regular_price.value != 0 &&
      item.product.price_range.minimum_price.regular_price.value !=
        item.product.price_range.minimum_price.final_price.value
    ) {
      return (
        <View style={{flexDirection: 'row'}}>
          <View style={{marginRight: 10}}>
            <Text
              style={[
                commonStyle.h6,
                styles.regularPrice,
                {
                  color:
                    appTheme.type === 'dark'
                      ? ResorceColor.white
                      : appTheme.type === 'green'
                      ? ResorceColor.white
                      : ResorceColor.disc_rate_clr,
                },
              ]}>
              {Helper.currencyFormat(
                item.product.price_range.minimum_price.regular_price.value,
              )}
            </Text>
          </View>
          <View>
            <Text
              style={[commonStyle.h6, commonStyle.fontBold, styles.finalPrice]}>
              {Helper.currencyFormat(
                item.product.price_range.minimum_price.final_price.value,
              )}
            </Text>
          </View>
        </View>
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
                    ? ResorceColor.white
                    : ResorceColor.blackShade,
              },
            ]}>
            {Helper.currencyFormat(
              item.product.price_range.minimum_price.regular_price.value,
            )}
          </Text>
        </View>
      );
    }
  };
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    getWishlist();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, [refreshing]);

  return (
    <View
      style={[styles.mainContainer, {backgroundColor: appTheme.background}]}>
      <StatusBar
        translucent={true}
        backgroundColor={
          appTheme.type === 'dark'
            ? appTheme.background
            : ResorceColor.transparent
        }
        barStyle={appTheme.type === 'dark' ? 'light-content' : 'dark-content'}
      />
      <View
        style={[
          commonStyle.flex_1,
          {paddingTop: insets.top, paddingBottom: insets.bottom},
        ]}>
        <View style={[commonStyle.padding_16]}>
          <Text
            style={[
              commonStyle.h2,
              commonStyle.fontBold,
              commonStyle.marginBottom_10,
              {color: appTheme.text},
            ]}>
            {translate('wishlist.lbl_favourites')}
          </Text>
          {wishlistArray &&
            (wishlistArray.length == 0 ? (
              <View>
                <Text
                  style={[
                    commonStyle.h5,
                    {color: appTheme.text, textAlign: 'center', marginTop: 40},
                  ]}>
                  {translate('products.lbl_no_product_found')}
                </Text>
              </View>
            ) : wishlistArray.length > 5 ? (
              <FlatList
                data={wishlistArray}
                renderItem={renderItem}
                numColumns={2}
                contentContainerStyle={[
                  commonStyle.productListcontentContainerStyle,
                ]}
                onRefresh={() => onRefresh()}
                refreshing={refreshing}
                columnWrapperStyle={[commonStyle.justifyContent_space_between]}
              />
            ) : (
              <ScrollView
                removeClippedSubviews={true}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.cardBackgroundStyle}
                refreshControl={
                  <RefreshControl
                    progressViewOffset={insets.top}
                    refreshing={false}
                    onRefresh={onRefresh}
                  />
                }
                style={{marginBottom: insets.bottom + 30}}>
                {wishlistArray.map((option, index) => {
                  return renderDom(option, index, true);
                })}
              </ScrollView>
            ))}
          <CustomPBar showProgress={removeLoading} />
        </View>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  productTextStyle: {lineHeight: 16, marginTop: 5, paddingLeft: 4},
  RegularPriceText: {
    lineHeight: 16,
    marginTop: 5,
    color: ResorceColor.disc_rate_clr,
    textDecorationLine: 'line-through',
    paddingLeft: 4,
  },
  mainContainer: {flex: 1, backgroundColor: ResorceColor.white},
  regularPrice: {
    lineHeight: 16,
    marginTop: 5,
    color: ResorceColor.disc_rate_clr,
    textDecorationLine: 'line-through',
    paddingLeft: 4,
  },
  finalPrice: {
    lineHeight: 16,
    marginTop: 5,
    color: ResorceColor.pink_product_price,
    paddingLeft: 4,
  },
  finalPriceblack: {
    lineHeight: 16,
    marginTop: 5,
    color: ResorceColor.blackShade,
    paddingLeft: 4,
  },
  rightspace: {
    marginRight: 4,
  },
  leftspace: {
    marginLeft: 4,
  },
  cardStyle: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    overflow: 'hidden',
    backgroundColor: ResorceColor.F4F4F4F4,
    position: 'relative',
    borderRadius: 16,
    justifyContent: 'center',
    marginRight: 0,
    marginLeft: 0,
  },

  productInfoItem: {lineHeight: 16, width: 150, paddingLeft: 8},
  cardBackgroundStyle: {
    color: ResorceColor.blackShade,
    fontFamily: 'Gilroy-Regular',
  },
});

export default WishtList;
