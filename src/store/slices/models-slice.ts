import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {
  DeviceModel,
  fetchModelById,
  fetchModelsByBrand,
  fetchPricesByModelId,
  Price,
} from '@services/api/models';

interface ModelsState {
  models: DeviceModel[];
  selectedModel: DeviceModel | null;
  prices: Price[];
  selectedPrice: Price | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ModelsState = {
  models: [],
  selectedModel: null,
  prices: [],
  selectedPrice: null,
  isLoading: false,
  error: null,
};

export const getModelsByBrand = createAsyncThunk(
  'models/getModelsByBrand',
  async (brandId: number) => {
    const response = await fetchModelsByBrand(brandId);
    return response;
  },
);

export const getModelById = createAsyncThunk(
  'models/getModelById',
  async (id: number) => {
    const response = await fetchModelById(id);
    return response;
  },
);

export const getPricesByModelId = createAsyncThunk(
  'models/getPricesByModelId',
  async (ModelId: number) => {
    const response = await fetchPricesByModelId(ModelId);
    return response;
  },
);

const modelsSlice = createSlice({
  name: 'models',
  initialState,
  reducers: {
    setSelectedModel: (state, action: PayloadAction<DeviceModel>) => {
      state.selectedModel = action.payload;
    },
    setSelectedPrice: (state, action: PayloadAction<Price | null>) => {
      state.selectedPrice = action.payload;
    },
    setResetSeletedPrice: state => {
      state.selectedPrice = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getModelsByBrand.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getModelsByBrand.fulfilled,
        (state, action: PayloadAction<DeviceModel[]>) => {
          state.isLoading = false;
          state.models = action.payload;
        },
      )
      .addCase(getModelsByBrand.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Failed to fetch models';
      })
      .addCase(getModelById.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getModelById.fulfilled,
        (state, action: PayloadAction<DeviceModel>) => {
          state.isLoading = false;
          state.selectedModel = action.payload;
        },
      )
      .addCase(getModelById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Failed to fetch model';
      })
      .addCase(
        getPricesByModelId.fulfilled,
        (state, action: PayloadAction<Price[]>) => {
          state.prices = action.payload;
        },
      )
      .addCase(getPricesByModelId.rejected, (state, action) => {
        state.error = action.error.message ?? 'Failed to fetch prices by model';
      });
  },
});

export const {setSelectedModel, setSelectedPrice, setResetSeletedPrice} =
  modelsSlice.actions;
export default modelsSlice.reducer;
