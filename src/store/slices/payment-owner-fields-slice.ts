import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {PaymentMethodModel, getPaymentMethods} from '@services/api/payments';

interface PaymentMethodsState {
  methods: PaymentMethodModel[];
  isLoading: boolean;
  error: string | null;
}

const initialState: PaymentMethodsState = {
  methods: [],
  isLoading: false,
  error: null,
};

export const fetchPaymentMethods = createAsyncThunk(
  'paymentMethods/fetch',
  async (_, {rejectWithValue}) => {
    try {
      const response = await getPaymentMethods();
      return response;
    } catch (err: any) {
      if (!err.response) {
        throw err;
      }
      return rejectWithValue(err.response.data);
    }
  },
);

const paymentMethodsSlice = createSlice({
  name: 'paymentMethods',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchPaymentMethods.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchPaymentMethods.fulfilled,
        (state, action: PayloadAction<PaymentMethodModel[]>) => {
          state.isLoading = false;
          state.methods = action.payload;
        },
      )
      .addCase(fetchPaymentMethods.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default paymentMethodsSlice.reducer;
