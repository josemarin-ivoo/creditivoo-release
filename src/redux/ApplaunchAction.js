/* eslint-disable prettier/prettier */
import {FIRST_LAUNCH} from './actionTypes';

export const ApplaunchAction = (value) => {
  return {
    type: FIRST_LAUNCH,
    payload: value,
  };
};
