import {useMutation, gql} from '@apollo/client';

export const getToken = () => {
  return useMutation(gql`
    mutation (
      $email: String!
      $password: String!
      $fcmToken: String
      $device_id: String!
      $latitude: String!
      $longitude: String!
    ) {
      generateCustomerToken(
        email: $email
        password: $password
        fcm_token: $fcmToken
        device_id: $device_id
        latitude: $latitude
        longitude: $longitude
      ) {
        token
      }
    }
  `);
};
export const Register = () => {
  return useMutation(gql`
    mutation (
      $firstname: String!
      $lastname: String!
      $email: String!
      $password: String!
      $is_subscribed: Boolean!
      $citizen_id: String!
      $phone: String!
      $phone_pincode: String!
    ) {
      createCustomerV2(
        input: {
          firstname: $firstname
          lastname: $lastname
          email: $email
          password: $password
          is_subscribed: $is_subscribed
          citizen_id: $citizen_id
          phone: $phone
          phone_pincode: $phone_pincode
        }
      ) {
        customer {
          is_phone_verified
          phone
        }
      }
    }
  `);
};
export const sentOtp = () => {
  return useMutation(gql`
    mutation ($phone: String!) {
      generatePhoneOtp(phone: $phone) {
        is_sent
      }
    }
  `);
};
export const verifyMobile = () => {
  return useMutation(gql`
    mutation ($phone: String!, $otp: String!) {
      verifyPhoneOtp(phone: $phone, otp: $otp) {
        is_verified
      }
    }
  `);
};

export const getAppReleaseInfo = gql`
  query ($app_type: String!, $current_app_version: String!) {
    getAppReleaseInfo(
      app_type: $app_type
      current_app_version: $current_app_version
    ) {
      app_type
      is_manadat_update
      latest_app_version
      release_date
      release_note
    }
  }
`;

export const emailValidate = gql`
  query ($email: String!) {
    isEmailAvailable(email: $email) {
      is_email_available
    }
  }
`;
export const forgotEmail = () => {
  return useMutation(gql`
    mutation ($email: String!) {
      requestPasswordResetEmailOTP(email: $email)
    }
  `);
};
export const setNewPasswordQuery = () => {
  return useMutation(gql`
    mutation ($email: String!, $otp: String!, $newPassword: String!) {
      resetPasswordThroughOTP(
        email: $email
        resetPasswordOTP: $otp
        newPassword: $newPassword
      )
    }
  `);
};

export const sendLocationToServer = () => {
  return useMutation(gql`
    mutation (
      $lat: String!
      $lng: String!
      $event: String!
      $city: String!
      $isMobile: String!
    ) {
      saveLocation(
        input: {
          lat: $lat
          lng: $lng
          event: $event
          city: $city
          isMobile: $isMobile
        }
      ) {
        result
        message
      }
    }
  `);
};

export const mobileVerification = () => {
  return useMutation(gql`
    mutation ($phone: String!) {
      generatePhoneOtp(phone: $phone) {
        is_sent
      }
    }
  `);
};
export const storeConfig = gql`
  query {
    storeConfig {
      homepage_section1_display_mode
      homepage_section2_display_mode
      base_url
      base_currency_code
      contact_us_phone_number
      zelle_step1_title
      zelle_step1_description
      zelle_step2_title
      zelle_step2_description
      banesco_step1_title
      banesco_step1_description
      banesco_step2_title
      banesco_step2_description
      movil_step1_title
      movil_step1_description
      movil_step2_title
      movil_step2_description
      movil_warning_description
      hs_bank_transfer_step1_title
      hs_bank_transfer_step1_description
      hs_bank_transfer_step2_title
      hs_bank_transfer_step2_description
      hs_bank_transfer_warning_description
      hs_paypal_step1_title
      hs_paypal_step2_description
      hs_paypal_step2_title
      hs_paypal_step1_description
    }
    store_time {
      datetime
    }
  }
`;

export const homeInfo = gql`
  query {
    homeSection {
      section1 {
        children {
          id
          name
          icon
          sale_start_date
          sale_end_date
          big_banner_image
          text_color
          children_count
          category_background_css
        }
      }
    }
  }
`;
/// Not Using
export const homeSection2 = gql`
  query {
    homeSection {
      section2 {
        id
        name
        additional_category_name
        category_background_css
        products(pageSize: 4, sort: {position: ASC}) {
          total_count
          items {
            id
            sku
            name
            image {
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
                discount {
                  percent_off
                }
              }
            }
          }
        }
      }
    }
  }
`;
// Not Using
// export const homeSection3_4 = gql`
// query{
//     homeSection {
//       section3 {
//       id
//       name
//       category_background_css
//       products(
//         pageSize: 4
//           sort: {
//         position: ASC
//       }
//       ){
//         total_count
//           items {
//           id
//           sku
//           name
//             image {
//             url
//           }
//             price_range {
//               minimum_price {
//                 regular_price {
//                 value
//                 currency
//               }
//                 discount{
//                 percent_off
//               }
//             }
//           }
//         }
//       }
//     }
//       section4 {
//       id
//       name
//       products(
//         pageSize: 4
//           sort: {
//         position: ASC
//       }
//       ){
//         total_count
//           items {
//           id
//           sku
//           name
//             image {
//             url
//           }
//             price_range {
//               minimum_price {
//                 regular_price {
//                 value
//                 currency
//               }
//                 discount{
//                 percent_off
//               }
//             }
//           }
//         }
//       }
//     }
//   }
// }

// `;

export const homeSections = gql`
  query {
    homeSections {
      mode
      category {
        id
        name
        products(pageSize: 4, sort: {position: ASC}) {
          total_count
          items {
            sku
            name
            small_image {
              url
            }
            image {
              url
            }
            price_range {
              minimum_price {
                final_price {
                  currency
                  value
                }
                regular_price {
                  value
                  currency
                }
                discount {
                  percent_off
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const phoneVerification = gql`
  query {
    customer {
      is_phone_verified
      firstname
      email
      phone
      wishlist {
        id
      }
    }
  }
`;
export const changePhone = () => {
  return useMutation(gql`
    mutation ($phone: String!, $phone_pincode: String!) {
      updateCustomerV2(
        input: {
          phone: $phone
          phone_pincode: $phone_pincode
          is_phone_verified: true
        }
      ) {
        customer {
          phone
        }
      }
    }
  `);
};
export const productInfo = gql`
  query products($filters: ProductAttributeFilterInput, $currentPage: Int!) {
    products(filter: $filters, currentPage: $currentPage) {
      aggregations {
        attribute_code
        count
        label
        options {
          label
          value
          count
          swatch_data {
            type
            value
          }
        }
      }
      items {
        name
        sku
        small_image {
          url
        }
        price_range {
          minimum_price {
            final_price {
              currency
              value
            }
            regular_price {
              currency
              value
            }
            discount {
              amount_off
              percent_off
            }
          }
        }
      }
      page_info {
        page_size
        current_page
        total_pages
      }
    }
  }
`;

export const cardDetailInfo = gql`
  query ($cardId: String!) {
    store_time {
      datetime
    }
    categoryList(filters: {ids: {eq: $cardId}}) {
      level
      children_count
      children {
        id
        name
        text_color
        icon
        sale_start_date
        sale_end_date
        big_banner_image
        category_background_css
        children_count
      }
    }
  }
`;
export const productDetailInfo = gql`
  query ($cardId: String!) {
    products(filter: {sku: {eq: $cardId}}) {
      items {
        url
        url_key
        id
        sku
        name
        __typename
        additional_attributes {
          code
          label
          value
        }
        short_description {
          html
        }
        ... on ConfigurableProduct {
          configurable_options {
            id
            attribute_id_v2
            label
            position
            use_default
            attribute_code
            __typename
            values {
              value_index
              use_default_value
              label
              swatch_data {
                __typename
                value
              }
            }
          }
          variants {
            product {
              uid
              name
              sku
              media_gallery {
                url
                label
                position
                __typename
                disabled
              }
              price_range {
                minimum_price {
                  regular_price {
                    value
                    currency
                  }
                }
              }
            }
            attributes {
              uid
              label
              code
              value_index
            }
          }
        }
        description {
          html
        }
        stock_status
        only_x_left_in_stock
        media_gallery {
          url
          label
          position
          __typename
          disabled
        }
        price_range {
          minimum_price {
            final_price {
              currency
              value
            }
            regular_price {
              currency
              value
            }
            discount {
              amount_off
              percent_off
            }
          }
        }
        special_price
        related_products {
          sku
          name
          stock_status
          price_range {
            minimum_price {
              final_price {
                currency
                value
              }
              regular_price {
                currency
                value
              }
              discount {
                amount_off
                percent_off
              }
            }
          }
          thumbnail {
            url
          }
        }
        upsell_products {
          sku
          stock_status
          name
          thumbnail {
            label
            url
          }
          price_range {
            minimum_price {
              final_price {
                currency
                value
              }
              regular_price {
                currency
                value
              }
              discount {
                amount_off
                percent_off
              }
            }
          }
          thumbnail {
            url
          }
        }
      }
    }
  }
`;
export const categoryList = gql`
  query ($Id: String!) {
    categoryList(filters: {ids: {in: [$Id]}}) {
      level
      id
      name
      children_count
      children {
        id
        name
        include_in_menu
        icon
        level
        children_count
      }
    }
  }
`;
export const allFilter = gql`
  query products($filters: ProductAttributeFilterInput) {
    products(filter: $filters) {
      aggregations {
        attribute_code
        count
        label
        options {
          label
          value
          count
          swatch_data {
            type
            value
          }
        }
      }
    }
  }
`;
export const filterTag = gql`
  query ($Id: String!) {
    categoryList(filters: {ids: {in: [$Id]}}) {
      level
      children_count
      primary_filter_attribute {
        attribute_code
        attribute_type
        attribute_options {
          label
          value
        }
      }

      children {
        id
        name
        icon
        level
        children_count
      }
    }
  }
`;
export const filterBycategory = gql`
  query ($name: String!) {
    products(search: $name, currentPage: 1) {
      page_info {
        total_pages
        current_page
      }
      total_count
      categoryList {
        id
        name
        icon
        level
      }
      items {
        sku
        name
        thumbnail {
          url
        }
        small_image {
          url
        }
        special_price
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
`;
export const filterKeyData = gql`
  query GetFilterInputsForSearch {
    __type(name: "ProductAttributeFilterInput") {
      inputFields {
        name
        type {
          name
        }
      }
    }
  }
`;

export const getFilterInputsForSearch = gql`
  query GetFilterInputsForSearch {
    __type(name: "ProductAttributeFilterInput") {
      inputFields {
        name
        type {
          name
        }
      }
    }
  }
`;

export const logOut = () => {
  return useMutation(gql`
    mutation {
      revokeCustomerToken {
        result
      }
    }
  `);
};
export const userWishlist = gql`
  query {
    customer {
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

//SOCIAL LOGIN
//
//
export const socialSignin = () => {
  return useMutation(gql`
    mutation (
      $access_token: String!
      $type: String!
      $refresh_token: String!
      $auth_code: String!
      $id_token: String!
      $fullname: String!
      $fcmToken: String
      $device_id: String
      $latitude: String
      $longitude: String
    ) {
      socialLogin(
        input: {
          social_type: $type
          access_token: $access_token
          refresh_token: $refresh_token
          authorization_code: $auth_code
          id_token: $id_token
          full_name: $fullname
          fcm_token: $fcmToken
          device_id: $device_id
          latitude: $latitude
          longitude: $longitude
        }
      ) {
        token
      }
    }
  `);
};

export const userDetail = gql`
  query {
    customer {
      is_phone_verified
      firstname
      lastname
      email
      phone
    }
  }
`;
export const userCartId = gql`
  query {
    customerCart {
      id
    }
  }
`;

export const productToCart = () => {
  return useMutation(gql`
    mutation ($cartId: String!, $quantity: Float!, $sku: String!) {
      addProductsToCart(
        cartId: $cartId
        cartItems: [{quantity: $quantity, sku: $sku}]
      ) {
        user_errors {
          code
          message
        }
        cart {
          items {
            id
            product {
              name
              sku
            }
            quantity
          }
        }
      }
    }
  `);
};

export const highdimension = gql`
  query ($cart_id: String!) {
    highdimension(input: {cart_id: $cart_id}) {
      products {
        high_dimension
        product_id
        product_name
        default_popmsg
        wa_popmsg
        support_contact
      }
      customer {
        id
        email
        name
        contact
      }
    }
  }
`;

export const configuredProductsToCart = () => {
  return useMutation(gql`
    mutation (
      $cartId: String!
      $quantity: Float!
      $parent_sku: String!
      $sku: String!
    ) {
      addProductsToCart(
        cartId: $cartId
        cartItems: [{quantity: $quantity, parent_sku: $parent_sku, sku: $sku}]
      ) {
        user_errors {
          code
          message
        }
        cart {
          items {
            id
            product {
              name
              sku
            }
            quantity
          }
        }
      }
    }
  `);
};

export const customerAddressList = gql`
  query {
    customer {
      addresses {
        id
        firstname
        lastname
        default_billing
        default_shipping
        address_type
        apartment_number
        street
        postcode
        region {
          region
          region_code
          region_id
        }
        region_id
        city
        country_code
        nearest_city
      }
    }
  }
`;

export const customerAlternateAddressList = gql`
  query {
    getAlternateAddress {
      address_sub_type
      address_type
      apartment_number
      city
      company
      country_code
      country_id
      customer_id
      default_billing
      default_shipping
      extension_attributes {
        attribute_code
        value
      }
      is_alternate_address
      fax
      firstname
      alernateaddress_id
      lastname
      latitude
      longitude
      middlename
      nearest_city
      postcode
      prefix
      region {
        region
        region_code
        region_id
      }
      region_id
      street
      suffix
      telephone
      vat_id
      receiverId
    }
  }
`;

export const AddAddress = () => {
  return useMutation(gql`
    mutation (
      $address_type: String
      $apartment_number: String
      $street: [String]
      $postcode: String
      $city: String
      $firstname: String
      $lastname: String
      $default_shipping: Boolean
      $default_billing: Boolean
      $nearest_city: String
      $latitude: String
      $longitude: String
    ) {
      createCustomerAddress(
        input: {
          country_code: VE
          address_type: $address_type
          apartment_number: $apartment_number
          street: $street
          postcode: $postcode
          city: $city
          firstname: $firstname
          lastname: $lastname
          default_shipping: $default_shipping
          default_billing: $default_billing
          nearest_city: $nearest_city
          latitude: $latitude
          longitude: $longitude
        }
      ) {
        id
        firstname
        lastname
        default_billing
        default_shipping
        address_type
        apartment_number
        street
        postcode
        region {
          region
          region_code
          region_id
        }
        region_id
        city
        country_code
        nearest_city
      }
    }
  `);
};

export const AddAlternateAddress = () => {
  return useMutation(gql`
    mutation (
      $address_type: String
      $apartment_number: String
      $street: [String]
      $postcode: String
      $city: String
      $firstname: String
      $lastname: String
      $default_shipping: Boolean
      $default_billing: Boolean
      $nearest_city: String
      $latitude: String
      $longitude: String
      $receiverId: String
    ) {
      createAlternateAddress(
        input: {
          country_code: VE
          address_type: $address_type
          apartment_number: $apartment_number
          street: $street
          postcode: $postcode
          city: $city
          firstname: $firstname
          lastname: $lastname
          default_shipping: $default_shipping
          default_billing: $default_billing
          nearest_city: $nearest_city
          latitude: $latitude
          longitude: $longitude
          receiverId: $receiverId
        }
      ) {
        alernateaddress_id
        firstname
        lastname
        default_billing
        default_shipping
        address_type
        apartment_number
        street
        postcode
        region {
          region
          region_code
          region_id
        }
        region_id
        city
        country_code
        nearest_city
        is_alternate_address
        receiverId
      }
    }
  `);
};

export const DeleteCustomerAddress = () => {
  return useMutation(gql`
    mutation ($aid: Int!) {
      deleteCustomerAddress(id: $aid)
    }
  `);
};

export const DeleteCustomerAlternateAddress = () => {
  return useMutation(gql`
    mutation ($aid: String!) {
      removeAlternateAddress(input: {address_id: $aid}) {
        result
      }
    }
  `);
};

export const updateCustomerAddress = () => {
  return useMutation(gql`
    mutation (
      $aid: Int!
      $address_type: String
      $apartment_number: String
      $street: [String]
      $postcode: String
      $city: String
      $firstname: String
      $lastname: String
      $default_shipping: Boolean
      $default_billing: Boolean
      $nearest_city: String
      $latitude: String
      $longitude: String
    ) {
      updateCustomerAddress(
        id: $aid
        input: {
          address_type: $address_type
          apartment_number: $apartment_number
          street: $street
          postcode: $postcode
          city: $city
          firstname: $firstname
          lastname: $lastname
          default_shipping: $default_shipping
          default_billing: $default_billing
          nearest_city: $nearest_city
          latitude: $latitude
          longitude: $longitude
        }
      ) {
        id
        firstname
        lastname
        default_billing
        default_shipping
        address_type
        apartment_number
        street
        postcode
        region {
          region
          region_code
          region_id
        }
        region_id
        city
        country_code
        nearest_city
      }
    }
  `);
};

export const ContactUs = () => {
  return useMutation(gql`
    mutation (
      $name: String
      $email: String
      $message: String
      $subject: String
    ) {
      contactForm(
        contact: {
          name: $name
          email: $email
          message: $message
          subject: $subject
        }
      ) {
        message
      }
    }
  `);
};

export const updateCustomerAlternateAddress = () => {
  return useMutation(gql`
    mutation (
      $alernateaddress_id: Int!
      $address_type: String
      $apartment_number: String
      $street: [String]
      $postcode: String
      $city: String
      $firstname: String
      $lastname: String
      $default_shipping: Boolean
      $default_billing: Boolean
      $nearest_city: String
      $latitude: String
      $longitude: String
      $receiverId: String
    ) {
      updateAlternateAddress(
        input: {
          alernateaddress_id: $alernateaddress_id
          address_type: $address_type
          apartment_number: $apartment_number
          street: $street
          postcode: $postcode
          city: $city
          firstname: $firstname
          lastname: $lastname
          default_shipping: $default_shipping
          default_billing: $default_billing
          nearest_city: $nearest_city
          latitude: $latitude
          longitude: $longitude
          receiverId: $receiverId
        }
      ) {
        alernateaddress_id
        firstname
        lastname
        default_billing
        default_shipping
        address_type
        apartment_number
        street
        postcode
        region {
          region
          region_code
          region_id
        }
        region_id
        city
        country_code
        nearest_city
        receiverId
      }
    }
  `);
};

export const ChangePassword = () => {
  return useMutation(gql`
    mutation ($currentPassword: String!, $newPassword: String!) {
      changeCustomerPassword(
        currentPassword: $currentPassword
        newPassword: $newPassword
      ) {
        email
      }
    }
  `);
};

///Order API
export const CustomerOrderList = gql`
  query customer($currentPage: Int!) {
    customer {
      orders(pageSize: 5, currentPage: $currentPage) {
        page_info {
          page_size
          current_page
          total_pages
        }
        items {
          increment_id
          status
          order_date
          items {
            product_sku
            product_name
            product_thumbnail
            product_small_image
            quantity_ordered
            product_sale_price {
              value
              currency
            }
          }
          total {
            grand_total {
              value
              currency
            }
          }
          status
          status_code
        }
      }
    }
  }
`;

export const CustomerOrderProducts = gql`
  query customer {
    customer {
      orders {
        items {
          increment_id
          items {
            product_sku
            product_name
            product_thumbnail
            product_small_image
            quantity_ordered
            product_sale_price {
              value
              currency
            }
          }
        }
      }
    }
  }
`;

export const cartList = gql`
  query {
    customerCart {
      id
      items {
        id
        product {
          name
          sku
          small_image {
            url
          }
        }
        has_error
        errors {
          message
        }
        quantity
        prices {
          discounts {
            amount {
              value
              currency
            }
            label
          }
          row_total {
            currency
            value
          }
        }
      }
      validate_order_amount {
        status
        message
      }
      applied_coupons {
        code
      }
      prices {
        discounts {
          amount {
            value
            currency
          }
          label
        }
        payment_fee {
          value
        }
        grand_total {
          value
        }
        subtotal_excluding_tax {
          value
        }
      }
      available_payment_methods {
        code
        title
        payment_fee {
          value
        }
      }
      shipping_addresses {
        selected_shipping_method {
          amount {
            currency
            value
          }
        }
      }
      shipping_addresses {
        available_shipping_methods {
          amount {
            currency
            value
          }
        }
      }
    }
  }
`;

export const GetServiceCharge = gql`
  query {
    customerCart {
      prices {
        payment_fee {
          value
        }
        grand_total {
          value
        }
      }
    }
  }
`;

export const GetDeliveryCharge = gql`
  query {
    customerCart {
      shipping_addresses {
        selected_shipping_method {
          amount {
            currency
            value
          }
        }
      }
      shipping_addresses {
        available_shipping_methods {
          amount {
            currency
            value
          }
        }
      }
      available_payment_methods {
        code
        title
        payment_fee {
          value
        }
      }
      prices {
        payment_fee {
          value
        }
      }
      prices {
        discounts {
          amount {
            value
            currency
          }
          label
        }
      }
      prices {
        grand_total {
          value
        }
        subtotal_excluding_tax {
          value
        }
      }
    }
  }
`;

export const cartDelete = () => {
  return useMutation(gql`
    mutation ($cart_id: String!, $cart_item_id: Int!) {
      removeItemFromCart(
        input: {cart_id: $cart_id, cart_item_id: $cart_item_id}
      ) {
        cart {
          id
          items {
            id
            product {
              name
              sku
              small_image {
                url
              }
            }
            has_error
            errors {
              message
            }
            quantity
            prices {
              discounts {
                amount {
                  value
                  currency
                }
                label
              }
              row_total {
                currency
                value
              }
            }
          }
          validate_order_amount {
            status
            message
          }
          applied_coupons {
            code
          }
          prices {
            discounts {
              amount {
                value
                currency
              }
              label
            }
            payment_fee {
              value
            }
            grand_total {
              value
            }
            subtotal_excluding_tax {
              value
            }
          }
          available_payment_methods {
            code
            title
            payment_fee {
              value
            }
          }
          shipping_addresses {
            selected_shipping_method {
              amount {
                currency
                value
              }
            }
          }
          shipping_addresses {
            available_shipping_methods {
              amount {
                currency
                value
              }
            }
          }
        }
      }
    }
  `);
};

//delivery_date_time

export const orderDetailInfo = gql`
  query ($orderID: String!) {
    customer {
      orders(filter: {number: {eq: $orderID}}) {
        total_count
        items {
          id
          number
          order_date
          can_cancel
          status
          status_code
          delivery_date
          delivery_time
          shipping_method
          shipping_address {
            city
            firstname
            lastname
            country_code
            street
            postcode
          }
          billing_address {
            city
            firstname
            lastname
            country_code
            street
            postcode
          }
          alternateAddress {
            address_type
            city
            country_code
            country_id
            customer_id
            default_billing
            default_shipping
            extension_attributes {
              attribute_code
              value
            }
            is_alternate_address
            firstname
            alernateaddress_id
            lastname
            nearest_city
            postcode
            region {
              region
              region_code
              region_id
            }
            region_id
            street
            telephone
          }
          payment_methods {
            name
            type
          }
          items {
            product_name
            product_sku
            product_url_key
            product_thumbnail
            product_small_image
            product_sale_price {
              value
              currency
            }
            quantity_ordered
            quantity_invoiced
            quantity_shipped
          }
          carrier
          shipments {
            id
            number
            items {
              product_name

              quantity_shipped
            }
          }
          total {
            payment_fee {
              value
            }
            base_grand_total {
              value
              currency
            }
            grand_total {
              value
              currency
            }
            total_tax {
              value
            }
            discounts {
              amount {
                currency
                value
              }
              label
            }
            subtotal {
              value
              currency
            }
            taxes {
              title
              rate
              amount {
                value
                currency
              }
            }
            total_shipping {
              value
            }
            shipping_handling {
              amount_including_tax {
                value
              }
              amount_excluding_tax {
                value
              }
              total_amount {
                value
              }
              taxes {
                title
                rate
                amount {
                  value
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const removeWishlist = () => {
  return useMutation(gql`
    mutation ($wishlistId: ID!, $ItemsId: ID!) {
      removeProductsFromWishlist(
        wishlistId: $wishlistId
        wishlistItemsIds: [$ItemsId]
      ) {
        wishlist {
          id
        }
      }
    }
  `);
};

export const setAddress = () => {
  return useMutation(gql`
    mutation ($addressId: Int!, $cID: String!) {
      setBillingAddressOnCart(
        input: {
          cart_id: $cID
          billing_address: {
            customer_address_id: $addressId
            same_as_shipping: true
          }
        }
      ) {
        cart {
          id
          billing_address {
            street
          }
          shipping_addresses {
            street
          }
        }
      }
    }
  `);
};

export const setAlternateAddress = () => {
  return useMutation(gql`
    mutation ($addressId: String!, $cID: String!, $is_set: Boolean!) {
      setAlternateAddress(
        input: {cart_id: $cID, address_id: $addressId, is_set: $is_set}
      ) {
        result
      }
    }
  `);
};

///Get Available Payment and Shipping API
export const getAvailablePaymentandShipping = gql`
  query {
    customerCart {
      id
      available_payment_methods {
        title
        code
      }
      shipping_addresses {
        available_shipping_methods {
          amount {
            value
          }
          available
          carrier_code
          carrier_title
          method_code
          method_title
        }
      }
    }
  }
`;

export const setShipping = () => {
  return useMutation(gql`
    mutation ($ccode: String!, $mcode: String!, $cID: String!) {
      setShippingMethodsOnCart(
        input: {
          cart_id: $cID
          shipping_methods: [{carrier_code: $ccode, method_code: $mcode}]
        }
      ) {
        cart {
          shipping_addresses {
            selected_shipping_method {
              carrier_code
              carrier_title
              method_code
              method_title
              amount {
                value
                currency
              }
            }
          }
        }
      }
    }
  `);
};

// Get Pick up Point List
export const getPickUpPoints = gql`
  query {
    pickupLocations {
      items {
        street
        postcode
        city
        country_id
        contact_name
        pickup_location_code
        latitude
        longitude
        region
        region_id
      }
    }
  }
`;

// Get
export const getDeliveryTime = gql`
  query {
    deliveryTime {
      date
      slots {
        from
        to
        name
        icon
        dark_icon
        active_icon
      }
    }
  }
`;

export const setShippingAddressesOnCart = () => {
  return useMutation(gql`
    mutation (
      $customer_address_id: Int!
      $pickup_location_code: String!
      $cID: String!
    ) {
      setShippingAddressesOnCart(
        input: {
          cart_id: $cID
          shipping_addresses: [
            {
              customer_address_id: $customer_address_id
              pickup_location_code: $pickup_location_code
            }
          ]
        }
      ) {
        cart {
          shipping_addresses {
            pickup_location_code
          }
        }
      }
    }
  `);
};

export const setPickupddressesOnCart = () => {
  return useMutation(gql`
    mutation (
      $pickup_location_code: String!
      $cID: String!
      $fName: String!
      $lName: String!
      $telephone: String!
      $street: [String]!
      $city: String!
      $postcode: String!
      $country: String!
      $region_id: Int
    ) {
      setShippingAddressesOnCart(
        input: {
          cart_id: $cID
          shipping_addresses: [
            {
              address: {
                firstname: $fName
                lastname: $lName
                street: $street
                city: $city
                postcode: $postcode
                country_code: $country
                region_id: $region_id
                telephone: $telephone
                save_in_address_book: false
              }
              pickup_location_code: $pickup_location_code
            }
          ]
        }
      ) {
        cart {
          shipping_addresses {
            pickup_location_code
          }
        }
      }
    }
  `);
};

export const setAlternateAddressesOnCart = () => {
  return useMutation(gql`
    mutation (
      $pickup_location_code: String!
      $cID: String!
      $fName: String!
      $lName: String!
      $telephone: String!
      $street: [String]!
      $city: String!
      $postcode: String!
      $country: String!
      $region_id: Int
    ) {
      setShippingAddressesOnCart(
        input: {
          cart_id: $cID
          shipping_addresses: [
            {
              address: {
                firstname: $fName
                lastname: $lName
                street: $street
                city: $city
                postcode: $postcode
                country_code: $country
                region_id: $region_id
                telephone: $telephone
                save_in_address_book: false
              }
              pickup_location_code: $pickup_location_code
            }
          ]
        }
      ) {
        cart {
          shipping_addresses {
            pickup_location_code
          }
        }
      }
    }
  `);
};

export const setDeliveryTime = () => {
  return useMutation(gql`
    mutation (
      $deliveryDate: String!
      $deliveryFrom: String!
      $deliveryTo: String!
    ) {
      setDeliveryTime(
        date: $deliveryDate
        from: $deliveryFrom
        to: $deliveryTo
      ) {
        date
        slot {
          from
          to
        }
      }
    }
  `);
};

///Order API
// in: ["processing","new","holded","payment_review","pending_payment"]
export const getLatestPendingOrder = gql`
  query ($pageSize: Int) {
    customer {
      orders(
        pageSize: $pageSize
        filter: {
          state: {
            in: [
              "processing"
              "new"
              "holded"
              "payment_review"
              "pending_payment"
              "complete"
            ]
          }
          status: {nin: ["delivered", "complete", "canceled"]}
        }
      ) {
        items {
          increment_id
          status
          order_date
          shipping_method
          items {
            product_name
            product_thumbnail
            product_small_image
            product_sale_price {
              value
              currency
            }
          }
          total {
            grand_total {
              value
              currency
            }
          }
          status
          status_code
        }
      }
    }
  }
`;
// Save Card Details
export const saveCard = () => {
  return useMutation(gql`
    mutation ($token: String!) {
      saveCard(token: $token) {
        id
        brand
        card_number
        exp_month
        exp_year
        three_d_secure_usage_supported
      }
    }
  `);
};

// Delete User Account
export const deleteUserAccount = () => {
  return useMutation(gql`
    mutation {
      deleteCustomer {
        result
        message
      }
    }
  `);
};

export const GetCards = gql`
  query {
    cardList {
      id
      brand
      card_number
      exp_month
      exp_year
      three_d_secure_usage_supported
    }
  }
`;

export const setPaymentMethodOnCartCod = () => {
  return useMutation(gql`
    mutation ($cart_id: String!, $payment_methodCode: String!) {
      setPaymentMethodOnCart(
        input: {cart_id: $cart_id, payment_method: {code: $payment_methodCode}}
      ) {
        cart {
          selected_payment_method {
            code
            title
          }
        }
      }
    }
  `);
};

// Use Saved Card Details while checkout
export const setPaymentMethodOnCartstripe = () => {
  return useMutation(gql`
    mutation (
      $cart_id: String!
      $payment_methodCode: String!
      $cc_save: Boolean!
      $cc_stripejs_token: String!
    ) {
      setPaymentMethodOnCart(
        input: {
          cart_id: $cart_id
          payment_method: {
            code: $payment_methodCode
            stripe_payments: {
              cc_save: $cc_save
              cc_stripejs_token: $cc_stripejs_token
            }
          }
        }
      ) {
        cart {
          selected_payment_method {
            code
            title
          }
        }
      }
    }
  `);
};

// Use Saved Card Details while checkout
// export const setSavedPaymentMethodCartstripe = () =>
// {
//   return useMutation( gql`
//   mutation( $cart_id: String!, $payment_methodCode: String!, $cc_saved: String! ) {
//     setPaymentMethodOnCart(
//       input: {
//       cart_id: $cart_id
//         payment_method: {
//         code: $payment_methodCode
//             stripe_payments: {
//           cc_saved: $cc_saved
//         }
//       }
//     }
//     ) {
//       cart {
//         selected_payment_method {
//           code
//           title
//         }
//       }
//     }
//   } `)
// };

export const placeOrder = () => {
  return useMutation(gql`
    mutation ($cart_id: String!) {
      placeOrder(input: {cart_id: $cart_id}) {
        order {
          order_number
        }
      }
    }
  `);
};
export const getNearestCityList = gql`
  query {
    nearestCityList {
      name
    }
  }
`;

export const DeliveryShippingMethod = () => {
  return useMutation(gql`
    mutation ($cart_id: String!) {
      setShippingMethodsOnCart(
        input: {
          cart_id: $cart_id
          shipping_methods: [
            {carrier_code: "ivoo_shipping", method_code: "bestway"}
          ]
        }
      ) {
        cart {
          shipping_addresses {
            selected_shipping_method {
              carrier_code
              carrier_title
              method_code
              method_title
              amount {
                value
                currency
              }
            }
          }
        }
      }
    }
  `);
};

export const PickupShippingMethod = () => {
  return useMutation(gql`
    mutation ($cart_id: String!) {
      setShippingMethodsOnCart(
        input: {
          cart_id: $cart_id
          shipping_methods: [{carrier_code: "instore", method_code: "pickup"}]
        }
      ) {
        cart {
          shipping_addresses {
            selected_shipping_method {
              carrier_code
              carrier_title
              method_code
              method_title
              amount {
                value
                currency
              }
            }
          }
        }
      }
    }
  `);
};

export const cartInventory = gql`
  query {
    cartInventory {
      is_delivery_available
      is_pickup_available
      available_pickup_locations {
        city
        contact_name
        country_id
        description
        email
        fax
        latitude
        longitude
        name
        phone
        pickup_location_code
        postcode
        region
        region_id
        store_image
        street
    }
    }
  }
`;

export const cancelOrder = () => {
  return useMutation(gql`
    mutation ($incrementId: String!) {
      cancelOrder(input: {incrementId: $incrementId}) {
        message
      }
    }
  `);
};

export const setPaymentMethodOnCartMovil = () => {
  return useMutation(gql`
    mutation (
      $cart_id: String!
      $payment_methodCode: String!
      $image1: [String]
    ) {
      setPaymentMethodOnCart(
        input: {
          cart_id: $cart_id
          payment_method: {code: $payment_methodCode, movil: {images: $image1}}
        }
      ) {
        cart {
          selected_payment_method {
            code
            title
          }
        }
      }
    }
  `);
};

export const setPaymentMethodOnCartZelle = () => {
  return useMutation(gql`
    mutation (
      $cart_id: String!
      $payment_methodCode: String!
      $image1: [String]
    ) {
      setPaymentMethodOnCart(
        input: {
          cart_id: $cart_id
          payment_method: {code: $payment_methodCode, zelle: {images: $image1}}
        }
      ) {
        cart {
          selected_payment_method {
            code
            title
          }
        }
      }
    }
  `);
};

export const setPaymentMethodOnCartBanesco = () => {
  return useMutation(gql`
    mutation (
      $cart_id: String!
      $payment_methodCode: String!
      $image1: [String]
    ) {
      setPaymentMethodOnCart(
        input: {
          cart_id: $cart_id
          payment_method: {
            code: $payment_methodCode
            banesco: {images: $image1}
          }
        }
      ) {
        cart {
          selected_payment_method {
            code
            title
          }
        }
      }
    }
  `);
};

export const setPaymentMethodOnCartbankTransfer = () => {
  return useMutation(gql`
    mutation (
      $cart_id: String!
      $payment_methodCode: String!
      $image1: [String]
      $document_id: String!
    ) {
      setPaymentMethodOnCart(
        input: {
          cart_id: $cart_id
          payment_method: {
            code: $payment_methodCode
            hs_bank_transfer: {images: $image1, document_id: $document_id}
          }
        }
      ) {
        cart {
          selected_payment_method {
            code
            title
          }
        }
      }
    }
  `);
};

export const setPaymentMethodOnCartPaypal = () => {
  return useMutation(gql`
    mutation (
      $cart_id: String!
      $payment_methodCode: String!
      $image1: [String]
    ) {
      setPaymentMethodOnCart(
        input: {
          cart_id: $cart_id
          payment_method: {
            code: $payment_methodCode
            hs_paypal: {images: $image1}
          }
        }
      ) {
        cart {
          selected_payment_method {
            code
            title
          }
        }
      }
    }
  `);
};

export const getPaymentMethods = gql`
  query {
    customerCart {
      available_payment_methods {
        code
        title
        payment_fee {
          value
        }
      }
    }
  }
`;

// export const getPaymentMethodsDetails = gql`
// query {
//   storeConfig {
//     zelle_step1_title
//     zelle_step1_description
//     zelle_step2_title
//     zelle_step2_description
//     movil_step1_title
//     movil_step1_description
//     movil_step2_title
//     movil_step2_description
//     movil_warning_description
//     hs_bank_transfer_step1_title
//     hs_bank_transfer_step1_description
//     hs_bank_transfer_step2_title
//     hs_bank_transfer_step2_description
//     hs_bank_transfer_warning_description
//     hs_paypal_step1_title
//     hs_paypal_step2_description
//     hs_paypal_step2_title
//     hs_paypal_step1_description
//   }
// } ` ;

export const applyCouponToCart = () => {
  return useMutation(gql`
    mutation ($cart_id: String!, $coupon_code: String!) {
      applyCouponToCart(input: {cart_id: $cart_id, coupon_code: $coupon_code}) {
        cart {
          applied_coupons {
            code
          }
          prices {
            discounts {
              amount {
                value
                currency
              }
              label
            }
            payment_fee {
              value
            }
            grand_total {
              value
            }
            subtotal_excluding_tax {
              value
            }
          }
          validate_order_amount {
            status
            message
          }
        }
      }
    }
  `);
};

export const removeCouponFromCart = () => {
  return useMutation(gql`
    mutation ($cart_id: String!) {
      removeCouponFromCart(input: {cart_id: $cart_id}) {
        cart {
          applied_coupons {
            code
          }
          prices {
            discounts {
              amount {
                value
                currency
              }
              label
            }
            payment_fee {
              value
            }
            grand_total {
              value
            }
            subtotal_excluding_tax {
              value
            }
          }
          validate_order_amount {
            status
            message
          }
        }
      }
    }
  `);
};

export const Getapplied_coupons = gql`
  query {
    customerCart {
      applied_coupons {
        code
      }
      prices {
        discounts {
          amount {
            value
            currency
          }
          label
        }
      }
      prices {
        payment_fee {
          value
        }
      }
      prices {
        grand_total {
          value
        }
        subtotal_excluding_tax {
          value
        }
      }
    }
  }
`;
export const syncCustomerInfo = () => {
  return useMutation(gql`
    mutation ($device_id: String!, $latitude: String!, $longitude: String!) {
      syncCustomerInfo(
        device_id: $device_id
        latitude: $latitude
        longitude: $longitude
      ) {
        result
      }
    }
  `);
};
export const updateCartItemsQTY = () => {
  return useMutation(gql`
    mutation ($cart_id: String!, $cart_item_id: Int!, $quantity: Float!) {
      updateCartItems(
        input: {
          cart_id: $cart_id
          cart_items: {cart_item_id: $cart_item_id, quantity: $quantity}
        }
      ) {
        cart {
          id
          items {
            id
            product {
              name
              sku
              small_image {
                url
              }
            }
            has_error
            errors {
              message
            }
            quantity
            prices {
              discounts {
                amount {
                  value
                  currency
                }
                label
              }
              row_total {
                currency
                value
              }
            }
          }
          validate_order_amount {
            status
            message
          }
          applied_coupons {
            code
          }
          prices {
            discounts {
              amount {
                value
                currency
              }
              label
            }
            payment_fee {
              value
            }
            grand_total {
              value
            }
            subtotal_excluding_tax {
              value
            }
          }
          available_payment_methods {
            code
            title
            payment_fee {
              value
            }
          }
          shipping_addresses {
            selected_shipping_method {
              amount {
                currency
                value
              }
            }
          }
          shipping_addresses {
            available_shipping_methods {
              amount {
                currency
                value
              }
            }
          }
        }
      }
    }
  `);
};
export const setDeviceId = () => {
  return useMutation(gql`
    mutation ($device_id: String!, $latitude: String!, $longitude: String!) {
      setDeviceId(
        device_id: $device_id
        latitude: $latitude
        longitude: $longitude
      ) {
        result
      }
    }
  `);
};

export const updateProfileImage = () => {
  return useMutation(gql`
    mutation ($img: String!) {
      updateProfileImage(img: $img) {
        img
        uploaded
      }
    }
  `);
};

// export const getCustomerProfileImage = gql`
// query{
//   getCustomerProfileImage{
//     img
//   }
// }`;

// mutation{
//   deleteCard( id: "" ){
//     result
//   }
// }

export const deleteCard = () => {
  return useMutation(gql`
    mutation ($id: String!) {
      deleteCard(id: $id) {
        result
      }
    }
  `);
};

export const getCustomerProfileImage = gql`
  query {
    getCustomerProfileImage {
      img
    }
  }
`;

export const updateUserprofile = () => {
  return useMutation(gql`
    mutation (
      $firstname: String!
      $lastname: String!
      $citizen_id: String
      $phone: String!
      $phone_pincode: String!
    ) {
      updateCustomerV2(
        input: {
          citizen_id: $citizen_id
          firstname: $firstname
          lastname: $lastname
          phone: $phone
          phone_pincode: $phone_pincode
        }
      ) {
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
      }
    }
  `);
};

export const getLocationConfig = gql`
  query {
    locationConfig {
      time
      distance
    }
  }
`;


export const checkIfHighDimensionProduct = gql`
  query(
      $cart_id: String!
  ){
  highdimension(
    input: { 
      cart_id: $cart_id 
    })
     {
      highdimension2{
        is_high_dimension
        text
    }
  }
}
  `;

