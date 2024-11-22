'use client'

import CreateTamagotchi from '@/src/app/components/CreateTamagotchi';
import TamagotchiSprite from '@/src/app/components/TamagotchiSprite';
import { CreateTamagotchiInput } from '@/src/app/lib/types/tamagotchi';
import { useDispatch, useSelector } from 'react-redux';
import { addTamagotchi, Tamagotchi } from '@/src/app/lib/redux/tamagotchiSlice';
import { RootState } from '@/src/app/lib/redux/store';
import FightArena from '@/src/app/components/FightArena';

export default function Home() {
  const dispatch = useDispatch();
  const tamagotchis = useSelector((state: RootState) => state.tamagotchi.tamagotchis);

  const handleCreateTamagotchi = async (data: CreateTamagotchiInput) => {
    try {
      const newTamagotchi: Tamagotchi = {
        id: Date.now().toString(),
        level: 1,
        hungerLevel: 50,
        happinessLevel: 50,
        healthLevel: 50,
        createdAt: new Date().toISOString(),
        pets: [],
        firstName: data.name,
        surname: ''
      };

      dispatch(addTamagotchi(newTamagotchi));
    } catch (error) {
      console.error('Error creating Tamagotchi:', error);
    }
  };

  return (
    <main className="min-h-screen p-8">
      <CreateTamagotchi onCreateTamagotchi={handleCreateTamagotchi} />
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tamagotchis.map((tamagotchi: Tamagotchi) => (
          <div 
            key={tamagotchi.id}
            className="p-4 border rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <TamagotchiSprite tamagotchi={tamagotchi} />
          </div>
        ))}
      </div>
      <FightArena />
    </main>
  );
} 