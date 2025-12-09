/* eslint-disable prettier/prettier */
import { CHECKOUTAddressONCart, CHECKOUTInventoryDATA } from '../actionTypes';
import { CHECKOUTCacheUpdated } from './../actionTypes';
import { CLEAR_CHECKOUT } from './../actionTypes';
 


export const ISAddressONCart = ( value, time ) =>
{
  return {
    type: CHECKOUTAddressONCart,
    payload: value,
  };
};

export const ISCHECKOUTCacheUpdated = ( value, time ) =>
{
  return {
    type: CHECKOUTCacheUpdated,
    payload: { isUpdated: value, expTime: time },
  };
};

export const InventoryDATA = (value) => {
  return {
    type: CHECKOUTInventoryDATA,
    payload: value,
  };
};

export const ClearCHECKOUT = (value) => {
  return {
    type: CLEAR_CHECKOUT,
    payload: value,
  };
};


