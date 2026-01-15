import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {fetchUserBalance, Balance} from '@services/api/balances';

interface BalanceState {
  balance: Balance | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: BalanceState = {
  balance: null,
  isLoading: false,
  error: null,
};

export const getUserBalance = createAsyncThunk(
  'balance/getUserBalance',
  async (userId: number, {rejectWithValue}) => {
    try {
      const response = await fetchUserBalance(userId);
      return response;
    } catch (error: any) {
      // Si es un 404, retornar null (usuario nuevo sin balance)
      if (error.response?.status === 404) {
        return null;
      }
      return rejectWithValue(error.message || 'Failed to fetch user balance');
    }
  },
);

const balanceSlice = createSlice({
  name: 'balance',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getUserBalance.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getUserBalance.fulfilled,
        (state, action: PayloadAction<Balance | null>) => {
          state.isLoading = false;
          state.balance = action.payload;
          state.error = null;
        },
      )
      .addCase(getUserBalance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Failed to fetch user balance';
      });
  },
});

export default balanceSlice.reducer;
