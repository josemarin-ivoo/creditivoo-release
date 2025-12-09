/* eslint-disable prettier/prettier */
import {CART_ID, DELETE_CART_ID} from './actionTypes';
const intialState = {
  cart_id: '',
};

const cartReducer = (state = intialState, action) => {
  switch (action.type) {
    case CART_ID:
      return {
        ...state,
        cart_id: action.payload,
      };
    case DELETE_CART_ID:
      return intialState;
    //return Object.assign({}, state, action.payload)
    default:
      return state;
  }
};
export default cartReducer;
