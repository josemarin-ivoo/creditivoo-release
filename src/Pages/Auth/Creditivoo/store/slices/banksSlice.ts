// store/slices/banksSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchBankOptions,
  fetchBankAccountInfo,
  BankInfo,
  BankAccountInfo,
} from "@services/api/banks";

export const getBankOptions = createAsyncThunk(
  "banks/getBankOptions",
  async () => {
    const response = await fetchBankOptions();
    return response;
  }
);

export const getBankAccountInfo = createAsyncThunk(
  "banks/getBankAccountInfo",
  async () => {
    const response = await fetchBankAccountInfo();
    return response;
  }
);

interface BanksState {
  bankOptions: BankInfo[];
  bankAccountInfo: BankAccountInfo | null;
  loading: boolean;
  error: string | null;
}

const initialState: BanksState = {
  bankOptions: [],
  bankAccountInfo: null,
  loading: false,
  error: null,
};

const banksSlice = createSlice({
  name: "banks",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getBankOptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBankOptions.fulfilled, (state, action) => {
        state.bankOptions = action.payload;
        state.loading = false;
      })
      .addCase(getBankOptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error al obtener los bancos.";
      })
      .addCase(getBankAccountInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBankAccountInfo.fulfilled, (state, action) => {
        state.bankAccountInfo = action.payload;
        state.loading = false;
      })
      .addCase(getBankAccountInfo.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message ||
          "Error al obtener la información de la cuenta bancaria.";
      });
  },
});

export default banksSlice.reducer;
