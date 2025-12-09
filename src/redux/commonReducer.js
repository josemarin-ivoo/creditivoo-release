/* eslint-disable prettier/prettier */
import {GLOBAL_DATA, DELETE_DATA} from './actionTypes';
const intialState = {
  email: '',
  token: '',
  phone: '',
  resentSearch: [],
  multiSelectArr: [],
  resentSearchText: '',
  currentCategoryId: 2,
  wishListId: '',
  filterKeyDataInfo: [],
  recentLocationSearch: [],
  fcm_token: '',
  customerData: null,
  profileImage: '',
  
};

const commonReducer = (state = intialState, action) => {
  switch (action.type) {
    case GLOBAL_DATA:
      return Object.assign({}, state, action.payload);
    case DELETE_DATA:
      return intialState;
    default:
      return state;
  }
};
export default commonReducer;
