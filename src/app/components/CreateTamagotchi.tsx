'use client';

import { useState } from 'react';
import { CreateTamagotchiInput } from '@/src/app/lib/types/tamagotchi';

interface Props {
  onCreateTamagotchi: (data: CreateTamagotchiInput) => void;
}

export default function CreateTamagotchi({ onCreateTamagotchi }: Props) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateTamagotchi({ name });
    setName(''); // Clear the input after submission
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
      <div className="flex flex-col space-y-2">
        <label htmlFor="name" className="text-lg font-medium">
          Name your Tamagotchi
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter Tamagotchi name"
          required
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button 
        type="submit"
        className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Create Tamagotchi
      </button>
    </form>
  );
} 