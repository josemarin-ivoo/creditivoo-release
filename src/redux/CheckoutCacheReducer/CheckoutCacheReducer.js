/* eslint-disable prettier/prettier */

import { CARTCacheUpdated, CART_APPLIED_COUPON_DATA, CHECKOUTAddressONCart, CHECKOUTInventoryDATA } from '../actionTypes';
import { CART_ITEMS } from '../actionTypes';
import { CART_ActiveCouponsData } from '../actionTypes';
import { CLEAR_CART_ITEMS } from '../actionTypes';
import { DELETE_CART_ITEMS } from '../actionTypes';
import { CART_CouponsRemoveData } from '../actionTypes';
import { CHECKOUTCacheUpdated } from './../actionTypes';
import { CLEAR_CHECKOUT } from './../actionTypes';


const intialState = {
  CARTITEMS: null,
  InventoryITEMS: null,
  DeliveryCharges: null,
  ServiceCharges: null,
  isUpdated: false,
  expTime: new Date(),
  isAddressSetonCart: false,

};

const CheckoutCacheReducer = ( state = intialState, action ) =>
{
  switch ( action.type )
  {
    case CHECKOUTAddressONCart:
      return {
        ...state,
        isAddressSetonCart: action.payload,
      };
    case CHECKOUTCacheUpdated:
      return {
        ...state,
        isUpdated: action.payload.isUpdated,
        expTime: action.payload.expTime,
      };
    case CHECKOUTInventoryDATA:
        return {
          ...state,
          InventoryITEMS: action.payload,
        };
    case CLEAR_CHECKOUT:
      // Clear on logout and When order placed success full
      return {
        CARTITEMS: null,
        InventoryITEMS: null,
        DeliveryCharges: null,
        ServiceCharges: null,
        isUpdated: true,
        expTime: new Date(),
        isAddressSetonCart: true,
      };
    default:
      return state;
  }
};
export default CheckoutCacheReducer;
