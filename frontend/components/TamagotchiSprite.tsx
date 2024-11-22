'use client';

import { useSpring, animated, config } from '@react-spring/web';
import { useState, useEffect } from 'react';
import { Tamagotchi } from '@/lib/redux/tamagotchiSlice';
import { useDispatch } from 'react-redux';
import { feedTamagotchi, trainTamagotchi, removeTamagotchi } from '@/lib/redux/tamagotchiSlice';

interface Props {
  tamagotchi: Tamagotchi;
}

export default function TamagotchiSprite({ tamagotchi }: Props) {
  const [isJumping, setIsJumping] = useState(false);
  const [isEating, setIsEating] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const dispatch = useDispatch();

  // Death animation with onRest callback
  const deathAnimation = useSpring({
    opacity: tamagotchi.isDead ? 0 : 1,
    transform: tamagotchi.isDead ? 'rotate(360deg) scale(0)' : 'rotate(0deg) scale(1)',
    config: { 
      tension: 100,
      friction: 20,
      duration: 2000
    },
    onRest: () => {
      // Only dispatch removeTamagotchi when the death animation finishes
      if (tamagotchi.isDead) {
        dispatch(removeTamagotchi(tamagotchi.id));
      }
    },
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

  return (
    <div className="relative flex flex-col items-center">
      {/* Stats Display */}
      <div className="mb-4 grid grid-cols-3 gap-4 text-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className={`w-3 h-3 mr-1 ${tamagotchi.healthLevel <= 0 ? 'bg-gray-500' : 'bg-red-500'} rounded-full`}></span>
            <span className="font-medium">Health</span>
          </div>
          <span className="ml-2">{tamagotchi.healthLevel}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="w-3 h-3 mr-1 bg-yellow-500 rounded-full"></span>
            <span className="font-medium">Hunger</span>
          </div>
          <span className="ml-2">{tamagotchi.hungerLevel}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="w-3 h-3 mr-1 bg-pink-500 rounded-full"></span>
            <span className="font-medium">Happy</span>
          </div>
          <span className="ml-2">{tamagotchi.happinessLevel}</span>
        </div>
      </div>

      <div className="relative" onClick={() => !tamagotchi.isDead && setIsJumping(!isJumping)}>
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
            {tamagotchi.name}
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
  );
} 