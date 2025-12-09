/* eslint-disable prettier/prettier */
import { CARTCacheUpdated, CART_APPLIED_COUPON_DATA, CART_COUPON_DATA, CART_ITEMS, CLEAR_CART_ITEMS } from '../actionTypes';
import { CART_ActiveCouponsData } from '../actionTypes';
import { CART_CouponsRemoveData } from '../actionTypes';
import { DELETE_CART_ITEMS } from '../actionTypes';
 

export const ISCARTCacheUpdated = ( value, time ) =>
{
  return {
    type: CARTCacheUpdated,
    payload: { isUpdated: value, expTime: time },
  };
};

export const CARTItemAdd = (value) => {
  return {
    type: CART_ITEMS,
    payload: value,
  };
};
export const ADD_CART_APPLIED_COUPON_DATA = (value) => {
  return {
    type: CART_APPLIED_COUPON_DATA,
    payload: value,
  };
};

export const ADD_CART_ActiveCouponsData = (value) => {
  return {
    type: CART_ActiveCouponsData,
    payload: value,
  };
};
export const ADD_CART_CouponsRemoveData = (value) => {
  return {
    type: CART_CouponsRemoveData,
    payload: value,
  };
};
export const DELETE_CARTITEMS = (value) => {
  return {
    type: DELETE_CART_ITEMS,
    payload: value,
  };
};
export const Clear_CARTITEMS = (value) => {
  return {
    type: CLEAR_CART_ITEMS,
  };
};


