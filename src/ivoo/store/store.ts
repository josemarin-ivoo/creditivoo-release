import {configureStore} from '@reduxjs/toolkit';
import registerReducer from './slices/register-slice';
import authReducer from './slices/auth-slice';
import creditReducer from './slices/credit-slice';
import purchaseReducer from './slices/purchase-slice';

export const ivooStore = configureStore({
  reducer: {
    register: registerReducer,
    auth: authReducer,
    credit: creditReducer,
    purchase: purchaseReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type IvoRootState = ReturnType<typeof ivooStore.getState>;
export type IvoAppDispatch = typeof ivooStore.dispatch;
