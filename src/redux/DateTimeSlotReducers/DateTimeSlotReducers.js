/* eslint-disable prettier/prettier */

import {  CLEAR_DATETIMESLOT, DATETIMESLOTCacheUpdated } from '../actionTypes';
import { DATETIMESLOTDATA } from './../actionTypes';


const intialState = {
  DateTimeSlotData: null,
  isUpdated: false,
  expTime: new Date(),
};

const DateTimeSlotReducers = ( state = intialState, action ) =>
{
  switch ( action.type )
  {
    case DATETIMESLOTCacheUpdated:
      return {
        ...state,
        isUpdated: action.payload.isUpdated,
        expTime: action.payload.expTime,
      };
    case DATETIMESLOTDATA:
        return {
          ...state,
          DateTimeSlotData: action.payload,//[...state.CARTITEMS, action.payload],
        };
    case CLEAR_DATETIMESLOT:
      return {
        DateTimeSlotData: null,
        isUpdated: true,
        expTime: new Date(),
      };
    default:
      return state;
  }
};
export default DateTimeSlotReducers;
