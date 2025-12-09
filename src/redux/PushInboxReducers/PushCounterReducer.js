/* eslint-disable prettier/prettier */
//import { P USH_COUNTER_NUMBER } from './actionTypes';
 
import { DELETE_PUSH, PUSH_COUNTER_CHECK, PUSH_COUNTER_DATA } from './../actionTypes';
import { CLEAR_PUSH } from './../actionTypes';

const intialState = {
  PUSH_COUNTER_DATA: [],
  PUSH_COUNTER_CHECK: [{ val: false, token: '',count:0,type:'' }],// val == to show badge on Icons
  //P USH_COUNTER_NUMBER: [{ val: 0, token: '' }],
};

const PushCounterReducer = ( state = intialState, action ) =>
{
  switch ( action.type )
  {
    case PUSH_COUNTER_DATA:

      return {
        ...state,
        PUSH_COUNTER_DATA: [action.payload, ...state.PUSH_COUNTER_DATA],
      };
    case PUSH_COUNTER_CHECK:
      const index = state.PUSH_COUNTER_CHECK.findIndex( todo => todo.token === action.payload.token ); //finding index of the item
      // console.log( 'PUSH_COUNTER_CHECK ---> ',index );
      // console.log( action.payload );

      if ( index === -1 )
      {
        // New entry
        const newArray = action.payload;
        if ( action.payload.type === 'add' )
        {
          newArray.count = action.payload.count + 1;
        } else if ( action.payload.type === 'sub' )
        {
          newArray.count = action.payload.count !== 0 ? action.payload.count - 1 : 0;
        }
        else if ( action.payload.type === 'clear' )
        {
          newArray.count = 0;
          newArray.val = false;
        }
        else if ( action.payload.type === 'update' )
        {
          newArray.count = action.payload.count;
          newArray.val = action.payload.count == 0 ? false : true;
        }

        return {
          ...state,
          PUSH_COUNTER_CHECK: [...state.PUSH_COUNTER_CHECK, newArray],
        };
      } else
      {
        //Update entry

        const newArray = [...state.PUSH_COUNTER_CHECK]; //making a new array
        newArray[index].val = action.payload.val;

        if ( action.payload.type === 'add' )
        {
          newArray[index].count = newArray[index].count + 1;
        } else if ( action.payload.type === 'sub' )
        {
          newArray[index].count = newArray[index].count !== 0 ? newArray[index].count - 1 : 0;
        }
        else if ( action.payload.type === 'clear' )
        {
          newArray[index].count = 0;
          newArray[index].val = false;
        }
        else if ( action.payload.type === 'update' )
        {
          newArray[index].count = action.payload.count;
          newArray[index].val = action.payload.count == 0 ? false : true;
        }

        return {
          ...state,
          PUSH_COUNTER_CHECK: newArray,
        };
      }
    case DELETE_PUSH:
      return {
        ...state,
        PUSH_COUNTER_DATA: state.PUSH_COUNTER_DATA.filter( item => item.value.token === action.payload.token && item.value.remoteMessage.messageId !== action.payload.id ),
      };
    case CLEAR_PUSH:

      return {
        ...state,
        PUSH_COUNTER_DATA: state.PUSH_COUNTER_DATA.filter( item => item.value.token !== action.payload.token ),
      };
    // return intialState;
    default:
      return state;
  }
};
export default PushCounterReducer;
