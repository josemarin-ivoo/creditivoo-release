import { useLazyQuery } from '@apollo/client';
import { useNavigation } from '@react-navigation/native';
import React, { useContext, useEffect, useMemo, useState, useCallback } from 'react';
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
import { userWishlist, removeWishlist } from '../../../Queries/queries';
import ProgressiveImage from '../../../Components/ProgressiveImage';
import { translate } from '../../../locales';
import imgResources from '../../../Utils/Image';
import { Routes } from '../../../Utils/NavigationRoutes';
import ResorceColor from '../../../Utils/Colors';
import Helper from '../../../Utils/Helper';
import { useDispatch, useSelector } from 'react-redux';
import { FavItemDelete, FavItemAdd } from '../../../redux/wishlistreducers/favAction';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppContext } from '../../AppContext';
import Icon, { IconType } from 'react-native-dynamic-vector-icons';

const WishtList = () => {
  const { appTheme } = useContext(AppContext);
  const global_data = useSelector((state: any) => state.commonReducer);

  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [getWishlist, { loading, error, data }] = useLazyQuery(userWishlist);
  const [
    removeWishlistCall,
    { loading: removeLoading, error: removeError, data: removeData },
  ] = removeWishlist();

  const favitems = useSelector((state: any) => state.favItemReducer);
  const [wishlistArray, setwishlistArray] = useState<any[] | null>(null);

  const [Witemid, setWitemid] = useState(0);
  const [Wsku, setWsku] = useState<any>(0);

  // Normaliza el theme para evitar "appTheme es string"
  const theme = useMemo(() => {
    const t: any = appTheme;
    if (!t || typeof t === 'string') {
      return {
        type: 'light',
        text: '#000',
        background: '#fff',
      };
    }
    return t;
  }, [appTheme]);

  //goBack si se puede, si no fallback a Cart
  const handleBack = useCallback(() => {
    Helper.HandleVibration();

    // @ts-ignore
    if (navigation?.canGoBack?.()) {
      // @ts-ignore
      navigation.goBack();
      return;
    }

    // Fallback cuando Wishlist se abrió sin historial real
    // @ts-ignore
    navigation.navigate(Routes.NAVIGATION_TO_CART);
  }, [navigation]);

  const removeWishlistItem = (id: any, sku: any, item: any) => {
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

  // Al remover, actualiza redux
  useEffect(() => {
    if (removeData?.removeProductsFromWishlist) {
      dispatch(FavItemDelete(Wsku, Witemid));
    }
  }, [removeData, dispatch, Wsku, Witemid]);

  // Al cargar wishlist, mete items al reducer
  useEffect(() => {
    if (data?.customer?.wishlist?.items?.length) {
      data.customer.wishlist.items.forEach((p: any) => {
        dispatch(FavItemAdd(p.product.sku, p.id, p.product));
      });
    }
  }, [data, dispatch]);

  // Carga desde redux si hay; si no, pega al API
  useEffect(() => {
    if (favitems?.FAVITEMS?.length > 0) {
      setwishlistArray(favitems.FAVITEMS);
    } else {
      getWishlist();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mantén lista local sincronizada
  useEffect(() => {
    setwishlistArray(favitems?.FAVITEMS ?? []);
  }, [favitems]);

  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    getWishlist();
    setTimeout(() => setRefreshing(false), 1200);
  }, [getWishlist]);

  const renderPrice = (item: any) => {
    const min = item?.product?.price_range?.minimum_price;
    const regular = min?.regular_price?.value ?? 0;
    const final = min?.final_price?.value ?? 0;

    if (regular !== 0 && regular !== final) {
      return (
        <View style={{ flexDirection: 'row' }}>
          <View style={{ marginRight: 10 }}>
            <Text
              style={[
                commonStyle.h6,
                styles.regularPrice,
                {
                  color:
                    theme.type === 'dark' || theme.type === 'green'
                      ? ResorceColor.white
                      : ResorceColor.disc_rate_clr,
                },
              ]}>
              {Helper.currencyFormat(regular)}
            </Text>
          </View>
          <View>
            <Text style={[commonStyle.h6, commonStyle.fontBold, styles.finalPrice]}>
              {Helper.currencyFormat(final)}
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View>
        <Text
          style={[
            commonStyle.h6,
            commonStyle.fontBold,
            styles.finalPriceblack,
            { color: theme.type === 'dark' ? ResorceColor.white : ResorceColor.blackShade },
          ]}>
          {Helper.currencyFormat(regular)}
        </Text>
      </View>
    );
  };

  const renderDom = (item: any, index: number, isTrue: boolean) => {
    return (
      <TouchableOpacity
        key={String(item?.id ?? index)}
        onPress={() => {
          Helper.HandleVibration();
          // Esto debe llegar a ProductDetails dentro del mismo stack
          // @ts-ignore
          navigation.navigate(Routes.NAVIGATION_TO_PRODUCTDETAILS, {
            id: item.product.sku,
          });
        }}
        activeOpacity={0.9}>
        <View style={[commonStyle.productCardMainContainer]}>
          <View
            style={[
              commonStyle.productCardImageContainer,
              { backgroundColor: isTrue ? ResorceColor.F4F4F4F4 : undefined },
            ]}>
            <View
              style={[
                isTrue
                  ? null
                  : [
                    index % 2 === 0 ? styles.rightspace : styles.leftspace,
                    {
                      width: Dimensions.get('window').width / 2 - 20,
                      height: Dimensions.get('window').width / 2 - 20,
                    },
                  ],
              ]}>
              {item?.product?.small_image?.url ? (
                <View style={styles.cardStyle}>
                  {isTrue ? (
                    <ProgressiveImage
                      source={{ uri: item.product.small_image.url + Helper.cardImageSize }}
                      style={{
                        width: '100%',
                        height: undefined,
                        aspectRatio: 109 / 80,
                        resizeMode: 'contain',
                      }}
                    />
                  ) : (
                    <ProgressiveImage
                      source={{ uri: item.product.small_image.url + Helper.gridImageSize }}
                      style={{
                        width: Dimensions.get('window').width / 2 - 20,
                        height: Dimensions.get('window').width / 2 - 20,
                      }}
                      resizeMode="cover"
                    />
                  )}
                </View>
              ) : null}
            </View>

            <View style={[commonStyle.wishlistImage]}>
              <TouchableOpacity
                onPress={() => removeWishlistItem(item.id, item.product.sku, item)}
                activeOpacity={0.85}>
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
                width: isTrue ? '100%' : Dimensions.get('window').width / 2 - 20,
                color: theme.text,
              },
            ]}
            numberOfLines={2}>
            {item?.product?.name}
          </Text>

          <View style={[commonStyle.flexDir_Row]}>
            <View style={[commonStyle.marginRight_10]}>{renderPrice(item)}</View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item, index }: any) => renderDom(item, index, false);

  return (
    <View style={[styles.mainContainer, { backgroundColor: theme.background }]}>
      <StatusBar
        translucent
        backgroundColor={theme.type === 'dark' ? theme.background : ResorceColor.transparent}
        barStyle={theme.type === 'dark' ? 'light-content' : 'dark-content'}
      />

      <View
        style={[
          commonStyle.flex_1,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}>
        <View style={[commonStyle.padding_16]}>
          {/* Header con back izquierda + título centrado */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={handleBack}
              style={styles.backBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.85}>
              <Icon name="arrow-left" type={IconType.Feather} size={22} color={theme.text} />
            </TouchableOpacity>

            <Text
              style={[commonStyle.h2, commonStyle.fontBold, { color: theme.text }]}
              numberOfLines={1}>
              {translate('wishlist.lbl_favourites')}
            </Text>

            {/* Spacer para centrar visualmente el título */}
            <View style={styles.rightSpacer} />
          </View>

          {wishlistArray &&
            (wishlistArray.length === 0 ? (
              <View>
                <Text
                  style={[
                    commonStyle.h5,
                    { color: theme.text, textAlign: 'center', marginTop: 40 },
                  ]}>
                  {translate('products.lbl_no_product_found')}
                </Text>
              </View>
            ) : wishlistArray.length > 5 ? (
              <FlatList
                data={wishlistArray}
                renderItem={renderItem}
                numColumns={2}
                contentContainerStyle={[commonStyle.productListcontentContainerStyle]}
                onRefresh={onRefresh}
                refreshing={refreshing}
                columnWrapperStyle={[commonStyle.justifyContent_space_between]}
              />
            ) : (
              <ScrollView
                removeClippedSubviews
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.cardBackgroundStyle}
                refreshControl={
                  <RefreshControl
                    progressViewOffset={insets.top}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                  />
                }
                style={{ marginBottom: insets.bottom + 30 }}>
                {wishlistArray.map((option: any, index: number) => renderDom(option, index, true))}
              </ScrollView>
            ))}

          <CustomPBar showProgress={removeLoading || loading} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: ResorceColor.white },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  rightSpacer: { width: 44, height: 44 },
  productTextStyle: { lineHeight: 16, marginTop: 5, paddingLeft: 4 },
  regularPrice: {
    lineHeight: 16,
    marginTop: 5,
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
    paddingLeft: 4,
  },
  rightspace: { marginRight: 4 },
  leftspace: { marginLeft: 4 },
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
  cardBackgroundStyle: {
    paddingBottom: 16,
  },
});

export default WishtList;