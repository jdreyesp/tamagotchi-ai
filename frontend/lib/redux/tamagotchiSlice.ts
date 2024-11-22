import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { generateRandomName } from '@/lib/utils/nameGenerator';
import { isNightTime } from '@/lib/utils/timeUtils';

export interface Pet extends Omit<Tamagotchi, 'pets'> {
  parentId: string;
}

export interface Tamagotchi {
  id: string;
  firstName: string;
  surname: string;
  level: number;
  hungerLevel: number;
  happinessLevel: number;
  healthLevel: number;
  createdAt: string;
  isDead?: boolean;
  pets: Pet[];
  lastPetCreatedAt?: string;
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

export const calculatePetCreationDelay = (tamagotchi: Tamagotchi): number => {
  // Base delay is 30 seconds
  const baseDelay = 30000;
  
  // Factors that reduce delay (better stats = faster breeding)
  const healthFactor = tamagotchi.healthLevel / 100;
  const happinessFactor = tamagotchi.happinessLevel / 100;
  // Hunger increases delay
  const hungerPenalty = (tamagotchi.hungerLevel / 100) * 1.5;

  // Calculate final delay (minimum 10 seconds, maximum 60 seconds)
  return clamp(
    baseDelay * (1 + hungerPenalty - healthFactor - happinessFactor),
    10000,
    60000
  );
};

const MAX_PETS = 3;

const tamagotchiSlice = createSlice({
  name: 'tamagotchi',
  initialState,
  reducers: {
    addTamagotchi: (state, action: PayloadAction<Omit<Tamagotchi, 'surname' | 'firstName'>>) => {
      const { firstName, surname } = generateRandomName();
      state.tamagotchis.push({
        ...action.payload,
        firstName,
        surname,
        pets: []
      });
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
    trainTamagotchi: (state, action: PayloadAction<string>) => {
      const tamagotchi = state.tamagotchis.find(t => t.id === action.payload);
      if (tamagotchi) {
        // Apply training effects
        tamagotchi.hungerLevel = clamp(tamagotchi.hungerLevel + 5, 0, 100);
        tamagotchi.happinessLevel = clamp(tamagotchi.happinessLevel - 10, 0, 100);
        tamagotchi.healthLevel = clamp(tamagotchi.healthLevel + 10, 0, 100);
        
        // Check for death
        if (tamagotchi.healthLevel <= 0 && !tamagotchi.isDead) {
          tamagotchi.isDead = true;
          state.deadCount += 1;
        }
      }
    },
    createPet: (state, action: PayloadAction<string>) => {
      const parent = state.tamagotchis.find(t => t.id === action.payload);
      if (parent && !parent.isDead) {
        parent.pets = parent.pets || [];
        if (parent.pets.length >= MAX_PETS) {
          return;
        }

        const { firstName } = generateRandomName();
        const newPet: Pet = {
          id: `${Date.now()}-pet`,
          parentId: parent.id,
          firstName,
          surname: parent.surname,
          level: 1,
          hungerLevel: 50,
          happinessLevel: 50,
          healthLevel: 50,
          createdAt: new Date().toISOString(),
          isDead: false,
          lastPetCreatedAt: undefined
        };
        
        parent.pets.push(newPet);
        parent.lastPetCreatedAt = new Date().toISOString();
      }
    },
    carePet: (state, action: PayloadAction<{ parentId: string, petId: string }>) => {
      const parent = state.tamagotchis.find(t => t.id === action.payload.parentId);
      if (parent) {
        const pet = parent.pets?.find(p => p.id === action.payload.petId);
        if (pet && !pet.isDead) {
          // Automatically care for pet
          if (pet.hungerLevel > 30) {
            pet.hungerLevel = clamp(pet.hungerLevel - 10, 0, 100);
            pet.happinessLevel = clamp(pet.happinessLevel + 5, 0, 100);
          }
          if (pet.healthLevel < 70) {
            pet.healthLevel = clamp(pet.healthLevel + 10, 0, 100);
            pet.hungerLevel = clamp(pet.hungerLevel + 5, 0, 100);
          }
          
          // Check for death
          if (pet.healthLevel <= 0 && !pet.isDead) {
            pet.isDead = true;
            state.deadCount += 1;
          }
        }
      }
    },
    decreaseHunger: (state, action: PayloadAction<string>) => {
      const tamagotchi = state.tamagotchis.find(t => t.id === action.payload);
      if (tamagotchi && !tamagotchi.isDead) {
        // Decrease hunger based on time of day
        const hungerDecrease = isNightTime() ? 1 : 5;
        tamagotchi.hungerLevel = clamp(tamagotchi.hungerLevel - hungerDecrease, 0, 100);

        // Check for death if hunger reaches 0
        if (tamagotchi.hungerLevel <= 0 && !tamagotchi.isDead) {
          tamagotchi.isDead = true;
          state.deadCount += 1;
        }
      }
    },
    decreasePetHunger: (state, action: PayloadAction<{ parentId: string, petId: string }>) => {
      const parent = state.tamagotchis.find(t => t.id === action.payload.parentId);
      if (parent) {
        const pet = parent.pets?.find(p => p.id === action.payload.petId);
        if (pet && !pet.isDead) {
          pet.hungerLevel = clamp(pet.hungerLevel - 5, 0, 100);

          // Check for death if hunger reaches 0
          if (pet.hungerLevel <= 0 && !pet.isDead) {
            pet.isDead = true;
            state.deadCount += 1;
          }
        }
      }
    },
  },
});

export const { 
  addTamagotchi, 
  feedTamagotchi, 
  removeTamagotchi, 
  trainTamagotchi,
  createPet,
  carePet,
  decreaseHunger,
  decreasePetHunger
} = tamagotchiSlice.actions;
export default tamagotchiSlice.reducer; 