import {FAVITEMS, DELETE_FAVITEM, CLEAR_FAVITEMS} from './../actionTypes';

export const FavItemAdd = (valuesku, id, product) => {
  return {
    type: FAVITEMS,
    payload: {
      sku: valuesku,
      pid: id,
      product: product,
    },
  };
};
export const FavItemDelete = (valuesku, id) => {
  return {
    type: DELETE_FAVITEM,
    payload: {
      sku: valuesku,
      pid: id,
    },
  };
};
export const FavItemClear = () => {
  return {
    type: CLEAR_FAVITEMS,
  };
};