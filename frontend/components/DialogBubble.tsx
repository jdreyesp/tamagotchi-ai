import { animated, useSpring } from '@react-spring/web';
import React from 'react';

interface DialogBubbleProps {
  message: string;
  position?: 'left' | 'right';
}

export default function DialogBubble({ message, position = 'right' }: DialogBubbleProps) {
  const animation = useSpring({
    from: { opacity: 0, transform: 'scale(0) translateY(10px)' },
    to: { opacity: 1, transform: 'scale(1) translateY(0px)' },
    config: { tension: 300, friction: 10 },
  });

  return (
    <animated.div 
      style={animation} 
      className={`absolute -top-16 ${position === 'right' ? '-right-32' : '-left-32'} bg-white rounded-lg p-2 shadow-lg z-10 min-w-[120px] max-w-[150px]`}
    >
      {/* Dialog bubble tail */}
      <div className={`absolute bottom-0 ${position === 'right' ? 'left-0' : 'right-0'} transform translate-y-1/2 ${position === 'right' ? '-translate-x-1' : 'translate-x-1'}`}>
        <div className="w-3 h-3 bg-white rounded-full transform -translate-y-1"></div>
        <div className="w-2 h-2 bg-white rounded-full transform translate-x-1"></div>
      </div>

      {/* Dialog content */}
      <div className="text-sm text-center p-1">
        {message}
      </div>
    </animated.div>
  );
} 