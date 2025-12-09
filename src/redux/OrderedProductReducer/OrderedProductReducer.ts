import {CLEAR_ORDERED_PRODUCTS, ORDERED_PRODUCTS} from '../actionTypes';

const intialState = {
  orderedProducts: [],
};

const OrderedProductReducer = (state = intialState, action) => {
  switch (action.type) {
    case ORDERED_PRODUCTS:
      return {
        ...state,
        orderedProducts: action.payload,
      };
    case CLEAR_ORDERED_PRODUCTS:
      return intialState;
    default:
      return state;
  }
};
export default OrderedProductReducer;
