/* eslint-disable no-fallthrough */
/* eslint-disable prettier/prettier */
import {ORDER_NOTIFICATION,DELETE_ORDER_NOTIFICATION} from '../actionTypes';
const intialState = {
    'orderNotificationDetail': '',
};

const orderNotificationReducer = ( state = intialState, action ) =>
{

  switch ( action.type )
  {
    case ORDER_NOTIFICATION:
      return {
        ...state,
        orderNotificationDetail: action.payload,
      };
    case DELETE_ORDER_NOTIFICATION:
      {
        intialState;
      }
    default:
      return state;
  }
};
export default orderNotificationReducer;
