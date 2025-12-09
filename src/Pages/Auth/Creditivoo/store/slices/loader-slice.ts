import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  globalLoader: false,
};

export const loaderSlice = createSlice({
  name: "loader",
  initialState,
  reducers: {
    setGlobalLoader: (state, action) => {
      state.globalLoader = action.payload;
    },
  },
});

export const { setGlobalLoader } = loaderSlice.actions;
export default loaderSlice.reducer;
