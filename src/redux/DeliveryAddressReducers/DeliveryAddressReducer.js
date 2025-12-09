/* eslint-disable prettier/prettier */
import { AddressCacheUpdated,  DELETE_ADDRESS } from '../actionTypes';
import { ADDRESS_ITEMS } from './../actionTypes';
import { CLEAR_ADDRESS } from './../actionTypes';
const intialState = {
  ADDRESSITEMS: [],
  isUpdated: false,
  LastSyncTime:{}
};

const DeliveryAddressReducer = ( state = intialState, action ) =>
{
  switch ( action.type )
  {
    case AddressCacheUpdated:
      return {
        ...state,
        isUpdated: action.payload.isUpdated,
        // LastSyncTime: action.payload.time,
      };
    case ADDRESS_ITEMS:
      let index = state.ADDRESSITEMS.findIndex( el => action.payload.id === el.id );
      if ( index === -1 )
      {
        return {
          ...state,
          ADDRESSITEMS: [...state.ADDRESSITEMS, action.payload.value],
        };
      }
      else
      {
        const newArray = [...state.ADDRESSITEMS]; //making a new array

        newArray[index] = action.payload.value;

        return {
          ...state,
          ADDRESSITEMS: newArray,
        };
      }

    case DELETE_ADDRESS:
      return {
        ...state,
        ADDRESSITEMS: state.ADDRESSITEMS.filter( item => item.id !== action.payload.id ),//.filter( item => item.id !== action.payload.id ),
      };
    case CLEAR_ADDRESS:
      return intialState;
    default:
      return state;
  }
};
export default DeliveryAddressReducer;
