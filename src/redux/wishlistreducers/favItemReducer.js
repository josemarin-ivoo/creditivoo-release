/* eslint-disable prettier/prettier */
import {
  FAVITEMS,
  CLEAR_FAVITEMS,
  DELETE_FAVITEM
} from './../actionTypes';

const intialState = {
  FAVITEMS: [],
};

const favItemReducer = (state = intialState, action) => {
  switch (action.type) {
    case FAVITEMS:
      let index = state.FAVITEMS.findIndex(el => el.sku === action.payload.sku);
      if (index === -1) {
        return {
          ...state,
          FAVITEMS: [...state.FAVITEMS, action.payload],
        };
      } else {
        const newArray = [...state.FAVITEMS]; //making a new array

        newArray[index] = action.payload;

        return {
          ...state,
          FAVITEMS: newArray,
        };
      }

      case DELETE_FAVITEM:
        return {
          ...state,
          FAVITEMS: state.FAVITEMS.filter(
            item =>
            item.pid !== action.payload.pid && item.sku !== action.payload.sku,
          ),
        };
      case CLEAR_FAVITEMS:
        return intialState;
      default:
        return state;
  }
};
export default favItemReducer;