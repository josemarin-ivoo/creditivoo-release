/* eslint-disable prettier/prettier */
import {GLOBAL_DATA} from './actionTypes';

export const commonAction = (value) => {
  return {
    type: GLOBAL_DATA,
    payload: value,
  };
};
