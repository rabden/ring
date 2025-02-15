import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Returns a random transform object with x, y (in pixels),
// a rotation angle (in degrees), and a scale factor.
const getRandomTransform = () => {
  const x = Math.random() * 400 - 200; // Range: -200 to 200 px
  const y = Math.random() * 400 - 200; // Range: -200 to 200 px
  const rotate = Math.random() * 360 - 180; // Range: -180 to 180°
  const scale = 0.8 + Math.random() * 0.4;  // Range: 0.8 to 1.2
  return { x, y, rotate, scale };
};

const GradientOrb = ({
  baseColor = "#3b82f6", // Default blue (can be any valid CSS color)
  size = 300,
  opacity = 0.25,
  blur = 70,
  duration = 10,
}) => {
  const [transformState, setTransformState] = useState(getRandomTransform());

  useEffect(() => {
    const interval = setInterval(() => {
      setTransformState(getRandomTransform());
    }, duration * 1000);
    return () => clearInterval(interval);
  }, [duration]);

  return (
    <motion.div
      animate={{
        x: transformState.x,
        y: transformState.y,
        rotate: transformState.rotate,
        scale: transformState.scale,
      }}
      transition={{
        duration: duration,
        ease: [0.45, 0, 0.55, 1],
      }}
      className={cn(
        "absolute rounded-full pointer-events-none"
      )}
      style={{
        top: "50%",
        left: "50%",
        width: size,
        height: size,
        opacity: opacity,
        filter: `blur(${blur}px)`,
        background: `radial-gradient(circle, ${baseColor} 0%, transparent 70%)`,
      }}
    />
  );
};

export const MeshGradient = ({
  className,
  intensity = "subtle",
  speed = "slow",
  className2,
  size = 300,
}) => {
  // Map intensity to orb opacity
  const opacityMap = {
    subtle: 0.15,
    medium: 0.2,
    strong: 0.25,
  };

  // Map speed to animation duration (in seconds)
  const speedMap = {
    slow: 10,
    medium: 7,
    fast: 5,
  };

  const opacity = opacityMap[intensity] || opacityMap.subtle;
  const duration = speedMap[speed] || speedMap.slow;

  // Define a set of orbs with baseColor (hex) and varied sizes.
  const orbConfigs = [
    { baseColor: "#3b82f6", size: size * 1.2 }, // blue-500
    { baseColor: "#8b5cf6", size: size * 1.4 }, // purple-500
    { baseColor: "#6366f1", size: size * 1.3 }, // indigo-500
    { baseColor: "#ec4899", size: size * 1.1 }, // pink-500
    { baseColor: "#60a5fa", size: size * 1.0 }, // blue-400
    { baseColor: "#a78bfa", size: size * 1.2 }, // purple-400
    { baseColor: "#818cf8", size: size * 1.1 }, // indigo-400
    { baseColor: "#f472b6", size: size * 1.3 }, // pink-400
    { baseColor: "#93c5fd", size: size * 1.0 }, // blue-300
    { baseColor: "#d8b4fe", size: size * 1.2 }, // purple-300
    { baseColor: "#c4b5fd", size: size * 0.9 }, // indigo-300
    { baseColor: "#f9a8d4", size: size * 1.1 }  // pink-300
  ];

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      <div className={cn("absolute inset-0", className2)}>
        {orbConfigs.map((config, index) => (
          <GradientOrb
            key={index}
            baseColor={config.baseColor}
            size={config.size}
            opacity={opacity}
            duration={duration * (0.9 + Math.random() * 0.2)} // slight duration variation
            blur={60 + Math.random() * 40} // blur between 60 and 100px
          />
        ))}
        {/* Optional overlay for depth */}
        <div className="absolute inset-0 bg-background/50" />
      </div>
    </div>
  );
};
