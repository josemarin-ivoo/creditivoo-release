/* eslint-disable prettier/prettier */
import {Image, View} from 'react-native';
import {Badge, Icon, withBadge} from 'react-native-elements';
import React, {useContext, useState} from 'react';
import ResColor from '../Utils/Colors';
import {useSelector, shallowEqual} from 'react-redux';
import {useEffect} from 'react';
import {TouchableHighlight} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import {Text, StyleSheet} from 'react-native';
import commonStyle from '../../commonStyle';
import {translate} from '../locales';
import {AppContext} from '../Pages/AppContext';
import Helper from '../Utils/Helper';
import {GetDeliveryCharge} from '../Queries/queries';
import {useLazyQuery} from '@apollo/client';
import {useQuery} from '@apollo/client';

export const PriceControl = props => {
  const payType = props.payType == undefined ? '' : props.payType;
  const {appTheme} = useContext(AppContext);
  const [DeliveryCharge, setDeliveryCharge] = useState('');
  const [Discount, setDiscount] = useState('');
  const [GrandTotal, setGrandTotal] = useState('');
  const [subTotal, setsubTotal] = useState('');
  const [ServiceFees, setServiceFees] = useState('');

  const {
    loading: loadingB,
    error: errorB,
    data: deliveryData,
  } = useQuery(GetDeliveryCharge, {errorPolicy: 'all'});

  useEffect(() => {
    if (deliveryData) {
      var discAmt = 0;

      let _setDeliveryCharge = 0;
      deliveryData.customerCart.shipping_addresses.length > 0 &&
        deliveryData.customerCart.shipping_addresses[0]
          .selected_shipping_method &&
        ((_setDeliveryCharge =
          deliveryData.customerCart.shipping_addresses[0]
            .selected_shipping_method.amount.value),
        setDeliveryCharge(
          Helper.currencyFormat(
            deliveryData.customerCart.shipping_addresses[0]
              .selected_shipping_method.amount.value,
          ),
        ));

      setsubTotal(
        Helper.currencyFormat(
          deliveryData.customerCart.prices.subtotal_excluding_tax.value,
        ),
      );

      deliveryData && deliveryData.customerCart.prices.discounts
        ? (setDiscount(
            Helper.currencyFormat(
              deliveryData.customerCart.prices.discounts[0].amount.value,
            ),
          ),
          (discAmt =
            deliveryData.customerCart.prices.discounts[0].amount.value))
        : setDiscount(Helper.currencyFormat(0));

      if (payType === '') {
        setGrandTotal(
          Helper.currencyFormat(
            deliveryData.customerCart.prices.grand_total.value,
          ),
        );

        deliveryData.customerCart.prices.payment_fee &&
          setServiceFees(
            Helper.currencyFormat(
              deliveryData.customerCart.prices.payment_fee.value,
            ),
          );
      } else {
        if (
          deliveryData.customerCart.available_payment_methods.filter(
            item => props.payType === item.code,
          ).length > 0
        ) {
          if (
            deliveryData.customerCart.available_payment_methods.filter(
              item => props.payType === item.code,
            )[0].payment_fee.length > 0
          ) {
            var st = deliveryData.customerCart.available_payment_methods.filter(
              item => props.payType === item.code,
            );
            setServiceFees(
              Helper.currencyFormat(Number(st[0].payment_fee[0].value)),
            );

            setGrandTotal(
              Helper.currencyFormat(
                Number(
                  deliveryData.customerCart.prices.subtotal_excluding_tax
                    .value +
                    _setDeliveryCharge +
                    Number(st[0].payment_fee[0].value - discAmt),
                ),
              ),
            );
          } else {
            setServiceFees(Helper.currencyFormat(0));
          }
        }
      }
    } else {
      setDeliveryCharge(Helper.currencyFormat(0));
    }
  }, [deliveryData]);

  return (
    <View>
      {
        <View style={{backgroundColor: appTheme.InputBoxBGColor, padding: 16}}>
          {
            <>
              {
                <View style={{flexDirection: 'column'}}>
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
                        {color: appTheme.text, fontWeight: '600'},
                      ]}>
                      Monto inicial
                    </Text>
                    <Text style={[commonStyle.h6, {color: appTheme.text}]}>
                      {subTotal}
                    </Text>
                  </View>
                </View>
              }
              {DeliveryCharge != '$0.00' && (
                <View style={{flexDirection: 'column'}}>
                  <View style={[styles.amountContainer]}>
                    <Text
                      style={[
                        commonStyle.h6,
                        {color: appTheme.text, fontWeight: '600'},
                      ]}>
                      {translate('checkout.lbl_deliveryfee')}{' '}
                    </Text>
                    <Text style={[commonStyle.h6, {color: appTheme.text}]}>
                      {DeliveryCharge}{' '}
                    </Text>
                  </View>
                </View>
              )}
              {ServiceFees != '$0.00' && (
                <View style={{flexDirection: 'column'}}>
                  <View
                    style={[
                      {
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      },
                    ]}>
                    <Text style={[commonStyle.h6, {color: appTheme.text}]}>
                      Servicio
                    </Text>
                    <Text style={[commonStyle.h6, {color: appTheme.text}]}>
                      {' '}
                      {ServiceFees}
                    </Text>
                  </View>
                </View>
              )}
              {Discount != '$0.00' && (
                <View style={{flexDirection: 'column', marginBottom: 10}}>
                  <View style={[styles.amountContainer]}>
                    <Text
                      style={[
                        commonStyle.h6,
                        {color: appTheme.text, fontWeight: '700'},
                      ]}>
                      Código de Promo
                    </Text>
                    <Text
                      style={[
                        commonStyle.h6,
                        {color: ResColor.pink_product_price, fontWeight: '700'},
                      ]}>
                      {Discount}
                    </Text>
                  </View>
                </View>
              )}
              {
                <View style={{flexDirection: 'column'}}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
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
                        commonStyle.fontBold,
                        {color: ResColor.pink_product_price},
                      ]}>
                      {GrandTotal}
                    </Text>
                  </View>
                </View>
              }
            </>
          }
        </View>
      }
    </View>
  );
};

const styles = StyleSheet.create({
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
