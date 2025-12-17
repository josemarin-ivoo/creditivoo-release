// /* eslint-disable prettier/prettier */
import {createStore, applyMiddleware, combineReducers} from 'redux';
import thunk from 'redux-thunk';
import {composeWithDevTools} from 'redux-devtools-extension';
import commonReducer from './commonReducer';

import {persistReducer} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import filterReducer from './filterReducer';
import cartReducer from './cartReducer';
import AppLaunchReducer from './AppLaunchReducer';
// import { CartItemCounterReducer } from './cartItemCounterReducer';
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



// // creditivoo

// // import loaderReducer from './slices/loader-slice';
// import loaderReducer from '../Pages/Auth/Creditivoo/store/slices/loader-slice';

// import authReducer from '../Pages/Auth/Creditivoo/store/slices/auth-slice';
// import brandsReducer from '../Pages/Auth/Creditivoo/store/slices/brands-slice';
// import modelsReducer from '../Pages/Auth/Creditivoo/store/slices/models-slice';
// import usersReducer from '../Pages/Auth/Creditivoo/store/slices/users-slice';
// import financingReducer from '../Pages/Auth/Creditivoo/store/slices/financing-slice';
// import purchasesReducer from '../Pages/Auth/Creditivoo/store/slices/purchase-slice';
// import balancesReducer from '../Pages/Auth/Creditivoo/store/slices/balance-slice';
// import paymentsReducer from '../Pages/Auth/Creditivoo/store/slices/payment-slice';
// import banksReducer from '../Pages/Auth/Creditivoo/store/slices/banksSlice';
// import deviceUnitReducer from '../Pages/Auth/Creditivoo/store/slices/deviceUnit-slice';
// import paymentMethodsReducer from '../Pages/Auth/Creditivoo/store/slices/payment-methods-slice';
// import termsAndConditionsReducer from '../Pages/Auth/Creditivoo/store/slices/termsAndConditions-slice';
// import tenantsReducer from '../Pages/Auth/Creditivoo/store/slices/tenants-slice';
// import registerReducer from '../Pages/Auth/Creditivoo/store-creditivoo/slices/register-slice';

// // end creditivoo

// const rootReducer = combineReducers({
//   commonReducer: commonReducer,
//   filterReducer: filterReducer,
//   cartReducer: cartReducer,
//   AppLaunchReducer: AppLaunchReducer,
//   CartItemCounterReducer: CartItemCounterReducer,
//   OrderNotificationReducer: orderNotificationReducer,
//   StoreConfigReducer: StoreConfigReducer,
//   favItemReducer: favItemReducer,
//   // ThemeSwitchwerReducer: ThemeSwitchwerReducer,
//   PushCounterReducer: PushCounterReducer,
//   CartCacheReducer: CartCacheReducer,
//   DeliveryAddressReducer: DeliveryAddressReducer,
//   AlternetDeliveryAddressReducer: AlternetDeliveryAddressReducer,
//   CheckoutCacheReducer: CheckoutCacheReducer,
//   PaymentMethodsReducers: PaymentMethodsReducers,
//   DateTimeSlotReducers: DateTimeSlotReducers,
//   ProductDetailsReducer: ProductDetailsReducer,
//   OrderedProductReducer: OrderedProductReducer,
//   LocationFetchedReducer: LocationFetchedReducer,
//   deepLinkReducer: DeepLinkReducer,
  
//   //creditivoo
//   // loaderReducer: loaderReducer,
//   // authReducer: authReducer,
//   // brandsReducer: brandsReducer,
//   // modelsReducer: modelsReducer,
//   // usersReducer: usersReducer,
//   // financingReducer: financingReducer,
//   // purchasesReducer: purchasesReducer,
//   // balancesReducer: balancesReducer,
//   // paymentsReducer: paymentsReducer,
//   // banksReducer: banksReducer,
//   // deviceUnitReducer: deviceUnitReducer,
//   // paymentMethodsReducer: paymentMethodsReducer,
//   // termsAndConditionsReducer: termsAndConditionsReducer,
//   // tenantsReducer: tenantsReducer,
//   // registerReducer: registerReducer,
//   //  middleware: getDefaultMiddleware =>
//   //   getDefaultMiddleware({
//   //     serializableCheck: false,
//   //   }),
//   creditivoo: creditivooRootReducer,
// });


// const creditivooRootReducer = combineReducers({
//   // Nodos internos de Creditivoo
//   loader: loaderReducer,
//   auth: authReducer,
//   brands: brandsReducer,
//   models: modelsReducer,
//   users: usersReducer,
//   financing: financingReducer,
//   purchases: purchasesReducer,
//   balances: balancesReducer,
//   payments: paymentsReducer,
//   banks: banksReducer,
//   deviceUnit: deviceUnitReducer,
//   paymentMethods: paymentMethodsReducer,
//   termsAndConditions: termsAndConditionsReducer,
//   tenants: tenantsReducer,
//   register: registerReducer,
//   middleware: getDefaultMiddleware =>
//     getDefaultMiddleware({
//        serializableCheck: false,
//     }),
// });

// const config = {
//   key: 'ivo-app',
//   storage: AsyncStorage,
// };

// const persistedReducer = persistReducer(config, rootReducer);
// const store = createStore(
//   persistedReducer,
//   composeWithDevTools(applyMiddleware(thunk)),
// );



// export default store;
/* eslint-disable prettier/prettier */

// import thunk from 'redux-thunk';
// import {composeWithDevTools} from 'redux-devtools-extension';

// // Redux Persist
// import {persistReducer} from 'redux-persist';
// import AsyncStorage from '@react-native-async-storage/async-storage';



// ===================================
// IMPORTS DE CREDITIVOO (Reducers)
// ===================================
import loaderReducer from '../Pages/Auth/Creditivoo/store/slices/loader-slice';
import authReducer from '../Pages/Auth/Creditivoo/store-creditivoo/slices/auth-slice';
import brandsReducer from '../Pages/Auth/Creditivoo/store/slices/brands-slice';
import modelsReducer from '../Pages/Auth/Creditivoo/store/slices/models-slice';
import usersReducer from '../Pages/Auth/Creditivoo/store/slices/users-slice';
import financingReducer from '../Pages/Auth/Creditivoo/store/slices/financing-slice';
import purchasesReducer from '../Pages/Auth/Creditivoo/store/slices/purchase-slice';
import balancesReducer from '../Pages/Auth/Creditivoo/store/slices/balance-slice';
import paymentsReducer from '../Pages/Auth/Creditivoo/store/slices/payment-slice';
import banksReducer from '../Pages/Auth/Creditivoo/store/slices/banksSlice';
import deviceUnitReducer from '../Pages/Auth/Creditivoo/store/slices/deviceUnit-slice';
import paymentMethodsReducer from '../Pages/Auth/Creditivoo/store/slices/payment-methods-slice';
import termsAndConditionsReducer from '../Pages/Auth/Creditivoo/store/slices/termsAndConditions-slice';
import tenantsReducer from '../Pages/Auth/Creditivoo/store/slices/tenants-slice';
import registerReducer from '../Pages/Auth/Creditivoo/store-creditivoo/slices/register-slice';


// ==========================================================
// 1. DEFINICIÓN DEL ROOT REDUCER DE CREDITIVOO 

// ==========================================================
const creditivooRootReducer = combineReducers({
     // Nodos internos de Creditivoo
     loader: loaderReducer,
     auth: authReducer,
     brands: brandsReducer,
     models: modelsReducer,
     users: usersReducer,
     financing: financingReducer,
     purchases: purchasesReducer,
     balances: balancesReducer,
     payments: paymentsReducer,
     banks: banksReducer,
     deviceUnit: deviceUnitReducer,
     paymentMethods: paymentMethodsReducer,
     termsAndConditions: termsAndConditionsReducer,
     tenants: tenantsReducer,
     register: registerReducer,
});


// ==========================================================
// 2. DEFINICIÓN DEL ROOT REDUCER DE IVOO-APP
// ==========================================================
const rootReducer = combineReducers({
     commonReducer: commonReducer,
     filterReducer: filterReducer,
     cartReducer: cartReducer,
     AppLaunchReducer: AppLaunchReducer,
     CartItemCounterReducer: CartItemCounterReducer,
     OrderNotificationReducer: orderNotificationReducer,
     StoreConfigReducer: StoreConfigReducer,
     favItemReducer: favItemReducer,
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
    
     // NODO ENCAPSULADO: Usamos el reducer que definimos arriba
     creditivoo: creditivooRootReducer,
});


// ==========================================================
// 3. CONFIGURACIÓN FINAL DEL STORE Y PERSISTENCIA
// ==========================================================
const config = {
  key: 'ivo-app',
  storage: AsyncStorage,
};

const persistedReducer = persistReducer(config, rootReducer);
const store = createStore(
  persistedReducer,
  composeWithDevTools(applyMiddleware(thunk)),
);



// export type RootState = ReturnType<typeof rootReducer>;
// export type AppDispatch = typeof store.dispatch;

export { rootReducer }; 
export default store;