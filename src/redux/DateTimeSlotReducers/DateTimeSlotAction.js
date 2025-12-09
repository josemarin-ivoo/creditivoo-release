/* eslint-disable prettier/prettier */
import { CARTCacheUpdated, CART_APPLIED_COUPON_DATA, CART_COUPON_DATA, CART_ITEMS, CLEAR_DATETIME, CLEAR_DATETIMESLOT, DATETIMESLOTCacheUpdated } from '../actionTypes';
import { CART_ActiveCouponsData } from '../actionTypes';
import { CART_CouponsRemoveData } from '../actionTypes';
import { DELETE_CART_ITEMS } from '../actionTypes';
import { DATETIMESLOTDATA } from './../actionTypes';
 

export const ISDATETIMESLOTCacheUpdated = ( value, time ) =>
{
  return {
    type: DATETIMESLOTCacheUpdated,
    payload: { isUpdated: value, expTime: time },
  };
};

export const DATETIMESLOTDATAAdd = (value) => {
  return {
    type: DATETIMESLOTDATA,
    payload: value,
  };
};
export const DELETE_DATETIMESLOT = (value) => {
  return {
    type: CLEAR_DATETIMESLOT,
    payload: value,
  };
};


