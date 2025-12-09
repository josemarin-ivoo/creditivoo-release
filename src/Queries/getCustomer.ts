import { gql } from '@apollo/client';

export interface GetCustomerDataType {
  customer: CustomerType;
}

export interface CustomerType {
  id:String;
  email: string;
  firstName: string;
  lastName: string;
}

export const GET_CUSTOMER = gql`
  query GetCustomer {
    customer {
      id
      is_phone_verified
      email
      phone
      citizen_id
      phone_pincode
      firstName: firstname
      lastName: lastname
      wishlist {
        id
      }
     
    }
    customerCart {
      id
      items {
        id
        has_error
        quantity
      } 
    }
  }
`;
