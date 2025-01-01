import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const getRandomTransform = () => {
  // Much larger range for more extreme movements
  const x = Math.random() * 400 - 200; // -200 to 200
  const y = Math.random() * 400 - 200; // -200 to 200
  return { x, y };
};

const GradientOrb = ({ 
  color, 
  size = 300,
  opacity = 0.15,
  blur = 80,
  duration = 15
}) => {
  const [position, setPosition] = useState(getRandomTransform());
  const [prevPosition, setPrevPosition] = useState(position);

  useEffect(() => {
    const interval = setInterval(() => {
      setPrevPosition(position);
      setPosition(getRandomTransform());
    }, duration * 1000);

    return () => clearInterval(interval);
  }, [duration, position]);

  return (
    <motion.div
      initial={false}
      animate={{
        x: position.x + '%',
        y: position.y + '%',
      }}
      transition={{
        duration: duration,
        ease: [0.45, 0, 0.55, 1], // Custom cubic bezier for smoother movement
        type: "tween",
      }}
      className={cn(
        "absolute rounded-full",
        "pointer-events-none mix-blend-screen",
        "top-1/2 left-1/2",
        "-translate-x-1/2 -translate-y-1/2",
        color
      )}
      style={{
        width: size,
        height: size,
        opacity,
        filter: `blur(${blur}px)`,
      }}
    />
  );
};

export const MeshGradient = ({ 
  className,
  intensity = "subtle",
  speed = "slow",
  className2,
  size = 300
}) => {
  const opacityMap = {
    subtle: 0.15,
    medium: 0.2,
    strong: 0.25
  };

  const speedMap = {
    slow: 4,
    medium: 2.7,
    fast: 1.7
  };

  const opacity = opacityMap[intensity] || opacityMap.subtle;
  const duration = speedMap[speed] || speedMap.slow;

  // Create more orbs with varied colors and larger sizes
  const orbConfigs = [
    { color: "bg-blue-500", size: size * 1.2 },
    { color: "bg-purple-500", size: size * 1.4 },
    { color: "bg-indigo-400", size: size * 1.3 },
    { color: "bg-pink-500", size: size * 1.1 },
    { color: "bg-blue-400", size: size * 1.0 },
    { color: "bg-purple-400", size: size * 1.2 },
    { color: "bg-indigo-500", size: size * 1.1 },
    { color: "bg-pink-400", size: size * 1.3 },
    { color: "bg-blue-300", size: size * 1.0 },
    { color: "bg-purple-300", size: size * 1.2 },
    { color: "bg-indigo-300", size: size * 0.9 },
    { color: "bg-pink-300", size: size * 1.1 }
  ];

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      <div className={cn("absolute inset-0", className2)}>
        {orbConfigs.map((config, index) => (
          <GradientOrb
            key={index}
            color={config.color}
            size={config.size}
            opacity={opacity}
            duration={duration * (0.9 + Math.random() * 0.2)} // Smaller random duration variation
            blur={60 + Math.random() * 40} // Random blur between 60 and 100
          />
        ))}
        <div className="absolute inset-0 bg-background/50" />
      </div>
    </div>
  );
}; 