/* eslint-disable prettier/prettier */
import { PUSH_COUNTER_DATA ,PUSH_COUNTER_CHECK, DELETE_PUSH } from '../actionTypes';
//import { P USH_COUNTER_NUMBER } from './actionTypes';
import { CLEAR_PUSH } from '../actionTypes';

export const PUSH_COUNTER_DATAAdd = ( value ) =>
{
  return {
    type: PUSH_COUNTER_DATA,
    payload: {value},
  };
};
export const _PUSH_COUNTER_CHECK = ( val, token, count = 0,type ) =>
{
  return {
    type: PUSH_COUNTER_CHECK,
    payload: { token: token, val: val, count: count, type: type },
  };
};
//export const _P USH_COUNTER_NUMBER = ( atype, sValue,token ) =>
//{
//  return {
//    type: P USH_COUNTER_NUMBER,
 //   payload: {token: token,type: atype, count: sValue },
 // };
//};

export const PUSHDelete = ( token, id ) =>
{
  //console.log( 'PUSHDelete --> ', token, ' --> ', id );

  return {
    type: DELETE_PUSH,
    payload: { token: token, id: id },
  };
};
export const PUSHClear = (token) =>
{
  //console.log( 'FavItemClear' );
  return {
    type: CLEAR_PUSH,
    payload: { token: token },

  };
};

