import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {
  Payment,
  PaymentMethod,
  createMobilePayment,
  getAmountInBsForSelectedPayments,
  getPaymentsByPurchaseId,
  status,
  updatePaymentStatus,
  createPaymentReference,
  getExchangeRate,
  ExchangeRate,
} from '@services/api/payments';

interface PaymentState {
  isLoading: boolean;
  error: string | null;
  payments: Payment[];
  selectedPayments: Payment[]; // Store selected payment IDs
  selectedPaymentId: number | null;
  totalPaymentInBs: number;
  exchangeRate: ExchangeRate | null;
}

const initialState: PaymentState = {
  isLoading: false,
  error: null,
  payments: [],
  selectedPayments: [], // Initialize as empty array
  selectedPaymentId: null,
  totalPaymentInBs: 0,
  exchangeRate: null,
};

export const fetchTotalPaymentInBs = createAsyncThunk(
  'payment/fetchTotalPaymentInBs',
  async (selectedPaymentIds: number[], {rejectWithValue}) => {
    try {
      const response =
        await getAmountInBsForSelectedPayments(selectedPaymentIds);
      return response.total;
    } catch (err: any) {
      if (!err.response) {
        throw err;
      }
      return rejectWithValue(err.response.data);
    }
  },
);

// Existing fetch payments by purchase ID
export const fetchPaymentsByPurchaseId = createAsyncThunk(
  'payment/fetchPaymentsByPurchaseId',
  async (purchaseId: number, {rejectWithValue}) => {
    try {
      const response = await getPaymentsByPurchaseId(purchaseId);
      return response;
    } catch (err: any) {
      if (!err.response) {
        throw err;
      }
      return rejectWithValue(err.response.data);
    }
  },
);

// Existing fetch payments by multiple purchase IDs
export const fetchPaymentsByPurchaseIds = createAsyncThunk(
  'payment/fetchPaymentsByPurchaseIds',
  async (purchaseIds: number[], {rejectWithValue}) => {
    try {
      const promises = purchaseIds.map(id => getPaymentsByPurchaseId(id));
      const results = await Promise.all(promises);
      return results.flat();
    } catch (err: any) {
      if (!err.response) {
        throw err;
      }
      return rejectWithValue(err.response.data);
    }
  },
);

// Existing update payment
export const updatePayment = createAsyncThunk(
  'payment/updatePayment',
  async (
    {
      selectedPaymentsIds,
      method,
      paymentStatus,
    }: {
      selectedPaymentsIds: number[];
      method: PaymentMethod;
      paymentStatus: status;
    },
    {rejectWithValue},
  ) => {
    try {
      const updateResponse = await updatePaymentStatus(selectedPaymentsIds, {
        method,
        status: paymentStatus,
      });
      return updateResponse;
    } catch (err: any) {
      if (!err.response) {
        throw err;
      }
      return rejectWithValue(err.response.data);
    }
  },
);

// Existing mobile payment
export const sendMobilePayment = createAsyncThunk(
  'payment/sendMobilePayment',
  async (
    {
      paymentIds,
      phone,
      bank,
      reference,
      paymentDate,
    }: {
      paymentIds: number[];
      phone: string;
      bank: string;
      reference: string;
      paymentDate: any;
    },
    {rejectWithValue},
  ) => {
    try {
      const response = await createMobilePayment({
        phone,
        bank,
        reference,
        paymentDate,
        paymentIds,
      });
      return response;
    } catch (err: any) {
      if (!err.response) {
        throw err;
      }
      return rejectWithValue(err.response.data);
    }
  },
);

export const createPaymentReferenceThunk = createAsyncThunk(
  'payment/createPaymentReference',
  async (
    payload: {
      selectedPaymentsIds: number[];
      paymentData: {field: string; value: string}[];
      paymentMethodId: number;
    },
    {rejectWithValue},
  ) => {
    try {
      const response = await createPaymentReference(payload);
      return response;
    } catch (err: any) {
      if (!err.response) {
        throw err;
      }
      return rejectWithValue(err.response.data);
    }
  },
);

export const fetchExchangeRate = createAsyncThunk(
  'payment/fetchExchangeRate',
  async (_, {rejectWithValue}) => {
    try {
      const response = await getExchangeRate();
      return response;
    } catch (err: any) {
      if (!err.response) {
        throw err;
      }
      return rejectWithValue(err.response.data);
    }
  },
);

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    setSelectedPaymentId: (state, action: PayloadAction<number | null>) => {
      state.selectedPaymentId = action.payload;
    },
    toggleSelectedPayment: (state, action: PayloadAction<Payment>) => {
      const payment = action.payload;
      if (state.selectedPayments.some(p => p.id === payment.id)) {
        state.selectedPayments = state.selectedPayments.filter(
          p => p.id !== payment.id,
        );
      } else {
        state.selectedPayments.push(payment);
      }
    },
    setSelectedPayments: (state, action: PayloadAction<Payment[]>) => {
      state.selectedPayments = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchPaymentsByPurchaseIds.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchPaymentsByPurchaseIds.fulfilled,
        (state, action: PayloadAction<Payment[]>) => {
          state.isLoading = false;
          state.payments = action.payload;
        },
      )
      .addCase(fetchPaymentsByPurchaseIds.rejected, (state, action: any) => {
        state.isLoading = false;
        if (action.payload) {
          state.error = action.payload.message;
        } else {
          state.error = action.error.message || 'Failed to fetch payments';
        }
      })
      .addCase(fetchPaymentsByPurchaseId.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchPaymentsByPurchaseId.fulfilled,
        (state, action: PayloadAction<Payment[]>) => {
          state.isLoading = false;
          state.payments = action.payload;
        },
      )
      .addCase(fetchPaymentsByPurchaseId.rejected, (state, action: any) => {
        state.isLoading = false;
        if (action.payload) {
          state.error = action.payload.message;
        } else {
          state.error = action.error.message || 'Failed to fetch payments';
        }
      })
      .addCase(updatePayment.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePayment.fulfilled, state => {
        state.isLoading = false;
      })
      .addCase(updatePayment.rejected, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.error = action.payload.message;
        } else {
          state.error = action.error.message || 'Failed to update payment';
        }
      })
      .addCase(sendMobilePayment.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendMobilePayment.fulfilled, state => {
        state.isLoading = false;
      })
      .addCase(sendMobilePayment.rejected, (state, action: any) => {
        state.isLoading = false;
        if (action.payload) {
          state.error = action.payload.message;
        } else {
          state.error = action.error.message || 'Failed to send mobile payment';
        }
      })
      .addCase(fetchTotalPaymentInBs.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchTotalPaymentInBs.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.isLoading = false;
          state.totalPaymentInBs = action.payload; // Set totalPaymentInBs
        },
      )
      .addCase(fetchTotalPaymentInBs.rejected, (state, action: any) => {
        state.isLoading = false;
        if (action.payload) {
          state.error = action.payload.message;
        } else {
          state.error =
            action.error.message || 'Failed to fetch total payment in Bs';
        }
      })
      .addCase(createPaymentReferenceThunk.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPaymentReferenceThunk.fulfilled, state => {
        state.isLoading = false;
      })
      .addCase(createPaymentReferenceThunk.rejected, (state, action: any) => {
        state.isLoading = false;
        if (action.payload) {
          state.error = action.payload.message;
        } else {
          state.error =
            action.error.message || 'Failed to create payment reference';
        }
      })
      .addCase(fetchExchangeRate.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchExchangeRate.fulfilled,
        (state, action: PayloadAction<ExchangeRate>) => {
          state.isLoading = false;
          state.exchangeRate = action.payload;
        },
      )
      .addCase(fetchExchangeRate.rejected, (state, action: any) => {
        state.isLoading = false;
        if (action.payload) {
          state.error = action.payload.message;
        } else {
          state.error = action.error.message || 'Failed to fetch exchange rate';
        }
      });
  },
});

export const {
  setSelectedPaymentId,
  toggleSelectedPayment,
  setSelectedPayments,
} = paymentSlice.actions;

export default paymentSlice.reducer;
