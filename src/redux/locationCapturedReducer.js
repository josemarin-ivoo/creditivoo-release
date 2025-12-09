/* eslint-disable prettier/prettier */
import {LOCATION_FETCHED} from './actionTypes';
const intialState = {
  LOCATION_FETCHED: false,
};
// if There is any items in list than it should return true other wise False

const LocationFetchedReducer = (state = intialState, action) => {
  switch (action.type) {
    case LOCATION_FETCHED:
      return {
        ...state,
        LOCATION_FETCHED: action.payload,
      };
    // return Object.assign({}, state, action.payload)
    default:
      return state;
  }
};
export default LocationFetchedReducer;
