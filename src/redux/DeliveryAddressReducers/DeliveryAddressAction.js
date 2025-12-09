/* eslint-disable prettier/prettier */
import {DELETE_ADDRESS, AddressCacheUpdated} from '../actionTypes';
import {ADDRESS_ITEMS} from './../actionTypes';
import {CLEAR_ADDRESS} from './../actionTypes';

export const ISAddressCacheUpdated = (value, time) => {
  return {
    type: AddressCacheUpdated,
    payload: {isUpdated: value, time: time},
  };
};

export const ADDRESSAdd = (value, id, Updateid = 0) => {
  return {
    type: ADDRESS_ITEMS,
    payload: {value: value, id: id, Updateid: Updateid},
  };
};

export const ADDRESSDelete = id => {
  return {
    type: DELETE_ADDRESS,
    payload: {id: id},
  };
};
export const AddressClear = () => {
  return {
    type: CLEAR_ADDRESS,
  };
};
