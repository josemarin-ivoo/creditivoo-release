/* eslint-disable prettier/prettier */
import {CART_ID, DELETE_CART_ID} from './actionTypes';

export const cartAction = (value) => {
  return {
    type: CART_ID,
    payload: value,
  };
};
export const cartDelete = () => {
  return {
    type: DELETE_CART_ID,
  };
};
