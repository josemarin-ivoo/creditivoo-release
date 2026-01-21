import {useNavigation} from '@react-navigation/native';
import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import commonStyle from '../../../../../../commonStyle';
import ProgressiveImage from '../../../../../Components/ProgressiveImage';
import Helper from '../../../../../Utils/Helper';

import {Routes} from '../../../../../Utils/NavigationRoutes';
import WishlistButton from '../../../Wishlist/WishlistButton';
import ResColor from '../../../../../Utils/Colors';
import {AppContext} from '../../../../AppContext';
// add Frodriguez
import ImageResource from '../../../../../Utils/Image';
// end Frodriguez

// Used Category --> Product List
export const ProductCard = props => {
  const navigation = useNavigation();
  const {appTheme} = useContext(AppContext);
  const [isDark, setDark] = useState(appTheme.type === 'dark');
  useEffect(() => {
    setDark(appTheme.type === 'dark');
  }, [appTheme.type]);

  const item = props.item;
  const index = props.index;
  const isTrue = props.isTrue;
  //const global_data = useSelector((state: any) => state.commonReducer);

  const renderPrice = item => {
    if (
      item.price_range.minimum_price.regular_price.value != 0 &&
      item.price_range.minimum_price.regular_price.value !=
        item.price_range.minimum_price.final_price.value
    ) {
      return (
        <>
          <View>
            <Text
              style={[
                commonStyle.h6,
                styles.regularPrice,
                {color: isDark ? ResColor.white : ResColor.disc_rate_clr},
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
                styles.finalPrice,
                {color: ResColor.pink_product_price},
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
              {color: isDark ? ResColor.white : ResColor.blackShade},
            ]}>
            {Helper.currencyFormat(
              item.price_range.minimum_price.regular_price.value,
            )}
          </Text>
        </View>
      );
    }
  };

  // add Frodriguez - Financiación Creditivoo / Cashea
  const getAttrValue = code =>
    item?.additional_attributes?.find(
      a => String(a?.code || '').toLowerCase() === String(code).toLowerCase(),
    )?.value;

  const toBool = v => {
    if (v === true) return true;
    if (v === false || v == null) return false;
    const s = String(v).trim().toLowerCase();
    // return s === '1' || s === 'si' || s === 'sí' || s === 'yes' || s === 'true';
    return s != '1' && s != 'si' && s != 'sí' && s != 'yes' && s != 'true';
  };

  const rawFin = getAttrValue('financiable');
  const rawCashea = getAttrValue('cashea');

  const isFinanciable = toBool(rawFin);
  //   const isCashea = toBool(rawCashea);
  const isCashea = true;

  const finalPrice = item?.price_range?.minimum_price?.final_price?.value ?? 0;

  const inicialDesde = finalPrice * 0.4;
  const iniciaCashea = finalPrice * 0.5;
  // end Frodriguez

  return (
    <TouchableOpacity
      key={item.sku}
      style={[
        styles.cardWrapper,
        isTrue ? styles.listWrapper : styles.gridWrapper,
      ]}
      onPress={() => {
        Helper.HandleVibration();
        navigation.navigate(Routes.NAVIGATION_TO_PRODUCTDETAILS, {
          heading: item.name,
          id: item.sku,
          price: item.price_range.minimum_price.regular_price.value,
        });
      }}>
      <View
        style={[
          commonStyle.productCardMainContainer,
          isTrue ? {marginTop: 30} : null,
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
          <View style={styles.cardStyle}>
            {item.small_image != undefined && (
              <View>
                {isTrue ? (
                  <ProgressiveImage
                    source={{uri: item.small_image.url + Helper.gridImageSize}}
                    style={{
                      width: '100%',
                      height: undefined,
                      aspectRatio: 109 / 80,
                      resizeMode: 'contain',
                    }}
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
          </View>

          <WishlistButton
            SKU={item.sku}
            isLoading={load => {
              props.isLoading(load);
            }}
            pagetype={'other'}
            setLoginOverlay={login => {
              props.setLoginOverlay(login);
            }}
          />
        </View>
        <Text
          style={[
            commonStyle.h6,
            styles.itemName,
            {
              width: isTrue ? '100%' : Dimensions.get('window').width / 2 - 30,
              color: appTheme.text,
            },
          ]}>
          {item.name}{' '}
        </Text>
        <View style={[commonStyle.flexDir_Row]}>{renderPrice(item)}</View>

        {/* add Frodriguez - Labels financiación */}
        {isFinanciable && (
          <View style={styles.labelCreditivoo}>
            <ProgressiveImage
              source={
                appTheme.type === 'dark'
                  ? ImageResource.ic_isotipo_white
                  : ImageResource.ic_isotipo_white
              }
              style={styles.labelIcon}
              resizeMode="contain"
            />
            <Text style={styles.labelText}>
              Inicial desde {Helper.currencyFormat(inicialDesde)}
            </Text>
          </View>
        )}

        {isCashea && (
          <View style={styles.labelCashea}>
            <ProgressiveImage
              source={ImageResource.ic_cashea}
              style={styles.labelIcon}
              resizeMode="contain"
            />
            <Text style={styles.labelText}>
              Inicial desde {Helper.currencyFormat(iniciaCashea)}
            </Text>
          </View>
        )}
        {/* end Frodriguez */}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  rightspace: {
    marginRight: 4,
    //  backgroundColor:"red",
  },
  leftspace: {
    marginLeft: 4,
    //   backgroundColor:"black",
  },

  cardWrapper: {
    marginHorizontal: 0,
    marginBottom: 20,
    alignItems: 'center',
  },
  gridWrapper: {
    width: '50%',
  },
  listWrapper: {
    width: '100%',
  },
  cardStyle: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    overflow: 'hidden',
    backgroundColor: ResColor.F4F4F4F4,
    position: 'relative',
    borderRadius: 16,
    justifyContent: 'center',
    marginRight: 0,
    marginLeft: 0,
  },
  itemName: {
    lineHeight: 16,
    marginTop: 5,
    paddingLeft: 4,
  },
  regularPrice: {
    lineHeight: 16,
    marginTop: 5,
    color: ResColor.disc_rate_clr,
    textDecorationLine: 'line-through',
    paddingLeft: 4,
  },
  finalPrice: {
    lineHeight: 16,
    marginTop: 5,
    color: ResColor.pink_product_price,
    paddingLeft: 4,
  },
  finalPriceblack: {
    lineHeight: 16,
    marginTop: 5,
    color: ResColor.blackShade,
    paddingLeft: 4,
  },
  // add Frodriguez - styles labels
  labelCreditivoo: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#0add73',
    marginTop: 6,
  },
  labelCashea: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#fdfa3d',
    marginTop: 6,
  },
  labelIcon: {width: 14, height: 14, marginRight: 8},
  labelText: {fontSize: 11, fontWeight: '700', color: 'black'},
  // end Frodriguez
});
