/* eslint-disable prettier/prettier */
import {CART_ITEM_COUNTER} from './actionTypes';

export const CartItemCounterAction = (value) => {
  return {
    type: CART_ITEM_COUNTER,
    payload: value,
  };
};
