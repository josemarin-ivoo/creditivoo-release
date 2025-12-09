/* eslint-disable prettier/prettier */
import { PRODUCT_DETAILS,PRODUCT_DETAILS_EXP_TIME } from './../actionTypes';
import { CLEAR_PRODUCT_DETAILS } from './../actionTypes';

 

const intialState = {
  productItems: null,
  expTime: new Date(),
};

const ProductDetailsReducer = ( state = intialState, action ) =>
{
  switch ( action.type )
  {
    case PRODUCT_DETAILS_EXP_TIME:
      return {
        ...state,
        expTime: action.payload.expTime,
      };
    case PRODUCT_DETAILS:
      return {
        ...state,
        productItems: [...state.productItems, action.payload],
      };
    case CLEAR_PRODUCT_DETAILS:
      return intialState;
    default:
      return state;
  }
};
export default ProductDetailsReducer;
