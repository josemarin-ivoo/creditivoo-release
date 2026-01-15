import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {
  updateDeviceUnit,
  DeviceUnitData,
  DeviceUnitResponse,
} from '@services/api/deviceUnit';

interface DeviceUnitState {
  isLoading: boolean;
  error: string | null;
  deviceUnitSelected: number | null;
  deviceUnitResponse: DeviceUnitResponse | null;
}

const initialState: DeviceUnitState = {
  isLoading: false,
  error: null,
  deviceUnitSelected: null,
  deviceUnitResponse: null,
};

// Thunk para enviar los datos actualizados al endpoint
export const submitDeviceUnit = createAsyncThunk(
  'deviceUnit/submitDeviceUnit',
  async (
    {deviceUnitId, data}: {deviceUnitId: number; data: DeviceUnitData},
    {rejectWithValue},
  ) => {
    try {
      const response = await updateDeviceUnit(deviceUnitId, data);
      return response;
    } catch (err: any) {
      if (!err.response) {
        throw err;
      }
      return rejectWithValue(err.response.data);
    }
  },
);

const deviceUnitSlice = createSlice({
  name: 'deviceUnit',
  initialState,
  reducers: {
    setDeviceUnitSelected: (state, action: PayloadAction<number>) => {
      state.deviceUnitSelected = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(submitDeviceUnit.pending, state => {
        state.isLoading = true;
        state.error = null;
        state.deviceUnitResponse = null;
      })
      .addCase(
        submitDeviceUnit.fulfilled,
        (state, action: PayloadAction<DeviceUnitResponse>) => {
          state.isLoading = false;
          state.deviceUnitResponse = action.payload;
        },
      )
      .addCase(submitDeviceUnit.rejected, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.error = action.payload.message;
        } else {
          state.error = action.error.message || 'Failed to update device unit';
        }
      });
  },
});

export const {setDeviceUnitSelected} = deviceUnitSlice.actions;

export default deviceUnitSlice.reducer;
