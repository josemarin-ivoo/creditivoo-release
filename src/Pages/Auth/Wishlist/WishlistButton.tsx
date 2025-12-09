import React, {useContext, useEffect, useState} from 'react';
import {View, TouchableOpacity} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import commonStyle from '../../../../commonStyle';
import ProgressiveImage from '../../../Components/ProgressiveImage';
import {removeWishlist} from '../../../Queries/queries';
import {
  FavItemDelete,
  FavItemAdd,
} from '../../../redux/wishlistreducers/favAction';
import {useAddWishlist} from '../../../Services/useAddWishlist';
import Helper from '../../../Utils/Helper';
import imgs from '../../../Utils/Image';
import {AppContext} from '../../AppContext';
import wishListHelper from './wishListHelper';
import {AnalyticsAddToWishlistEvent} from './../../../helpers/analyticHelper';

const WishlistButton = props => {
  const dispatch = useDispatch();
  const global_data = useSelector((state: any) => state.commonReducer);
  const favitems = useSelector((state: any) => state.favItemReducer);

  const [selectedSKU] = useState(props.SKU);
  const [Witemid, setWitemid] = useState(0);

  const {
    addProductsWishlist,
    WishlistData,
    loading: wislistloading,
  } = useAddWishlist({
    wishlistId: global_data.wishListId,
    sku: selectedSKU,
    quantity: 1,
  });

  const [removeWishlistCall, {loading: removeLoading, data: removeData}] =
    removeWishlist();

  useEffect(() => {
    props.isLoading && props.isLoading(wislistloading);
  }, [wislistloading]);

  useEffect(() => {
    props.isLoading && props.isLoading(removeLoading);
  }, [removeLoading]);

  //#region Favorite Items Operations

  const performOp = selectedSKU => {
    Helper.HandleVibration();

    if (global_data.token) {
      if (selectedSKU) {
        if (wishListHelper.IsFavItemExist(favitems, selectedSKU)) {
          removeFavItem(selectedSKU);
        } else {
          AddiTem();
        }
      }
    } else {
      props.setLoginOverlay(true);
    }
  };

  const AddiTem = () => {
    addProductsWishlist();
  };

  const removeFavItem = selectedSKU => {
    let itemid = 0;
    favitems.FAVITEMS.length > 0 &&
      favitems.FAVITEMS.map(product => {
        if (product.sku === selectedSKU) {
          itemid = product.pid;
          setWitemid(itemid);
        }
      });
    removeWishlistCall({
      variables: {
        wishlistId: global_data.wishListId,
        ItemsId: itemid,
      },
    });
  };

  useEffect(() => {
    if (removeData) {
      dispatch(FavItemDelete(selectedSKU, Witemid));
    }
  }, [removeData]);

  useEffect(() => {
    if (WishlistData) {
      let index = WishlistData.addProductsToWishlist.wishlist.items.findIndex(
        el => el.product.sku === selectedSKU,
      );
      if (index !== -1) {
        AnalyticsAddToWishlistEvent(
          WishlistData.addProductsToWishlist.wishlist.items[index].product.name,
          WishlistData.addProductsToWishlist.wishlist.items[index].product.sku,
        );
        dispatch(
          FavItemAdd(
            selectedSKU,
            WishlistData.addProductsToWishlist.wishlist.items[index].id,
            WishlistData.addProductsToWishlist.wishlist.items[index].product,
          ),
        );
      }
    }
  }, [WishlistData]);

  //#endregion

  const {appTheme} = useContext(AppContext);
  return (
    <View
      style={[props.pagetype == 'other' ? commonStyle.wishlistImage : null]}>
      <TouchableOpacity
        onPress={() => {
          performOp(props.SKU);
        }}>
        <ProgressiveImage
          source={
            wishListHelper.IsFavItemExist(favitems, props.SKU)
              ? props.pagetype == 'other'
                ? imgs.ic_wishlist_active
                : imgs.ic_wishlist_detail_se
              : props.pagetype == 'other'
              ? imgs.ic_wishlist
              : appTheme.type === 'dark'
              ? imgs.ic_wishlist_detail_new
              : imgs.ic_wishlist_detail_de
          }
          style={
            props.pagetype == 'other'
              ? [commonStyle.he_wi_30]
              : {width: 24, height: 24, marginRight: 10}
          }
          resizeMode="stretch"
        />
      </TouchableOpacity>
    </View>
  );
};

export default WishlistButton;
