'use client'

import CreateTamagotchi from '@/components/CreateTamagotchi';
import TamagotchiSprite from '@/components/TamagotchiSprite';
import { CreateTamagotchiInput } from '@/lib/types/tamagotchi';
import { useDispatch, useSelector } from 'react-redux';
import { addTamagotchi } from '@/lib/redux/tamagotchiSlice';
import { RootState } from '@/lib/redux/store';

export default function Home() {
  const dispatch = useDispatch();
  const tamagotchis = useSelector((state: RootState) => state.tamagotchi.tamagotchis);

  const handleCreateTamagotchi = async (data: CreateTamagotchiInput) => {
    try {
      const newTamagotchi = {
        id: Date.now().toString(),
        name: data.name,
        level: 1,
        hungerLevel: 50,
        happinessLevel: 50,
        healthLevel: 50,
        createdAt: new Date().toISOString(),
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
        {tamagotchis.map((tamagotchi) => (
          <div 
            key={tamagotchi.id}
            className="p-4 border rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <TamagotchiSprite tamagotchi={tamagotchi} />
          </div>
        ))}
      </div>
    </main>
  );
} 