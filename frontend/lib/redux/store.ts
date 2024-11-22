import { configureStore } from '@reduxjs/toolkit';
import tamagotchiReducer from './tamagotchiSlice';

export const store = configureStore({
  reducer: {
    tamagotchi: tamagotchiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 