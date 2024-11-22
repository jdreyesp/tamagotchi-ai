import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/redux/store';
import { startFight, fightRound } from '@/lib/redux/tamagotchiSlice';
import { animated, useSpring } from '@react-spring/web';

export default function FightArena() {
  const dispatch = useDispatch();
  const { tamagotchis, currentFight } = useSelector((state: RootState) => state.tamagotchi);

  // Initial check and interval for finding fighters
  useEffect(() => {
    const checkForFighters = () => {
      if (currentFight.isActive) return;

      const availablePets = tamagotchis.flatMap(t => 
        t.pets.filter(p => !p.isDead && !p.isFighting && !p.isOrphan)
          .map(p => ({ petId: p.id, parentId: t.id }))
      );

      if (availablePets.length >= 2) {
        const fighter1 = availablePets[Math.floor(Math.random() * availablePets.length)];
        const remainingPets = availablePets.filter(p => p.petId !== fighter1.petId);
        const fighter2 = remainingPets[Math.floor(Math.random() * remainingPets.length)];

        dispatch(startFight({ fighter1, fighter2 }));
      }
    };

    // Initial check
    checkForFighters();

    // Set up interval
    const interval = setInterval(checkForFighters, 10000);
    return () => clearInterval(interval);
  }, [tamagotchis, currentFight.isActive, dispatch]);

  // Fight rounds - slower pace
  useEffect(() => {
    if (!currentFight.isActive) return;

    const interval = setInterval(() => {
      dispatch(fightRound());
    }, 3000);

    return () => clearInterval(interval);
  }, [currentFight.isActive, dispatch]);

  if (!currentFight.isActive) return null;

  return (
    <div className="fixed right-0 top-20 transform bg-red-50 p-6 rounded-l-xl shadow-lg border-l-2 border-t-2 border-b-2 border-red-200 w-96 z-50">
      <h2 className="text-center text-xl font-bold text-red-600 mb-4">⚔️ FIGHT! ⚔️</h2>
      <div className="flex justify-between items-center">
        {/* Fighters */}
        {currentFight.fighter1 && currentFight.fighter2 && (
          <>
            <FightingPet fighter={currentFight.fighter1} position="left" />
            <div className="text-2xl font-bold text-red-500">VS</div>
            <FightingPet fighter={currentFight.fighter2} position="right" />
          </>
        )}
      </div>
    </div>
  );
}

function FightingPet({ fighter, position }: { fighter: { petId: string; parentId: string }, position: 'left' | 'right' }) {
  const tamagotchis = useSelector((state: RootState) => state.tamagotchi.tamagotchis);
  const parent = tamagotchis.find(t => t.id === fighter.parentId);
  const pet = parent?.pets.find(p => p.id === fighter.petId);

  const punchAnimation = useSpring({
    transform: position === 'left' ? 'translateX(20px)' : 'translateX(-20px)',
    config: { tension: 300, friction: 10 },
    loop: { reverse: true, delay: 3000 }, // Match the fight round interval
  });

  if (!pet) return null;

  return (
    <div className="text-center">
      <animated.div style={punchAnimation}>
        <svg width="50" height="50" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="30" fill="#FFB6C1" />
          <circle cx="40" cy="45" r="5" fill="black" />
          <circle cx="60" cy="45" r="5" fill="black" />
          <path d="M 40 60 Q 50 65 60 60" fill="none" stroke="black" strokeWidth="2" />
          
          {/* Add fighting arms */}
          <path 
            d={position === 'left' 
              ? "M80 50 L100 50" // Right punch for left fighter
              : "M0 50 L20 50"   // Left punch for right fighter
            }
            stroke="black"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </animated.div>
      <div className="mt-2">
        <div className="font-medium text-sm">{pet.firstName}</div>
        <div className="text-xs text-gray-600">Level {pet.maturityLevel}</div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
          <div 
            className="bg-red-500 rounded-full h-2 transition-all duration-300"
            style={{ width: `${pet.healthLevel}%` }}
          />
        </div>
      </div>
    </div>
  );
} 