import React, { useEffect, useRef } from 'react'
import { Lock } from "lucide-react"
import { cn } from "@/lib/utils"

const AspectRatioVisualizer = ({ ratio = "1:1", isPremium }) => {
  const [width, height] = (ratio || "1:1").split(':').map(Number)
  const maxHeight = 120
  const scale = maxHeight / height
  const scaledWidth = width * scale
  
  return (
    <div className="flex flex-col items-center space-y-2">
      <div 
        className={cn(
          "relative overflow-hidden",
          "border-2 border-border/80",
          "bg-accent/10",
          "rounded-lg",
          "flex items-center justify-center",
          "transition-all duration-200 ease-in-out",
          isPremium && "ring-2 ring-primary/40 border-primary/40"
        )}
        style={{
          width: `${scaledWidth}px`,
          height: `${maxHeight}px`,
        }}
      >
        {/* Grid lines */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
          {[...Array(9)].map((_, i) => (
            <div 
              key={i} 
              className="border border-border/40 hover:border-border/60 transition-colors duration-200"
            />
          ))}
        </div>
        
        {/* Center lines */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full h-[2px] bg-border/40" />
          <div className="absolute h-full w-[2px] bg-border/40" />
        </div>

        {/* Helper lines */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/3 w-[2px] h-2 border-border/40" />
          <div className="absolute top-0 right-1/3 w-[2px] h-2 border-border/40" />
          <div className="absolute bottom-0 left-1/3 w-[2px] h-2 border-border/40" />
          <div className="absolute bottom-0 right-1/3 w-[2px] h-2 border-border/40" />
          <div className="absolute left-0 top-1/3 h-[2px] w-2 border-border/40" />
          <div className="absolute left-0 bottom-1/3 h-[2px] w-2 border-border/40" />
          <div className="absolute right-0 top-1/3 h-[2px] w-2 border-border/40" />
          <div className="absolute right-0 bottom-1/3 h-[2px] w-2 border-border/40" />
        </div>

        <div className={cn(
          "relative flex items-center gap-2 px-2 py-2 rounded-xl",
        )}>
          <span className="group-hover:text-primary transition-colors duration-200">
            {ratio}
          </span>
          {isPremium && (
            <Lock className="h-3.5 w-3.5 text-primary opacity-80 group-hover:opacity-100 transition-opacity duration-200" />
          )}
        </div>
      </div>
    </div>
  )
}

const CustomSlider = ({ value, onChange, min, max }) => {
  const sliderRef = useRef(null);
  const progressRef = useRef(null);

  const updateSliderProgress = (value) => {
    if (!sliderRef.current || !progressRef.current) return;
    
    // Calculate the percentage from center
    const range = max - min;
    const center = (max + min) / 2;
    
    const progress = progressRef.current;
    if (value < center) {
      // Left side of center
      const percentage = ((value - min) / (center - min)) * 50;
      progress.style.left = `${percentage}%`;
      progress.style.right = '50%';
    } else {
      // Right side of center
      const percentage = ((value - center) / (max - center)) * 50;
      progress.style.left = '50%';
      progress.style.right = `${50 - percentage}%`;
    }
  };

  useEffect(() => {
    updateSliderProgress(value);
  }, [value]);

  const handleChange = (e) => {
    const newValue = parseFloat(e.target.value);
    onChange(newValue);
    updateSliderProgress(newValue);
  };

  return (
    <div className="relative w-full h-8 flex items-center">
      <div className="absolute w-full h-2 bg-muted rounded-full">
        <div 
          ref={progressRef}
          className="absolute h-full bg-primary rounded-full transition-all duration-150"
          style={{ left: '50%', right: '50%' }}
        />
      </div>
      <input
        ref={sliderRef}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={handleChange}
        className={cn(
          "absolute w-full h-2",
          "appearance-none bg-transparent cursor-pointer",
          // Thumb styles
          "[&::-webkit-slider-thumb]:appearance-none",
          "[&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4",
          "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary",
          "[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background",
          "[&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:transition-all",
          "[&::-webkit-slider-thumb]:hover:bg-primary/90",
          // Firefox thumb styles
          "[&::-moz-range-thumb]:appearance-none",
          "[&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4",
          "[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary",
          "[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-background",
          "[&::-moz-range-thumb]:shadow-sm [&::-moz-range-thumb]:transition-all",
          "[&::-moz-range-thumb]:hover:bg-primary/90"
        )}
      />
    </div>
  );
};

const AspectRatioChooser = ({ aspectRatio = "1:1", setAspectRatio, proMode }) => {
  const premiumRatios = ['9:21', '21:9', '3:2', '2:3', '4:5', '5:4', '10:16', '16:10'];
  
  const ratios = [
    "9:21", "1:2", "9:16", "10:16", "2:3", "3:4", "4:5",
    "1:1", // Center point
    "5:4", "4:3", "3:2", "16:10", "16:9", "2:1", "21:9"
  ].filter(ratio => proMode || !premiumRatios.includes(ratio));

  useEffect(() => {
    if (!proMode && premiumRatios.includes(aspectRatio)) {
      setAspectRatio("1:1");
    }
  }, [aspectRatio, proMode, setAspectRatio]);

  const handleSliderChange = (value) => {
    const centerIndex = ratios.indexOf("1:1");
    
    if (Math.abs(value) < 1) {
      setAspectRatio("1:1");
      return;
    }
    
    let index;
    if (value < 0) {
      const beforeCenterSteps = centerIndex;
      const normalizedValue = ((value + 50) / 50) * beforeCenterSteps;
      index = Math.round(normalizedValue);
    } else {
      const afterCenterSteps = ratios.length - 1 - centerIndex;
      const normalizedValue = (value / 50) * afterCenterSteps;
      index = centerIndex + Math.round(normalizedValue);
    }
    
    setAspectRatio(ratios[Math.max(0, Math.min(ratios.length - 1, index))] || "1:1");
  }

  const getCurrentRatioIndex = () => {
    const centerIndex = ratios.indexOf("1:1");
    const currentIndex = ratios.indexOf(aspectRatio);
    
    if (currentIndex === centerIndex || !ratios.includes(aspectRatio)) return 0;
    
    if (currentIndex < centerIndex) {
      const percentage = currentIndex / centerIndex;
      return -50 * (1 - percentage);
    } else {
      const stepsAfterCenter = currentIndex - centerIndex;
      const totalStepsAfterCenter = ratios.length - 1 - centerIndex;
      return (stepsAfterCenter / totalStepsAfterCenter) * 50;
    }
  }

  return (
    <div className="space-y-2">
      <AspectRatioVisualizer 
        ratio={aspectRatio} 
        isPremium={!proMode && premiumRatios.includes(aspectRatio)} 
      />
      <div className="relative">
        <CustomSlider
          value={getCurrentRatioIndex()}
          onChange={handleSliderChange}
          min={-50}
          max={50}
        />
      </div>
    </div>
  )
}

export default AspectRatioChooser
