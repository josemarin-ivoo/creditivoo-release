/* eslint-disable prettier/prettier */
import {CART_ITEM_COUNTER} from './actionTypes';
const intialState = {
  CART_ITEM_COUNTER: false,
};
// if There is any items in list than it should return true other wise False

const CartItemCounterReducer = (state = intialState, action) => {
  switch (action.type) {
    case CART_ITEM_COUNTER:
      return {
        ...state,
        CART_ITEM_COUNTER: action.payload,
      };
    // return Object.assign({}, state, action.payload)
    default:
      return state;
  }
};
export default CartItemCounterReducer;
