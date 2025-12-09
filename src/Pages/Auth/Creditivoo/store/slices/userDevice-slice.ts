import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  createUserDevice,
  UserDeviceData,
  UserDeviceResponse,
} from "@services/api/userDevice";

interface UserDeviceState {
  isLoading: boolean;
  error: string | null;
  userDeviceResponse: UserDeviceResponse | null;
}

const initialState: UserDeviceState = {
  isLoading: false,
  error: null,
  userDeviceResponse: null,
};

export const submitUserDevice = createAsyncThunk(
  "userDevice/submitUserDevice",
  async (data: UserDeviceData, { rejectWithValue }) => {
    try {
      const response = await createUserDevice(data);
      return response;
    } catch (err: any) {
      if (!err.response) {
        throw err;
      }
      return rejectWithValue(err.response.data);
    }
  }
);

const userDeviceSlice = createSlice({
  name: "userDevice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(submitUserDevice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.userDeviceResponse = null;
      })
      .addCase(
        submitUserDevice.fulfilled,
        (state, action: PayloadAction<UserDeviceResponse>) => {
          state.isLoading = false;
          state.userDeviceResponse = action.payload;
        }
      )
      .addCase(submitUserDevice.rejected, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.error = action.payload.message;
        } else {
          state.error =
            action.error.message || "Failed to send unique device ID";
        }
      });
  },
});

export default userDeviceSlice.reducer;
