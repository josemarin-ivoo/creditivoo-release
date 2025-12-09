import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {fetchTenants, Tenant} from '@services/api/tenants';

interface TenantsState {
  tenants: Tenant[];
  isLoading: boolean;
  error: string | null;
}

const initialState: TenantsState = {
  tenants: [],
  isLoading: false,
  error: null,
};

export const getTenants = createAsyncThunk(
  'tenants/getTenants',
  async (_, {rejectWithValue}) => {
    try {
      console.log('[Tenants Slice] Starting to fetch tenants');
      const tenants = await fetchTenants();
      console.log('[Tenants Slice] Tenants fetched successfully:', tenants);
      console.log('[Tenants Slice] Number of tenants:', tenants?.length || 0);
      return tenants;
    } catch (error: any) {
      console.error('[Tenants Slice] Error in getTenants:', error);
      return rejectWithValue(error.message || 'Failed to fetch tenants');
    }
  },
);

const tenantsSlice = createSlice({
  name: 'tenants',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getTenants.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getTenants.fulfilled,
        (state, action: PayloadAction<Tenant[]>) => {
          console.log(
            '[Tenants Slice] Fulfilled - Setting tenants:',
            action.payload,
          );
          console.log(
            '[Tenants Slice] Number of tenants in payload:',
            action.payload?.length || 0,
          );
          state.isLoading = false;
          state.tenants = action.payload;
          state.error = null;
          console.log(
            '[Tenants Slice] State updated. Tenants in state:',
            state.tenants?.length || 0,
          );
        },
      )
      .addCase(getTenants.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'Failed to fetch tenants';
      });
  },
});

export default tenantsSlice.reducer;
