import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { generateRandomName } from '@/src/app/lib/utils/nameGenerator';
import { isNightTime } from '@/src/app/lib/utils/timeUtils';

export interface Pet extends Omit<Tamagotchi, 'pets'> {
  parentId: string;
  isOrphan?: boolean;
  maturityLevel: number;
  isFighting?: boolean;
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

interface FightState {
  isActive: boolean;
  fighter1?: { petId: string; parentId: string };
  fighter2?: { petId: string; parentId: string };
}

interface TamagotchiState {
  tamagotchis: Tamagotchi[];
  deadCount: number;
  currentFight: FightState;
}

const initialState: TamagotchiState = {
  tamagotchis: [],
  deadCount: 0,
  currentFight: { isActive: false }
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

const checkForDeath = (entity: Tamagotchi | Pet) => {
  return entity.healthLevel <= 0 || entity.happinessLevel <= 0 || entity.hungerLevel >= 100;
};

const handleOrphanLogic = (state: TamagotchiState, parentId: string) => {
  const deadParent = state.tamagotchis.find(t => t.id === parentId);
  if (deadParent && deadParent.pets) {
    deadParent.pets.forEach(pet => {
      if (!pet.isDead) {
        pet.isOrphan = true;
      }
    });
  }
};

const tamagotchiSlice = createSlice({
  name: 'tamagotchi',
  initialState,
  reducers: {
    addTamagotchi: (state, action: PayloadAction<Omit<Tamagotchi, 'surname'> & { firstName: string }>) => {
      const { surname } = generateRandomName();
      state.tamagotchis.push({
        ...action.payload,
        surname,
        pets: []
      });
    },
    feedTamagotchi: (state, action: PayloadAction<string>) => {
      const tamagotchi = state.tamagotchis.find(t => t.id === action.payload);
      if (tamagotchi) {
        tamagotchi.hungerLevel = clamp(tamagotchi.hungerLevel - 10, 0, 100);
        tamagotchi.happinessLevel = clamp(tamagotchi.happinessLevel + 5, 0, 100);
        tamagotchi.healthLevel = clamp(tamagotchi.healthLevel - 5, 0, 100);
        
        if (checkForDeath(tamagotchi) && !tamagotchi.isDead) {
          tamagotchi.isDead = true;
          state.deadCount += 1;
          handleOrphanLogic(state, tamagotchi.id);
        }
      }
    },
    removeTamagotchi: (state, action: PayloadAction<string>) => {
      state.tamagotchis = state.tamagotchis.filter(t => t.id !== action.payload);
    },
    trainTamagotchi: (state, action: PayloadAction<string>) => {
      const tamagotchi = state.tamagotchis.find(t => t.id === action.payload);
      if (tamagotchi) {
        tamagotchi.hungerLevel = clamp(tamagotchi.hungerLevel + 5, 0, 100);
        tamagotchi.happinessLevel = clamp(tamagotchi.happinessLevel - 10, 0, 100);
        tamagotchi.healthLevel = clamp(tamagotchi.healthLevel + 10, 0, 100);
        
        if (checkForDeath(tamagotchi) && !tamagotchi.isDead) {
          tamagotchi.isDead = true;
          state.deadCount += 1;
          handleOrphanLogic(state, tamagotchi.id);
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
          lastPetCreatedAt: undefined,
          maturityLevel: 0,
          isFighting: false
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
          
          if (checkForDeath(pet) && !pet.isDead) {
            pet.isDead = true;
            state.deadCount += 1;
          }
        }
      }
    },
    decreaseHunger: (state, action: PayloadAction<string>) => {
      const tamagotchi = state.tamagotchis.find(t => t.id === action.payload);
      if (tamagotchi && !tamagotchi.isDead) {
        const hungerDecrease = isNightTime() ? 1 : 5;
        tamagotchi.hungerLevel = clamp(tamagotchi.hungerLevel - hungerDecrease, 0, 100);

        if (checkForDeath(tamagotchi) && !tamagotchi.isDead) {
          tamagotchi.isDead = true;
          state.deadCount += 1;
          handleOrphanLogic(state, tamagotchi.id);
        }
      }
    },
    orphanSuffering: (state, action: PayloadAction<{ parentId: string, petId: string }>) => {
      const parent = state.tamagotchis.find(t => t.id === action.payload.parentId);
      if (parent) {
        const pet = parent.pets?.find(p => p.id === action.payload.petId);
        if (pet && !pet.isDead) {
          if (pet.isOrphan) {
            // Orphans suffer more over time
            pet.hungerLevel = clamp(pet.hungerLevel + 10, 0, 100);
            pet.healthLevel = clamp(pet.healthLevel - 5, 0, 100);
            pet.happinessLevel = clamp(pet.happinessLevel - 5, 0, 100);
          } else {
            // Normal pets lose hunger over time
            pet.hungerLevel = clamp(pet.hungerLevel - 5, 0, 100);
          }

          // Check for death with new conditions
          if (checkForDeath(pet) && !pet.isDead) {
            pet.isDead = true;
            state.deadCount += 1;
          }
        }
      }
    },
    handleParentDeath: (state, action: PayloadAction<string>) => {
      const deadParent = state.tamagotchis.find(t => t.id === action.payload);
      if (deadParent && deadParent.pets) {
        deadParent.pets.forEach(pet => {
          if (!pet.isDead) {
            pet.isOrphan = true;
          }
        });
      }
    },
    tryAdoptOrphans: (state) => {
      const availableParents = state.tamagotchis.filter(t => !t.isDead && t.pets.length < MAX_PETS);
      
      state.tamagotchis.forEach(parent => {
        if (parent.isDead && parent.pets) {
          parent.pets.forEach(pet => {
            if (pet.isOrphan && !pet.isDead) {
              // Try to find new parent
              const newParent = availableParents.find(p => p.pets.length < MAX_PETS);
              if (newParent) {
                // Remove from old parent
                parent.pets = parent.pets.filter(p => p.id !== pet.id);
                // Add to new parent
                pet.isOrphan = false;
                pet.parentId = newParent.id;
                newParent.pets.push(pet);
              }
            }
          });
        }
      });
    },
    startFight: (state, action: PayloadAction<{ fighter1: { petId: string; parentId: string }; fighter2: { petId: string; parentId: string } }>) => {
      const { fighter1, fighter2 } = action.payload;
      
      // Find pets
      const pet1Parent = state.tamagotchis.find(t => t.id === fighter1.parentId);
      const pet2Parent = state.tamagotchis.find(t => t.id === fighter2.parentId);
      const pet1 = pet1Parent?.pets.find(p => p.id === fighter1.petId);
      const pet2 = pet2Parent?.pets.find(p => p.id === fighter2.petId);

      if (pet1 && pet2 && !pet1.isDead && !pet2.isDead && !pet1.isFighting && !pet2.isFighting) {
        state.currentFight = {
          isActive: true,
          fighter1,
          fighter2
        };
        pet1.isFighting = true;
        pet2.isFighting = true;
      }
    },
    fightRound: (state) => {
      if (!state.currentFight.isActive || !state.currentFight.fighter1 || !state.currentFight.fighter2) return;

      const pet1Parent = state.tamagotchis.find(t => t.id === state.currentFight.fighter1!.parentId);
      const pet2Parent = state.tamagotchis.find(t => t.id === state.currentFight.fighter2!.parentId);
      const pet1 = pet1Parent?.pets.find(p => p.id === state.currentFight.fighter1!.petId);
      const pet2 = pet2Parent?.pets.find(p => p.id === state.currentFight.fighter2!.petId);

      if (!pet1 || !pet2) return;

      // Both pets deal damage
      const damage1 = Math.floor(Math.random() * 20) + 10; // 10-30 damage
      const damage2 = Math.floor(Math.random() * 20) + 10;

      pet1.healthLevel = clamp(pet1.healthLevel - damage2, 0, 100);
      pet2.healthLevel = clamp(pet2.healthLevel - damage1, 0, 100);

      // Check for winner
      if (pet1.healthLevel <= 0 || pet2.healthLevel <= 0) {
        const winner = pet1.healthLevel > 0 ? pet1 : pet2;
        const loser = pet1.healthLevel > 0 ? pet2 : pet1;

        winner.maturityLevel += 1;
        loser.isDead = true;
        state.deadCount += 1;

        // Check if winner should evolve into a Tamagotchi
        if (winner.maturityLevel >= 3) {
          const newTamagotchi: Tamagotchi = {
            id: `${Date.now()}-evolved`,
            firstName: winner.firstName,
            surname: winner.surname,
            level: 1,
            hungerLevel: winner.hungerLevel,
            happinessLevel: winner.happinessLevel,
            healthLevel: 100, // Full health on evolution
            createdAt: new Date().toISOString(),
            pets: []
          };
          state.tamagotchis.push(newTamagotchi);

          // Remove evolved pet from parent
          const winnerParent = state.tamagotchis.find(t => t.id === winner.parentId);
          if (winnerParent) {
            winnerParent.pets = winnerParent.pets.filter(p => p.id !== winner.id);
          }
        }

        // End fight
        state.currentFight = { isActive: false };
        pet1.isFighting = false;
        pet2.isFighting = false;
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
  orphanSuffering,
  handleParentDeath,
  tryAdoptOrphans,
  startFight,
  fightRound,
} = tamagotchiSlice.actions;
export default tamagotchiSlice.reducer; 