import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RevisionResponse} from '../services/credit';

export interface PurchaseState {
  currentPurchase: RevisionResponse | null;
  purchases: RevisionResponse[];
  hasPurchasePendingInvoice: boolean;
  hasPurchaseInProgress: boolean;
}

const initialState: PurchaseState = {
  currentPurchase: null,
  purchases: [],
  hasPurchasePendingInvoice: false,
  hasPurchaseInProgress: false,
};

const purchaseSlice = createSlice({
  name: 'purchase',
  initialState,
  reducers: {
    setCurrentPurchase: (state, action: PayloadAction<RevisionResponse>) => {
      state.currentPurchase = action.payload;
    },
    clearCurrentPurchase: state => {
      state.currentPurchase = null;
    },
    setPurchases: (
      state,
      action: PayloadAction<{
        purchases: RevisionResponse[];
        hasPurchasePendingInvoice: boolean;
        hasPurchaseInProgress: boolean;
      }>,
    ) => {
      state.purchases = action.payload.purchases;
      state.hasPurchasePendingInvoice =
        action.payload.hasPurchasePendingInvoice;
      state.hasPurchaseInProgress = action.payload.hasPurchaseInProgress;
    },
    clearPurchases: state => {
      state.purchases = [];
      state.hasPurchasePendingInvoice = false;
      state.hasPurchaseInProgress = false;
    },
  },
});

export const {
  setCurrentPurchase,
  clearCurrentPurchase,
  setPurchases,
  clearPurchases,
} = purchaseSlice.actions;

export default purchaseSlice.reducer;
