/* eslint-disable prettier/prettier */
import {createStore, applyMiddleware, combineReducers} from 'redux';
import thunk from 'redux-thunk';
import {composeWithDevTools} from 'redux-devtools-extension';
import commonReducer from './commonReducer';

import {persistReducer} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import filterReducer from './filterReducer';
import cartReducer from './cartReducer';
import AppLaunchReducer from './AppLaunchReducer';
import CartItemCounterReducer from './cartItemCounterReducer';

import StoreConfigReducer from './StoreConfigReducer';
import favItemReducer from './wishlistreducers/favItemReducer';

import CartCacheReducer from './CartCacheReducer/CartCacheReducer';
import DeliveryAddressReducer from './DeliveryAddressReducers/DeliveryAddressReducer';
import CheckoutCacheReducer from './CheckoutCacheReducer/CheckoutCacheReducer';
import PaymentMethodsReducers from './PaymentMethodsReducers/PaymentMethodsReducers';
import DateTimeSlotReducers from './DateTimeSlotReducers/DateTimeSlotReducers';
import ProductDetailsReducer from './ProductReducers/ProductDetailsReducer';
import PushCounterReducer from './PushInboxReducers/PushCounterReducer';
import orderNotificationReducer from './orderNotificationReducer/orderNotificationReducer';
import OrderedProductReducer from './OrderedProductReducer/OrderedProductReducer';
import LocationFetchedReducer from './locationCapturedReducer';
import AlternetDeliveryAddressReducer from './AlternetAddressReducers/AlternetAddressReducer';
import DeepLinkReducer from "./reducers/deepLinkReducer";

const rootReducer = combineReducers({
  commonReducer: commonReducer,
  filterReducer: filterReducer,
  cartReducer: cartReducer,
  AppLaunchReducer: AppLaunchReducer,
  CartItemCounterReducer: CartItemCounterReducer,
  OrderNotificationReducer: orderNotificationReducer,
  StoreConfigReducer: StoreConfigReducer,
  favItemReducer: favItemReducer,
  // ThemeSwitchwerReducer: ThemeSwitchwerReducer,
  PushCounterReducer: PushCounterReducer,
  CartCacheReducer: CartCacheReducer,
  DeliveryAddressReducer: DeliveryAddressReducer,
  AlternetDeliveryAddressReducer: AlternetDeliveryAddressReducer,
  CheckoutCacheReducer: CheckoutCacheReducer,
  PaymentMethodsReducers: PaymentMethodsReducers,
  DateTimeSlotReducers: DateTimeSlotReducers,
  ProductDetailsReducer: ProductDetailsReducer,
  OrderedProductReducer: OrderedProductReducer,
  LocationFetchedReducer: LocationFetchedReducer,
  deepLinkReducer: DeepLinkReducer,
});

const config = {
  key: 'ivo-app',
  storage: AsyncStorage,
};

const persistedReducer = persistReducer(config, rootReducer);
const store = createStore(
  persistedReducer,
  composeWithDevTools(applyMiddleware(thunk)),
);

export default store;
