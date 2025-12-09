/* eslint-disable prettier/prettier */
import {storeConfig} from './actionTypes';
const intialState = {
  storeConfig: '',
};

const StoreConfigReducer = (state = intialState, action) => {
  switch (action.type) {
    case storeConfig:
      return {
        ...state,
        storeConfig: action.payload,
      };
    //return Object.assign({}, state, action.payload)
    default:
      return state;
  }
};
export default StoreConfigReducer;
