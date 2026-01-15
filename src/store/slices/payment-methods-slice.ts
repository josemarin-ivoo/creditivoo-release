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
      console.log('Fetching payment methods...');
      const response = await getPaymentMethods();
      console.log('Payment methods response:', response);
      return response;
    } catch (err: any) {
      console.error('Error fetching payment methods:', err);
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
  reducers: {
    resetPaymentMethods: state => {
      state.methods = [];
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchPaymentMethods.pending, state => {
        console.log('Payment methods fetch pending');
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchPaymentMethods.fulfilled,
        (state, action: PayloadAction<PaymentMethodModel[]>) => {
          console.log('Payment methods fetch fulfilled:', action.payload);
          state.isLoading = false;
          state.methods = action.payload;
        },
      )
      .addCase(fetchPaymentMethods.rejected, (state, action) => {
        console.log('Payment methods fetch rejected:', action.payload);
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {resetPaymentMethods} = paymentMethodsSlice.actions;
export default paymentMethodsSlice.reducer;
