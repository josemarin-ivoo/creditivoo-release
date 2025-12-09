import {gql} from '@apollo/client';

export interface AddWishlistVars {
  wishlistId: Number;
  sku: string;
  quantity: Number;
}
export interface WishListDataType {
  id: String;
  items_count: Number;
}
export const ADD_WISHLIST = gql`
  mutation addWishlist($wishlistId: ID!, $sku: String!, $quantity: Float!) {
    addProductsToWishlist(
      wishlistId: $wishlistId
      wishlistItems: [{sku: $sku, quantity: $quantity}]
    ) {
      wishlist {
        id
        items {
          id
          qty
          product {
            name
            sku
            stock_status
            thumbnail {
              url
            }
            small_image {
              url
            }
            price_range {
              minimum_price {
                regular_price {
                  value
                  currency
                }
                final_price {
                  value
                  currency
                }
              }
            }
          }
        }
      }
    }
  }
`;
