import {configureStore} from '@reduxjs/toolkit';
import loaderReducer from './slices/loader-slice';
import authReducer from './slices/auth-slice';
import brandsReducer from './slices/brands-slice';
import modelsReducer from './slices/models-slice';
import usersReducer from './slices/users-slice';
import financingReducer from './slices/financing-slice';
import purchasesReducer from './slices/purchase-slice';
import balancesReducer from './slices/balance-slice';
import paymentsReducer from './slices/payment-slice';
import banksReducer from './slices/banksSlice';
import deviceUnitReducer from './slices/deviceUnit-slice';
import paymentMethodsReducer from './slices/payment-methods-slice';
import termsAndConditionsReducer from './slices/termsAndConditions-slice';
import tenantsReducer from './slices/tenants-slice';
import registerReducer from '../store-creditivoo/slices/register-slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    brands: brandsReducer,
    models: modelsReducer,
    financing: financingReducer,
    purchases: purchasesReducer,
    loader: loaderReducer,
    users: usersReducer,
    balance: balancesReducer,
    payments: paymentsReducer,
    banks: banksReducer,
    deviceUnit: deviceUnitReducer,
    paymentMethods: paymentMethodsReducer,
    termsAndConditions: termsAndConditionsReducer,
    tenants: tenantsReducer,
    ivooRegister: registerReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
