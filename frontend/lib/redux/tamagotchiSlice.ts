import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Tamagotchi {
  id: string;
  name: string;
  level: number;
  hungerLevel: number;
  happinessLevel: number;
  healthLevel: number;
  createdAt: string;
  isDead?: boolean;
}

interface TamagotchiState {
  tamagotchis: Tamagotchi[];
  deadCount: number;
}

const initialState: TamagotchiState = {
  tamagotchis: [],
  deadCount: 0,
};

const clamp = (num: number, min: number, max: number) => 
  Math.min(Math.max(num, min), max);

const tamagotchiSlice = createSlice({
  name: 'tamagotchi',
  initialState,
  reducers: {
    addTamagotchi: (state, action: PayloadAction<Tamagotchi>) => {
      state.tamagotchis.push(action.payload);
    },
    feedTamagotchi: (state, action: PayloadAction<string>) => {
      const tamagotchi = state.tamagotchis.find(t => t.id === action.payload);
      if (tamagotchi) {
        // Apply feeding effects
        tamagotchi.hungerLevel = clamp(tamagotchi.hungerLevel - 10, 0, 100);
        tamagotchi.happinessLevel = clamp(tamagotchi.happinessLevel + 5, 0, 100);
        tamagotchi.healthLevel = clamp(tamagotchi.healthLevel - 5, 0, 100);
        
        // Check for death
        if (tamagotchi.healthLevel <= 0 && !tamagotchi.isDead) {
          tamagotchi.isDead = true;
          state.deadCount += 1;
        }
      }
    },
    removeTamagotchi: (state, action: PayloadAction<string>) => {
      state.tamagotchis = state.tamagotchis.filter(t => t.id !== action.payload);
    },
  },
});

export const { addTamagotchi, feedTamagotchi, removeTamagotchi } = tamagotchiSlice.actions;
export default tamagotchiSlice.reducer; 