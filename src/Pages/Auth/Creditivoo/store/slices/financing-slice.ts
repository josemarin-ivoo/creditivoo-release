import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {
  ExchangeRate,
  FinancingOption,
  fetchExchangeRates,
  fetchFinancingOptions,
  fetchFinancingOptionsByPriceId,
} from '@services/api/financing';

interface FinancingState {
  financingOptions: FinancingOption[];
  exchangeRates: ExchangeRate[];
  isLoading: boolean;
  error: string | null;
  financingSelectedId: number | null;
}

const initialState: FinancingState = {
  financingOptions: [],
  exchangeRates: [],
  isLoading: false,
  error: null,
  financingSelectedId: null,
};

export const getFinancingOptions = createAsyncThunk(
  'financing/getFinancingOptions',
  async (modelId: number) => {
    const response = await fetchFinancingOptions(modelId);
    return response;
  },
);

export const getFinancingOptionsByPriceId = createAsyncThunk(
  'financing/getFinancingOptionsByPriceId',
  async (priceId: number) => {
    const response = await fetchFinancingOptionsByPriceId(priceId);
    return response;
  },
);

export const getExchangeRates = createAsyncThunk(
  'financing/getExchangeRates',
  async () => {
    const response = await fetchExchangeRates();
    return response;
  },
);

const financingSlice = createSlice({
  name: 'financing',
  initialState,
  reducers: {
    setFinancingSelect: (
      state,
      action: PayloadAction<{financingSelectedId: number}>,
    ) => {
      state.financingSelectedId = action.payload.financingSelectedId;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getFinancingOptions.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getFinancingOptions.fulfilled,
        (state, action: PayloadAction<FinancingOption[]>) => {
          state.isLoading = false;
          state.financingOptions = action.payload;
        },
      )
      .addCase(getFinancingOptions.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.error.message ?? 'Failed to fetch financing options';
      })
      .addCase(
        getFinancingOptionsByPriceId.fulfilled,
        (state, action: PayloadAction<FinancingOption[]>) => {
          state.isLoading = false;
          state.financingOptions = action.payload;
        },
      )
      .addCase(getFinancingOptionsByPriceId.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.error.message ?? 'Failed to fetch financing options';
      })
      .addCase(getExchangeRates.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getExchangeRates.fulfilled,
        (state, action: PayloadAction<ExchangeRate[]>) => {
          state.isLoading = false;
          state.exchangeRates = action.payload;
        },
      )
      .addCase(getExchangeRates.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Failed to fetch exchange rates';
      });
  },
});

export const {setFinancingSelect} = financingSlice.actions;
export default financingSlice.reducer;
