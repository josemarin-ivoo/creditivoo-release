import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getTermsAndConditionsByID, TermsAndConditionsResponse } from '@services/api/termsAndConditions';

interface TermsAndConditionsState {
  termsAndConditions: TermsAndConditionsResponse | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: TermsAndConditionsState = {
  termsAndConditions: null,
  isLoading: false,
  error: null,
};


export const fetchTermsAndConditionsByID = createAsyncThunk(
  'termsAndConditions/fetchTermsAndConditionsByID',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await getTermsAndConditionsByID(id);
      return response;
    } catch (err: any) {
      if (!err.response) {
        throw err;
      }
      return rejectWithValue(err.response.data);
    }
  }
);

const termsAndConditionsSlice = createSlice({
  name: 'termsAndConditions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchTermsAndConditionsByID.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchTermsAndConditionsByID.fulfilled, (state, action) => {
      state.isLoading = false;
      state.termsAndConditions = action.payload;
    });
    builder.addCase(fetchTermsAndConditionsByID.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { } = termsAndConditionsSlice.actions;
export default termsAndConditionsSlice.reducer; 