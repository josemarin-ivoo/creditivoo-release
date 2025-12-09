/* eslint-disable prettier/prettier */
import {Image, View} from 'react-native';
import {Badge} from 'react-native-elements';
import React from 'react';
import imageResource from '../../Utils/Image';
import {useSelector, shallowEqual} from 'react-redux';

export const CartIcon = props => {
  const isCart = useSelector(
    ({CartItemCounterReducer: {CART_ITEM_COUNTER: isCart}}) => isCart,
    shallowEqual,
  );
  return (
    <View>
      {props.focused === true ? (
        <Image
          source={
            props.theme.type == 'green'
              ? imageResource.ic_cart_white
              : imageResource.ic_cart_green
          }
          resizeMode="stretch"
        />
      ) : (
        <Image
          source={
            props.theme.type == 'light'
              ? imageResource.ic_cart
              : props.theme.type == 'dark'
              ? imageResource.ic_cart_dark
              : imageResource.ic_cart_green
          }
          resizeMode="stretch"
        />
      )}
      {isCart && (
        <Badge
          status="error"
          containerStyle={[
            props.focused === true
              ? {position: 'absolute', right: 0, top: 0}
              : {position: 'absolute', right: 0},
          ]}
        />
      )}
    </View>
  );
};
