import { configureStore } from '@reduxjs/toolkit';
import { partsReducer } from './partsSlice';

export const store = configureStore({ reducer: { search: partsReducer } });
