import React from 'react';
import { cn } from "@/lib/utils";

const HeartAnimation = ({ isAnimating }) => {
  if (!isAnimating) return null;

  return (
    <div className={cn(
      "absolute inset-0 flex items-center justify-center",
      "pointer-events-none z-10"
    )}>
      <video
        src="https://res.cloudinary.com/drhx7imeb/video/upload/v1735205358/Animation_-_1735137420225_kgdxup.webm"
        autoPlay
        muted
        className="w-[150px] h-[150px]"
        onEnded={(e) => {
          e.target.currentTime = 0;
          e.target.pause();
        }}
      />
    </div>
  );
};

export default HeartAnimation;