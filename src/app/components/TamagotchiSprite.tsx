'use client';

import { useSpring, animated, config } from '@react-spring/web';
import { useState, useEffect, useCallback } from 'react';
import { Tamagotchi } from '@/src/app/lib/redux/tamagotchiSlice';
import { useDispatch } from 'react-redux';
import { 
  feedTamagotchi, 
  trainTamagotchi, 
  removeTamagotchi, 
  createPet, 
  carePet,
  calculatePetCreationDelay,
  decreaseHunger,
  orphanSuffering,
  tryAdoptOrphans
} from '@/src/app/lib/redux/tamagotchiSlice';
import DialogBubble from './DialogBubble';
import { tamagotchiPhrases, hungryPhrases, sadPhrases, orphanPhrases, getRandomPhrase } from '@/src/app/lib/utils/dialogPhrases';

interface Props {
  tamagotchi: Tamagotchi;
}

// Move animation config outside component
const getPetDeathStyle = (isDead: boolean) => ({
  opacity: isDead ? 0.5 : 1,
  transform: isDead ? 'rotate(360deg)' : 'rotate(0deg)',
  config: { 
    tension: 100,
    friction: 20,
    duration: 2000
  }
});

export default function TamagotchiSprite({ tamagotchi }: Props) {
  const [isJumping, setIsJumping] = useState(false);
  const [isEating, setIsEating] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const dispatch = useDispatch();
  const [, forceUpdate] = useState({});
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [petDialogs, setPetDialogs] = useState<Record<string, { show: boolean; message: string }>>({});

  // Create a single spring for all pets
  const petDeathAnimation = useSpring(getPetDeathStyle(false));

  // Death animation without removal
  const deathAnimation = useSpring({
    opacity: tamagotchi.isDead ? 0.5 : 1,
    transform: tamagotchi.isDead ? 'rotate(360deg)' : 'rotate(0deg)',
    config: { 
      tension: 100,
      friction: 20,
      duration: 2000
    }
  });

  const handleFeed = () => {
    if (tamagotchi.isDead) return; // Prevent feeding dead tamagotchi
    setIsEating(true);
    dispatch(feedTamagotchi(tamagotchi.id));
    setTimeout(() => setIsEating(false), 1000);
  };

  const handleTrain = () => {
    if (tamagotchi.isDead) return;
    setIsTraining(true);
    dispatch(trainTamagotchi(tamagotchi.id));
    setTimeout(() => setIsTraining(false), 1000);
  };

  // Animations...
  const idleAnimation = useSpring({
    from: { transform: 'translateY(0px)' },
    to: { transform: 'translateY(-2px)' },
    config: { tension: 300, friction: 10 },
    loop: { reverse: true },
  });

  const jumpAnimation = useSpring({
    transform: isJumping ? 'translateY(-20px)' : 'translateY(0px)',
    config: { tension: 300, friction: 10 },
  });

  // Add arm flex animation
  const armAnimation = useSpring({
    transform: isTraining ? 'rotate(-45deg)' : 'rotate(0deg)',
    config: { tension: 300, friction: 10 },
  });

  // Combine animations
  const combinedAnimation = {
    ...idleAnimation,
    ...jumpAnimation,
    ...deathAnimation,
  };

  // Pet creation interval
  useEffect(() => {
    if (tamagotchi.isDead) return;

    const checkAndCreatePet = () => {
      const delay = calculatePetCreationDelay(tamagotchi);
      const lastPetTime = tamagotchi.lastPetCreatedAt 
        ? new Date(tamagotchi.lastPetCreatedAt).getTime() 
        : 0;
      
      if (Date.now() - lastPetTime >= delay) {
        dispatch(createPet(tamagotchi.id));
      }
    };

    const interval = setInterval(checkAndCreatePet, 1000);
    return () => clearInterval(interval);
  }, [tamagotchi, dispatch]);

  // Pet care interval
  useEffect(() => {
    if (tamagotchi.isDead || !tamagotchi.pets?.length) return;

    const interval = setInterval(() => {
      tamagotchi.pets.forEach(pet => {
        if (!pet.isDead) {
          dispatch(carePet({ parentId: tamagotchi.id, petId: pet.id }));
        }
      });
    }, 5000); // Care for pets every 5 seconds

    return () => clearInterval(interval);
  }, [tamagotchi, dispatch]);

  // Hunger decrease interval for Tamagotchi
  useEffect(() => {
    if (tamagotchi.isDead) return;

    const interval = setInterval(() => {
      dispatch(decreaseHunger(tamagotchi.id));
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(interval);
  }, [tamagotchi.id, dispatch]);

  // Hunger decrease interval for Pets
  useEffect(() => {
    if (!tamagotchi.pets?.length) return;

    const interval = setInterval(() => {
      tamagotchi.pets.forEach(pet => {
        if (!pet.isDead) {
          // If pet is orphaned, decrease stats more aggressively
          if (pet.isOrphan) {
            dispatch(orphanSuffering({ parentId: tamagotchi.id, petId: pet.id }));
          } else if (!tamagotchi.isDead) {
            // Only decrease stats for non-orphaned pets if parent is alive
            dispatch(orphanSuffering({ parentId: tamagotchi.id, petId: pet.id }));
          }
        }
      });
    }, 10 * 1000); // Every 10 seconds

    return () => clearInterval(interval);
  }, [tamagotchi, dispatch]);

  // Add orphan check interval - only when there are orphaned pets
  useEffect(() => {
    // Check if this tamagotchi has any orphaned pets
    const hasOrphanPets = tamagotchi.pets?.some(pet => pet.isOrphan && !pet.isDead);
    
    if (!hasOrphanPets) return;

    const interval = setInterval(() => {
      dispatch(tryAdoptOrphans());
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [tamagotchi.pets, dispatch]);

  // Add timer to update orphan countdown
  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate({});  // Force re-render every second to update timer display
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Random dialog effect
  useEffect(() => {
    const showRandomDialog = () => {
      if (tamagotchi.isDead) return;

      let phrases = tamagotchiPhrases;
      if (tamagotchi.hungerLevel >= 80) {
        phrases = hungryPhrases;
      } else if (tamagotchi.happinessLevel <= 30) {
        phrases = sadPhrases;
      }

      setDialogMessage(getRandomPhrase(phrases));
      setShowDialog(true);
      setTimeout(() => setShowDialog(false), 3000);
    };

    const interval = setInterval(showRandomDialog, 10000 + Math.random() * 10000);
    return () => clearInterval(interval);
  }, [tamagotchi.isDead, tamagotchi.hungerLevel, tamagotchi.happinessLevel]);

  // Random dialog effect for pets
  useEffect(() => {
    if (!tamagotchi.pets?.length) return;

    const intervals: NodeJS.Timeout[] = [];

    tamagotchi.pets.forEach(pet => {
      const showRandomDialog = () => {
        if (pet.isDead) return;

        let phrases = tamagotchiPhrases;
        if (pet.hungerLevel >= 80) {
          phrases = hungryPhrases;
        } else if (pet.happinessLevel <= 30) {
          phrases = sadPhrases;
        } else if (pet.isOrphan) {
          phrases = orphanPhrases;
        }

        setPetDialogs(prev => ({
          ...prev,
          [pet.id]: { show: true, message: getRandomPhrase(phrases) }
        }));

        setTimeout(() => {
          setPetDialogs(prev => ({
            ...prev,
            [pet.id]: { ...prev[pet.id], show: false }
          }));
        }, 3000);
      };

      const interval = setInterval(showRandomDialog, 15000 + Math.random() * 10000);
      intervals.push(interval);
    });

    return () => intervals.forEach(clearInterval);
  }, [tamagotchi.pets]);

  return (
    <div className="relative bg-gradient-to-br from-pink-50 to-purple-50 p-6 rounded-xl shadow-lg border-2 border-pink-100">
      {/* Family Title */}
      <h2 className="text-center mb-4 font-bold text-lg text-pink-600">
        The {tamagotchi.surname} Family
      </h2>

      <div className="flex items-start gap-8">
        {/* Parent Container */}
        <div className="flex-shrink-0">
          {/* Stats Display */}
          <div className="mb-4 bg-white p-3 rounded-lg shadow-sm space-y-2">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center">
                <span className={`w-3 h-3 mr-1 ${tamagotchi.healthLevel <= 0 ? 'bg-gray-500' : 'bg-red-500'} rounded-full`}></span>
                <span className="font-medium text-gray-600">Health</span>
              </div>
              <span className="font-bold text-gray-700">{tamagotchi.healthLevel}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center">
                <span className="w-3 h-3 mr-1 bg-yellow-500 rounded-full"></span>
                <span className="font-medium text-gray-600">Hunger</span>
              </div>
              <span className="font-bold text-gray-700">{tamagotchi.hungerLevel}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center">
                <span className="w-3 h-3 mr-1 bg-pink-500 rounded-full"></span>
                <span className="font-medium text-gray-600">Happy</span>
              </div>
              <span className="font-bold text-gray-700">{tamagotchi.happinessLevel}</span>
            </div>
          </div>

          {/* Tamagotchi Sprite Container */}
          <div className="relative bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            {showDialog && <DialogBubble message={dialogMessage} />}
            <animated.svg
              style={combinedAnimation}
              width="100"
              height="100"
              viewBox="0 0 100 100"
              className={`cursor-pointer ${tamagotchi.isDead ? 'pointer-events-none' : ''}`}
            >
              {/* Body */}
              <circle 
                cx="50" 
                cy="50" 
                r="30" 
                fill={tamagotchi.isDead ? "#cccccc" : "#FFB6C1"} 
              />
              
              {/* Arms - they get buffer at high health - MOVED BEFORE FACE */}
              <animated.path
                d={tamagotchi.healthLevel >= 100 
                  ? "M20 65 Q 35 60 40 65" // Muscular arm, moved lower
                  : "M20 65 Q 35 65 40 65" // Normal arm, moved lower
                }
                stroke="black"
                strokeWidth={tamagotchi.healthLevel >= 100 ? "4" : "2"}
                fill="none"
                style={armAnimation}
              />
              <animated.path
                d={tamagotchi.healthLevel >= 100 
                  ? "M80 65 Q 65 60 60 65" // Muscular arm, moved lower
                  : "M80 65 Q 65 65 60 65" // Normal arm, moved lower
                }
                stroke="black"
                strokeWidth={tamagotchi.healthLevel >= 100 ? "4" : "2"}
                fill="none"
                style={armAnimation}
              />

              {/* Eyes */}
              {tamagotchi.isDead ? (
                // X eyes for dead state
                <>
                  <path d="M35 40 L45 50 M45 40 L35 50" stroke="black" strokeWidth="2" />
                  <path d="M55 40 L65 50 M65 40 L55 50" stroke="black" strokeWidth="2" />
                </>
              ) : (
                // Normal eyes
                <>
                  <circle 
                    cx="40" 
                    cy="45" 
                    r="5" 
                    fill="black" 
                    style={{ transform: isEating ? 'scaleY(0.5)' : 'none' }}
                  />
                  <circle 
                    cx="60" 
                    cy="45" 
                    r="5" 
                    fill="black"
                    style={{ transform: isEating ? 'scaleY(0.5)' : 'none' }}
                  />
                </>
              )}
              
              {/* Mouth */}
              <path
                d={tamagotchi.isDead 
                  ? "M 40 65 Q 50 60 60 65" // Sad mouth for dead state
                  : isEating 
                    ? "M 40 60 Q 50 70 60 60" 
                    : "M 40 60 Q 50 65 60 60"
                }
                fill="none"
                stroke="black"
                strokeWidth="2"
              />

              {/* Name tag */}
              <text
                x="50"
                y="90"
                textAnchor="middle"
                fill={tamagotchi.isDead ? "#999" : "black"}
                fontSize="12"
                fontFamily="Arial"
              >
                {`${tamagotchi.firstName} ${tamagotchi.surname}`}
              </text>
            </animated.svg>

            {/* Feed Button */}
            {!tamagotchi.isDead && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFeed();
                }}
                className="absolute -right-8 top-1/2 transform -translate-y-1/2 p-2 bg-yellow-100 rounded-full hover:bg-yellow-200 transition-colors"
                title="Feed Tamagotchi"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="text-yellow-600"
                >
                  {/* Drumstick meat */}
                  <path
                    d="M8 8C8 8 9 6 12 6C15 6 16 8 16 8C16 8 18 9 18 12C18 15 16 16 16 16L10 18L8 16C8 16 6 15 6 12C6 9 8 8 8 8Z"
                    fill="#D4A373"
                    stroke="#A77B4D"
                    strokeWidth="1.5"
                  />
                  {/* Bone */}
                  <path
                    d="M10 18L7 21"
                    stroke="#E5E5E5"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  {/* Crispy texture details */}
                  <path
                    d="M10 8C10 8 11 9 11 10M14 8C14 8 13 9 13 10M12 11C12 11 13 12 13 13"
                    stroke="#8B5E34"
                    strokeWidth="1"
                    strokeLinecap="round"
                  />
                  {/* Highlight */}
                  <path
                    d="M13 8C13 8 14.5 8.5 15 9"
                    stroke="#E9C39B"
                    strokeWidth="1"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            )}

            {/* Training Button */}
            {!tamagotchi.isDead && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleTrain();
                }}
                className="absolute -left-8 top-1/2 transform -translate-y-1/2 p-2 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors"
                title="Train Tamagotchi"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="text-blue-600"
                >
                  {/* Dumbbell */}
                  <path
                    d="M6 8L18 8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  {/* Left weight */}
                  <rect x="2" y="6" width="4" height="4" fill="currentColor" />
                  {/* Right weight */}
                  <rect x="18" y="6" width="4" height="4" fill="currentColor" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Pets Container */}
        {tamagotchi.pets?.length > 0 && (
          <div className="flex-grow">
            <h3 className="text-sm font-medium text-purple-600 mb-3">Pets</h3>
            <div className="grid gap-4">
              {tamagotchi.pets.map((pet) => (
                <div 
                  key={pet.id} 
                  className={`relative bg-white p-3 rounded-lg shadow-md transition-all duration-300 
                    ${pet.isDead ? 'opacity-50' : 'hover:shadow-lg hover:-translate-y-1'}
                    ${pet.isOrphan ? 'border-2 border-red-200' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    {/* Pet Stats */}
                    <div className="bg-gray-50 p-2 rounded-md space-y-1">
                      <div className="flex items-center justify-between w-20">
                        <div className="flex items-center">
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                          <span className="ml-1 font-medium text-xs text-gray-600">Health</span>
                        </div>
                        <span className="text-xs font-bold text-gray-700">{pet.healthLevel}</span>
                      </div>
                      <div className="flex items-center justify-between w-20">
                        <div className="flex items-center">
                          <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                          <span className="ml-1 font-medium text-xs text-gray-600">Hunger</span>
                        </div>
                        <span className="text-xs font-bold text-gray-700">{pet.hungerLevel}</span>
                      </div>
                      <div className="flex items-center justify-between w-20">
                        <div className="flex items-center">
                          <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                          <span className="ml-1 font-medium text-xs text-gray-600">Happy</span>
                        </div>
                        <span className="text-xs font-bold text-gray-700">{pet.happinessLevel}</span>
                      </div>
                    </div>

                    {/* Pet Sprite and Dialog */}
                    <div className="relative flex-grow">
                      {petDialogs[pet.id]?.show && (
                        <DialogBubble 
                          message={petDialogs[pet.id]?.message || ''} 
                          position="left" 
                        />
                      )}
                      {/* Pet Sprite */}
                      <animated.svg
                        width="50"
                        height="50"
                        viewBox="0 0 100 100"
                        className={`${pet.isDead ? 'pointer-events-none' : ''} transition-transform`}
                        style={{
                          ...petDeathAnimation,
                          transform: pet.hungerLevel <= 30 ? 'scale(0.95)' : 'scale(1)',
                          transition: 'transform 0.3s ease-in-out'
                        }}
                      >
                        {/* Mini Tamagotchi body */}
                        <circle 
                          cx="50" 
                          cy="50" 
                          r="30" 
                          fill={pet.isDead ? "#cccccc" : "#FFB6C1"} 
                        />
                        
                        {/* Mini arms */}
                        <path
                          d={pet.healthLevel >= 70 
                            ? "M20 65 Q 35 60 40 65" 
                            : "M20 65 Q 35 65 40 65"
                          }
                          stroke="black"
                          strokeWidth={pet.healthLevel >= 70 ? "3" : "1.5"}
                          fill="none"
                        />
                        <path
                          d={pet.healthLevel >= 70 
                            ? "M80 65 Q 65 60 60 65" 
                            : "M80 65 Q 65 65 60 65"
                          }
                          stroke="black"
                          strokeWidth={pet.healthLevel >= 70 ? "3" : "1.5"}
                          fill="none"
                        />
                        
                        {/* Mini eyes */}
                        {pet.isDead ? (
                          // X eyes for dead state
                          <>
                            <path d="M35 40 L45 50 M45 40 L35 50" stroke="black" strokeWidth="2" />
                            <path d="M55 40 L65 50 M65 40 L55 50" stroke="black" strokeWidth="2" />
                          </>
                        ) : (
                          // Normal eyes
                          <>
                            <circle 
                              cx="40" 
                              cy="45" 
                              r="4" 
                              fill="black" 
                              style={{ 
                                transform: pet.hungerLevel <= 30 ? 'scaleY(0.5)' : 'none',
                                transformOrigin: '40px 45px'
                              }}
                            />
                            <circle 
                              cx="60" 
                              cy="45" 
                              r="4" 
                              fill="black"
                              style={{ 
                                transform: pet.hungerLevel <= 30 ? 'scaleY(0.5)' : 'none',
                                transformOrigin: '60px 45px'
                              }}
                            />
                          </>
                        )}
                        
                        {/* Mini mouth - changes based on happiness or death */}
                        <path
                          d={pet.isDead
                            ? "M 40 65 Q 50 60 60 65" // Sad mouth for dead state
                            : pet.happinessLevel >= 70 
                              ? "M 40 60 Q 50 70 60 60"  // Happy mouth
                              : pet.happinessLevel <= 30
                                ? "M 40 65 Q 50 60 60 65"  // Sad mouth
                                : "M 40 60 Q 50 65 60 60"  // Neutral mouth
                          }
                          fill="none"
                          stroke="black"
                          strokeWidth="2"
                        />

                        {/* Activity indicators only show if pet is alive */}
                        {!pet.isDead && (
                          <>
                            {pet.hungerLevel <= 30 && (
                              <circle 
                                cx="80" 
                                cy="20" 
                                r="5" 
                                fill="#FFB6C1"
                                opacity={0.7}
                              >
                                <animate
                                  attributeName="opacity"
                                  values="0.7;0.3;0.7"
                                  dur="1s"
                                  repeatCount="indefinite"
                                />
                              </circle>
                            )}
                            {pet.healthLevel < 70 && (
                              <circle 
                                cx="20" 
                                cy="20" 
                                r="5" 
                                fill="#90CDF4"
                                opacity={0.7}
                              >
                                <animate
                                  attributeName="opacity"
                                  values="0.7;0.3;0.7"
                                  dur="1s"
                                  repeatCount="indefinite"
                                />
                              </circle>
                            )}
                          </>
                        )}
                      </animated.svg>
                    </div>
                  </div>

                  {/* Pet Name and Status */}
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded-full shadow-sm">
                    <span className="text-xs font-medium text-gray-700">{`${pet.firstName} ${pet.surname}`}</span>
                    {pet.isOrphan && (
                      <span className="ml-1 text-xs font-bold text-red-500">
                        ❤️ Needs Family
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 