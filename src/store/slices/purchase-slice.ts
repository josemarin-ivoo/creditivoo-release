import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {
  createPurchase,
  Purchase,
  PurchaseResponse,
  getPurchasesByUserId,
  acceptTermsAndConditions as acceptTermsAndConditionsAPI,
} from '@services/api/purchases';

interface PurchaseState {
  isLoading: boolean;
  error: string | null;
  purchaseResponse: PurchaseResponse | null;
  userPurchases: PurchaseResponse[];
  selectedPurchaseId: number | null;
  selectedPurchaseIds: number[]; // Add this to track selected purchases
}

const initialState: PurchaseState = {
  isLoading: false,
  error: null,
  purchaseResponse: null,
  userPurchases: [],
  selectedPurchaseId: null,
  selectedPurchaseIds: [], // Initialize as empty
};

export const submitPurchase = createAsyncThunk(
  'purchase/submitPurchase',
  async (purchase: Purchase) => {
    const response = await createPurchase(purchase);
    return response;
  },
);

export const fetchPurchasesByUserId = createAsyncThunk(
  'purchase/fetchPurchasesByUserId',
  async (
    {userId, status}: {userId: number; status?: 'PASS_DUE' | 'COMPLETED'},
    {rejectWithValue},
  ) => {
    try {
      const response = await getPurchasesByUserId(userId, status);
      return response;
    } catch (err: any) {
      // Si es un 404, retornar array vacío (usuario nuevo sin compras)
      if (err.response?.status === 404) {
        return [];
      }
      if (!err.response) {
        throw err;
      }
      return rejectWithValue(err.response.data);
    }
  },
);

export const acceptTermsAndConditions = createAsyncThunk(
  'purchase/acceptTermsAndConditions',
  async (purchaseId: number, {rejectWithValue}) => {
    try {
      const response = await acceptTermsAndConditionsAPI(purchaseId);
      return response;
    } catch (err: any) {
      if (!err.response) {
        throw err;
      }
      return rejectWithValue(err.response.data);
    }
  },
);

const purchaseSlice = createSlice({
  name: 'purchase',
  initialState,
  reducers: {
    setSelectedPurchaseId: (state, action: PayloadAction<number | null>) => {
      state.selectedPurchaseId = action.payload;
    },
    setSelectedPurchaseIds: (state, action: PayloadAction<number[]>) => {
      state.selectedPurchaseIds = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(submitPurchase.pending, state => {
        state.isLoading = true;
        state.error = null;
        state.purchaseResponse = null;
      })
      .addCase(
        submitPurchase.fulfilled,
        (state, action: PayloadAction<PurchaseResponse>) => {
          state.isLoading = false;
          state.purchaseResponse = action.payload;
        },
      )
      .addCase(submitPurchase.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Failed to create purchase';
        state.purchaseResponse = null;
      })
      .addCase(fetchPurchasesByUserId.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchPurchasesByUserId.fulfilled,
        (state, action: PayloadAction<PurchaseResponse[]>) => {
          state.isLoading = false;
          state.userPurchases = action.payload;

          // Automatically select the first purchase and all PENDING purchases
          if (action.payload.length > 0) {
            state.selectedPurchaseId = action.payload[0].id;
            state.selectedPurchaseIds = action.payload
              .filter(purchase => purchase.status === 'PENDING')
              .map(purchase => purchase.id);
          }
        },
      )
      .addCase(fetchPurchasesByUserId.rejected, (state, action) => {
        state.isLoading = false;
        // Si el error es un 404, es normal para usuarios nuevos sin compras
        // No establecer error en este caso, solo dejar compras vacías
        if (
          action.payload &&
          typeof action.payload === 'object' &&
          'status' in action.payload &&
          action.payload.status === 404
        ) {
          state.userPurchases = [];
          state.error = null;
        } else if (action.payload) {
          state.error = action.payload.message;
        } else {
          state.error =
            action.error.message || 'Failed to fetch Purchases By User Id';
        }
      })
      .addCase(acceptTermsAndConditions.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        acceptTermsAndConditions.fulfilled,
        (state, action: PayloadAction<PurchaseResponse>) => {
          state.isLoading = false;
          const updatedPurchase = action.payload;
          state.userPurchases = state.userPurchases.map(purchase =>
            purchase.id === updatedPurchase.id ? updatedPurchase : purchase,
          );
        },
      )
      .addCase(acceptTermsAndConditions.rejected, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.error = (action.payload as any).message;
        } else {
          state.error =
            action.error.message || 'Failed to accept terms and conditions';
        }
      });
  },
});

export const {setSelectedPurchaseId, setSelectedPurchaseIds} =
  purchaseSlice.actions;
export default purchaseSlice.reducer;
