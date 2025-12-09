/* eslint-disable prettier/prettier */
import {LOCATION_FETCHED} from './actionTypes';

export const LocationFetchedAction = value => {
  return {
    type: LOCATION_FETCHED,
    payload: value,
  };
};
