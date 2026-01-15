import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {
  assignCreditFromScore,
  AssignCreditFromScoreData,
} from '../../services/credit';

export interface CreditState {
  isAssigning: boolean;
  error: string | null;
  hasAssignedFromScore: boolean;
  data: AssignCreditFromScoreData | null;
}

const initialState: CreditState = {
  isAssigning: false,
  error: null,
  hasAssignedFromScore: false,
  data: null,
};

export const assignCreditFromScoreThunk = createAsyncThunk<
  AssignCreditFromScoreData,
  number,
  {rejectValue: string}
>('credit/assignFromScore', async (score, {rejectWithValue}) => {
  try {
    const response = await assignCreditFromScore({score});

    if (!response?.success || !response.data) {
      throw new Error('Respuesta inválida del servidor al asignar crédito');
    }

    return response.data;
  } catch (error: any) {
    const message = error?.message || 'Error al asignar crédito';
    return rejectWithValue(message);
  }
});

const creditSlice = createSlice({
  name: 'credit',
  initialState,
  reducers: {
    resetCreditState: state => {
      state.isAssigning = false;
      state.error = null;
      state.hasAssignedFromScore = false;
      state.data = null;
    },
    setCreditDataFromBackend: (
      state,
      action: PayloadAction<AssignCreditFromScoreData>,
    ) => {
      state.data = action.payload;
      state.hasAssignedFromScore = true;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(assignCreditFromScoreThunk.pending, state => {
        state.isAssigning = true;
        state.error = null;
      })
      .addCase(
        assignCreditFromScoreThunk.fulfilled,
        (state, action: PayloadAction<AssignCreditFromScoreData>) => {
          state.isAssigning = false;
          state.data = action.payload;
          state.hasAssignedFromScore = true;
          state.error = null;
        },
      )
      .addCase(assignCreditFromScoreThunk.rejected, (state, action) => {
        state.isAssigning = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          'Error al asignar crédito';
      });
  },
});

export const {resetCreditState, setCreditDataFromBackend} = creditSlice.actions;

export default creditSlice.reducer;
