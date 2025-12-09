const wishListHelper = {
  IsFavItemExist: function (reducer, itemsku) {
    let fl = false;
    let index = reducer.FAVITEMS.findIndex(el => el.sku === itemsku);
    if (index !== -1) {
      fl = true;
    }
    return fl;
  },
};
export default wishListHelper;
