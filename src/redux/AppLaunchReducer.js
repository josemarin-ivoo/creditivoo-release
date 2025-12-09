/* eslint-disable prettier/prettier */
import {FIRST_LAUNCH} from './actionTypes';

const intialState = {
  FIRST_LAUNCH: false,// Make it true to Show Intro Slides
 
};

const ApplaunchReducer = (state = intialState, action) => {
  switch (action.type) {
    case FIRST_LAUNCH:
      return {
        ...state,
        FIRST_LAUNCH: action.payload,
      };
    //return Object.assign({}, state, action.payload)
    default:
      return state;
  }
};
export default ApplaunchReducer;
