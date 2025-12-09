/* eslint-disable eqeqeq */
/* eslint-disable prettier/prettier */
import analytics from '@react-native-firebase/analytics';
import { Platform } from 'react-native';
import { AppEventsLogger } from 'react-native-fbsdk-next';

export function AnalyticsEvent(event, parameters) {
  analytics().logEvent(event, parameters);
}

export function AnalyticsAddToCartEvent(data, sku, email) {

  // Firebase Analytics

  analytics().logAddToCart({
    value: data.products.items[0].price_range.minimum_price.regular_price.value,
    currency: 'usd',
    items: [{
      item_brand: '',
      item_id: sku,
      item_name: data.products.items[0].name,
      item_category: '',
    }],
  });

  // Facebook analytics
  if (Platform.OS == 'android') {
    const params = {
      'CURRENCY': 'USD',
      'CONTENT_TYPE': email,
      'Content': JSON.stringify({
        item_brand: '',
        item_id: sku,
        item_name: data.products.items[0].name,
        item_category: '',
      }),
    };
    AppEventsLogger.logEvent('EVENT_NAME_ADDED_TO_CART', params);

  } else {
    const params = {
      'Currency': 'USD',
      'ContentType': email,
      'Content': JSON.stringify({
        item_brand: '',
        item_id: sku,
        item_name: data.products.items[0].name,
        item_category: '',
      }),
    };
    AppEventsLogger.AppEvents.AddedToCart;
    AppEventsLogger.logEvent('FBSDKAppEventNameAddedToCart', data.products.items[0].price_range.minimum_price.regular_price.value, params);
  }
}



export function AnalyticsAddToWishlistEvent(name, sku) {
  // Firebase Analytics
  analytics().logAddToWishlist({
    value: 0,
    currency: 'USD',
    items: [{
      item_id: sku,
      item_name: name,
    }],
  });

  // Facebook analytics
  if (Platform.OS == 'android') {
    const params = {
      'CONTENT_TYPE': name,
      'CONTENT_ID ': sku,
      'CURRENCY': 'USD',
    };
    AppEventsLogger.logEvent('EVENT_NAME_ADDED_TO_WISHLIST', params);

  } else {
    const params = {
      'ContentType': name,
      'ContentID': sku,
      'Currency': 'USD',
    };

    AppEventsLogger.logEvent('FBSDKAppEventNameAddedToWishlist', params);
  }
}

export function AnalyticsAddPaymentInfo(brand) {
  // Firebase Analytics
  analytics().logAddPaymentInfo({
    currency: 'USD',
    payment_type: brand,
    value: 0,
  });

  // Facebook analytics
  if (Platform.OS == 'android') {
    const params = {
      'currency': 'USD',
      'paymentType': brand,
    };
    AppEventsLogger.logEvent('EVENT_NAME_ADDED_PAYMENT_INFO', params);

  } else {
    const params = {
      'currency': 'USD',
      'paymentType': brand,
    };
    AppEventsLogger.logEvent('FBSDKAppEventNameAddedPaymentInfo', params);
  }

}

export function AnalyticsBeginCheckout(coupon, items, email) {
  // Firebase Analytics
  let array = [];

  items.customerCart.items.map((i) => {
    array.push({
      quantity: i.quantity,
      item_id: i.product.sku,
      item_name: i.product.name,
      price: i.prices.row_total.value,
    });
  });

  analytics().logBeginCheckout({
    currency: 'USD',
    coupon: coupon,
    value: items.customerCart.prices.grand_total.value,
    items: array,
  });

  // Facebook analytics
  if (Platform.OS == 'android') {
    const params = {
      'CURRENCY': 'USD',
      'NUM_ITEMS': array.length,
      'coupon': coupon,
      'CONTENT_TYPE': email,
      'Content': JSON.stringify(array),
    };


    AppEventsLogger.logEvent('EVENT_NAME_INITIATED_CHECKOUT', items.customerCart.prices.grand_total.value, params);
  } else {
    const params = {
      'CURRENCY': 'USD',
      'NumItems': array.length,
      'coupon': coupon,
      'CONTENT_TYPE': email,
      'Content': JSON.stringify(array),
    };
    AppEventsLogger.logEvent('FBSDKAppEventNameInitiatedCheckout', items.customerCart.prices.grand_total.value, params);
  }
}

export function AnalyticslogPurchase(items, order_number) {
  // Firebase Analytics
  let array = [];
  items.customerCart.items.map((i) => {
    array.push({
      item_id: i.product.sku,
      item_name: i.product.name,
      price: i.prices.row_total.value,
      quantity: i.quantity,
    });
  });

  analytics().logPurchase({
    affiliation: '',
    currency: 'USD',
    coupon: items.customerCart.applied_coupons != null ? items.customerCart.applied_coupons[0].code : '',
    value: items.customerCart.prices.grand_total.value,
    items: array,
  });


  // Facebook analytics
  if (Platform.OS == 'android') {
    const params = {
      'CURRENCY': 'USD',
      'NUM_ITEMS': array.length,
      'CONTENT_TYPE': order_number,
      'Content': JSON.stringify(array),
    };
    AppEventsLogger.logEvent('EVENT_NAME_PURCHASED', items.customerCart.prices.grand_total.value, params);
  } else {
    const params = {
      'CURRENCY': 'USD',
      'NumItems': array.length,
      'ContentType': order_number,
      'Content': JSON.stringify(array),
    };
    AppEventsLogger.logPurchase(items.customerCart.prices.grand_total.value, 'USD', params);
  }
}
