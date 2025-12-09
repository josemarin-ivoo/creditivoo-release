/* eslint-disable prettier/prettier */
import {storeConfig} from './actionTypes';

export const storeConfigAction = (value) => {
  return {
    type: storeConfig,
    payload: value,
  };
};
