/* eslint-disable prettier/prettier */
import {ALLFILTER_DATA, CLEAR_FILTER, CLEAR_SORT, FILTER_DATA, SORT_DATA} from './actionTypes';


export const allFilterAction = (value) => {
  return {
    type: ALLFILTER_DATA,
    payload: value,
  };
};

export const FilterAction = (value) => {
  return {
    type: FILTER_DATA,
    payload: value,
  };
};

export const ClearFilterAction = (value) => {
  return {
    type: CLEAR_FILTER,
    payload: value,
  };
};

export const SortAction = (value) => {
  return {
    type: SORT_DATA,
    payload: value,
  };
};

// export const Clear SortAction = (value) => {
//   return {
//     type: CLEAR_SORT,
//     payload: value,
//   };
// };
