/* eslint-disable prettier/prettier */

import {  ForceLoadPAYMethods, PAYDetailsTime, PAYMETHODSDATA } from '../actionTypes';
import { PAYMethodsCacheUpdated } from './../actionTypes';
import { CLEAR_PAYMETHODSDATA } from './../actionTypes';
import { PAYCARDSDATA } from './../actionTypes';
import { PAYMETHODSDetails } from './../actionTypes';
 

export const isNeedtoUpdatePAYDATA = ( value, time ) =>
{
  return {
    type: PAYMethodsCacheUpdated,
    payload:   {forceUpdateData:value}  ,
  };
};


export const ISPAYMETHODSCacheUpdated = ( value, time,forceUpdateData ) =>
{
  return {
    type: PAYMethodsCacheUpdated,
    payload: { isUpdated: value, expTime: time,forceUpdateData:forceUpdateData },
  };
};

export const AddPAYCards = ( value ) =>
{
  return {
    type: PAYCARDSDATA,
    payload: value ,
  };
};

export const PAYMETHODSAdd = (value) => {
  return {
    type: PAYMETHODSDATA,
    payload: value,
  };
};
export const DELETE_PAYMETHODS = (value) => {
  return {
    type: CLEAR_PAYMETHODSDATA,
  };
};

// export const AddPAYMETHODSDetails = ( value ) =>
// {
//   return {
//     type: PAYMETHODSDetails,
//     payload: value ,
//   };
// };

// export const AddPAYDetailsTime = ( value ) =>
// {
//   return {
//     type: PAYDetailsTime,
//     payload: value ,
//   };
// };


