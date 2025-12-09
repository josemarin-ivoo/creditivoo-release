/* eslint-disable prettier/prettier */

import {  PAYMETHODSDATA } from '../actionTypes';
import { PAYMethodsCacheUpdated } from './../actionTypes';
import { CLEAR_PAYMETHODSDATA } from './../actionTypes';
import { PAYCARDSDATA } from './../actionTypes';


const intialState = {
  PAYMethodsData: null,
  CardsData: null,
  isUpdated: false,
  isNeedtoUpdateDATA: false,
  expTime: new Date(),
  //PAYMethodDetails: null,
  //expPAYDetailsTime: new Date(),
};

const PaymentMethodsReducers = ( state = intialState, action ) =>
{
  switch ( action.type )
  {
    case PAYMethodsCacheUpdated:
      return {
        ...state,
        isUpdated: action.payload.isUpdated,
        expTime: action.payload.expTime,
        isNeedtoUpdateDATA: action.payload.forceUpdateData,
      };
    case PAYMETHODSDATA:
      return {
        ...state,
        PAYMethodsData: action.payload,//[...state.CARTITEMS, action.payload],
      };
    case PAYCARDSDATA:
      return {
        ...state,
        CardsData: action.payload,//[...state.CARTITEMS, action.payload],
      };
    case CLEAR_PAYMETHODSDATA:
      return {
        PAYMethodsData: null,
        CardsData: null,
        isUpdated: true,
        isNeedtoUpdateDATA: true,
        expTime: new Date(),
        //PAYMethodDetails: null,
        //expPAYDetailsTime: new Date(),
      };
    
    // case PAYMETHODSDetails:
    //  console.log('PAYMETHODSDetails')
    //   console.log(action.payload)
    //   return {
    //     ...state,
    //     PAYMethodDetails: action.payload,//[...state.CARTITEMS, action.payload],
    //   };
    // case PAYDetailsTime:
    //   return {
    //     ...state,
    //     expPAYDetailsTime: action.payload,//[...state.CARTITEMS, action.payload],
    //   };
    default:
      return state;
  }
};
export default PaymentMethodsReducers;
