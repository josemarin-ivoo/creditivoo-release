import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Brand, fetchAllBrands } from "@services/api/brands";
import { setGlobalLoader } from "./loader-slice";

interface BrandState {
  brands: Brand[];
  isLoading: boolean;
  error: string | null;
}

const initialState: BrandState = {
  brands: [],
  isLoading: false,
  error: null,
};

export const getBrands = createAsyncThunk(
  "brands/getBrands",
  async (_, { dispatch }) => {
    dispatch(setGlobalLoader(true));
    try {
      const response = await fetchAllBrands();
      dispatch(setGlobalLoader(false));
      return response;
    } catch (error) {
      dispatch(setGlobalLoader(false));
      throw error;
    }
  }
);

const brandsSlice = createSlice({
  name: "brands",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getBrands.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBrands.fulfilled, (state, action: PayloadAction<Brand[]>) => {
        state.isLoading = false;
        state.brands = action.payload;
      })
      .addCase(getBrands.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? "Failed to fetch brands";
      });
  },
});

export default brandsSlice.reducer;
