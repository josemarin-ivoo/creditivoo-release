/* eslint-disable prettier/prettier */
import {ALTERNET_ADDRESS_ITEMS} from '../actionTypes';
import {CLEAR_ALTERNET_ADDRESS} from '../actionTypes';
import {DELETE_ALTERNATE_ADDRESS} from '../actionTypes';

const intialState = {
  ALTERNET_ADDRESS_ITEMS: [],
};

const AlternetDeliveryAddressReducer = (state = intialState, action) => {
  switch (action.type) {
    case ALTERNET_ADDRESS_ITEMS:
      let index = state.ALTERNET_ADDRESS_ITEMS.findIndex(
        el => action.payload.id === el.id,
      );
      if (index === -1) {
        return {
          ...state,
          ALTERNET_ADDRESS_ITEMS: [
            ...state.ALTERNET_ADDRESS_ITEMS,
            action.payload.value,
          ],
        };
      } else {
        const newArray = [...state.ALTERNET_ADDRESS_ITEMS]; //making a new array

        newArray[index] = action.payload.value;

        return {
          ...state,
          ALTERNET_ADDRESS_ITEMS: newArray,
        };
      }
    case DELETE_ALTERNATE_ADDRESS:
      return {
        ...state,
        ALTERNET_ADDRESS_ITEMS: state.ALTERNET_ADDRESS_ITEMS.filter(
          item => item.id !== action.payload.id,
        ), //.filter( item => item.id !== action.payload.id ),
      };
    case CLEAR_ALTERNET_ADDRESS:
      return intialState;
    default:
      return state;
  }
};
export default AlternetDeliveryAddressReducer;
