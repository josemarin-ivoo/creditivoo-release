import {useState} from 'react';
import {useMutation, ApolloError} from '@apollo/client';
import {
  ADD_WISHLIST,
  AddWishlistVars,
  WishListDataType,
} from '../Queries/addWishlist';

interface Props {
  wishlistId: Number;
  sku: string;
  quantity: Number;
}

interface Result {
  addProductsWishlist(): void;
  WishlistData?: any | null;
  loading: boolean;
  error: ApolloError | undefined;
}

export const useAddWishlist = ({wishlistId, sku, quantity}: Props): Result => {
  const [WishlistData, setWishlistData] = useState<
    WishListDataType | null | undefined
  >(null);
  const [addProductsWishlist, {loading, error}] = useMutation<
    WishListDataType,
    AddWishlistVars
  >(ADD_WISHLIST, {
    variables: {
      wishlistId,
      sku,
      quantity,
    },
    fetchPolicy: 'no-cache',
    onCompleted: responseData => {
      setWishlistData(responseData);
    },
  });
  return {
    addProductsWishlist,
    WishlistData,
    loading,
    error,
  };
};
