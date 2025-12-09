/* eslint-disable prettier/prettier */

import {CARTCacheUpdated, CART_APPLIED_COUPON_DATA} from '../actionTypes';
import {CART_ITEMS} from '../actionTypes';
import {CART_ActiveCouponsData} from '../actionTypes';
import {CLEAR_CART_ITEMS} from '../actionTypes';
import {DELETE_CART_ITEMS} from '../actionTypes';
import {CART_CouponsRemoveData} from '../actionTypes';

const intialState = {
  CARTITEMS: null,
  CARTCOUPONDATA: null,
  ActiveCouponsData: null,
  CouponsRemoveData: null,
  PickUpAddressData: null,
  DateTimeSlotData: null,
  PaymentMethodData: null,
  isUpdated: false,
  expTime: new Date(),
};

const CartCacheReducer = (state = intialState, action) => {
  switch (action.type) {
    case CARTCacheUpdated:
      return {
        ...state,
        isUpdated: action.payload.isUpdated,
        expTime: action.payload.expTime,
      };
    case CART_ITEMS:
      return {
        ...state,
        CARTITEMS: action.payload,
      };
    case DELETE_CART_ITEMS:
      let index = state.CARTITEMS.customerCart.items.findIndex(
        item => item.id === action.payload,
      );
      const newArray = [...state.CARTITEMS]; //making a new array

      newArray.customerCart.items[index] = action.payload.value;
      return {
        ...state,
        CARTITEMS: newArray,
      };
    case CART_APPLIED_COUPON_DATA:
      return {
        ...state,
        CARTCOUPONDATA: action.payload,
      };
    case CART_ActiveCouponsData:
      return {
        ...state,
        ActiveCouponsData: action.payload,
      };
    case CART_CouponsRemoveData:
      return {
        ...state,
        CouponsRemoveData: action.payload,
      };
    case CLEAR_CART_ITEMS:
      return {
        CARTITEMS: null,
        CARTCOUPONDATA: null,
        ActiveCouponsData: null,
        CouponsRemoveData: null,
        PickUpAddressData: null,
        DateTimeSlotData: null,
        PaymentMethodData: null,
        isUpdated: true,
        expTime: new Date(),
      };
    default:
      return state;
  }
};
export default CartCacheReducer;
