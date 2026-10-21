import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchBrands, fetchOffers } from './api';

export const searchBrands = createAsyncThunk('search/brands', async ({ number }, { signal }) => {
  return fetchBrands({ number, signal });
});

export const searchOffers = createAsyncThunk('search/offers', async ({ number, brand }, { signal }) => {
  return fetchOffers({ number, brand, signal });
});

const initialState = {
  brands: [],
  selectedBrand: null,
  brandsStatus: 'idle',
  brandsError: null,
  brandsRequestId: null,
  offers: [],
  offersStatus: 'idle',
  offersError: null,
  offersRequestId: null,
};

const partsSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    clearSearch: () => initialState,
    selectBrand: (state, action) => {
      if (!state.brands.includes(action.payload) || state.selectedBrand === action.payload) return;
      state.selectedBrand = action.payload;
      state.offers = [];
      state.offersStatus = 'idle';
      state.offersError = null;
      state.offersRequestId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchBrands.pending, (state, action) => {
        state.brands = [];
        state.selectedBrand = null;
        state.brandsStatus = 'loading';
        state.brandsError = null;
        state.brandsRequestId = action.meta.requestId;
        state.offers = [];
        state.offersStatus = 'idle';
        state.offersError = null;
        state.offersRequestId = null;
      })
      .addCase(searchBrands.fulfilled, (state, action) => {
        if (state.brandsRequestId !== action.meta.requestId) return;
        state.brands = action.payload;
        state.brandsStatus = 'success';
        state.brandsRequestId = null;
      })
      .addCase(searchBrands.rejected, (state, action) => {
        if (state.brandsRequestId !== action.meta.requestId) return;
        state.brandsRequestId = null;
        if (action.meta.aborted) {
          state.brandsStatus = 'idle';
          return;
        }
        state.brandsStatus = 'error';
        state.brandsError = action.error.message || 'Неизвестная ошибка при поиске.';
      })
      .addCase(searchOffers.pending, (state, action) => {
        state.offers = [];
        state.offersStatus = 'loading';
        state.offersError = null;
        state.offersRequestId = action.meta.requestId;
      })
      .addCase(searchOffers.fulfilled, (state, action) => {
        if (state.offersRequestId !== action.meta.requestId) return;
        state.offers = action.payload;
        state.offersStatus = 'success';
        state.offersRequestId = null;
      })
      .addCase(searchOffers.rejected, (state, action) => {
        if (state.offersRequestId !== action.meta.requestId) return;
        state.offersRequestId = null;
        if (action.meta.aborted) {
          state.offersStatus = 'idle';
          return;
        }
        state.offersStatus = 'error';
        state.offersError = action.error.message || 'Неизвестная ошибка при поиске аналогов.';
      });
  },
});

export const { clearSearch, selectBrand } = partsSlice.actions;
export const partsReducer = partsSlice.reducer;
