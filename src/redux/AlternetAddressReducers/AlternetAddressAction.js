/* eslint-disable prettier/prettier */
import {ALTERNET_ADDRESS_ITEMS, DELETE_ALTERNATE_ADDRESS} from '../actionTypes';
import {CLEAR_ALTERNET_ADDRESS} from '../actionTypes';

export const AddAlternetAddress = (value, id, Updateid = 0) => {
  return {
    type: ALTERNET_ADDRESS_ITEMS,
    payload: {value: value, id: id, Updateid: Updateid},
  };
};

export const AlternateADDRESSDelete = id => {
  return {
    type: DELETE_ALTERNATE_ADDRESS,
    payload: {id: id},
  };
};

export const ClearAlternetAddress = () => {
  return {
    type: CLEAR_ALTERNET_ADDRESS,
  };
};
