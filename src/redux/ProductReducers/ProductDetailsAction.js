/* eslint-disable prettier/prettier */

import { PRODUCT_DETAILS_EXP_TIME } from "../actionTypes";
import { PRODUCT_DETAILS } from './../actionTypes';
import { CLEAR_PRODUCT_DETAILS } from './../actionTypes';

export const setProductExpiryTime = (  time ) =>
{
  return {
    type: PRODUCT_DETAILS_EXP_TIME,
    payload: {  expTime: time },
  };
};

export const AddproductDetails = (value) => {
  return {
    type: PRODUCT_DETAILS,
    payload: value,
  };
};
export const Clear_ProductData = (value) => {
  return {
    type: CLEAR_PRODUCT_DETAILS,
  };
};


