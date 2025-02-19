import React, { useEffect, useRef, useState } from 'react'
import { Lock, ChevronUp, ChevronDown, RefreshCcw, ChevronsUp, ChevronsDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addListener(listener);
    return () => media.removeListener(listener);
  }, [matches, query]);

  return matches;
}

const DimensionVisualizer = ({ 
  ratio = "1:1", 
  isPremium, 
  quality, 
  onQualityToggle, 
  qualityLimits,
  onToggleView,
  showButtons,
  ratios,
  onRatioChange,
  proMode,
  premiumRatios
}) => {
  const [width, height] = (ratio || "1:1").split(':').map(Number)
  const isMobile = useMediaQuery('(max-width: 768px)')
  const baseHeight = isMobile ? 300 : 250 // Responsive base height
  
  // Calculate dimensions
  let finalWidth, finalHeight;
  const aspectRatio = width / height;
  
  if (width === height) {
    // 1:1 ratio - full width and height equal
    finalWidth = baseHeight
    finalHeight = baseHeight
  } else if (width > height) {
    // Landscape - keep width at base height, decrease height proportionally
    finalWidth = baseHeight
    finalHeight = baseHeight * (height / width)
  } else {
    // Portrait - keep height at base height, decrease width proportionally
    finalHeight = baseHeight
    finalWidth = baseHeight * (width / height)
  }
  
  const isQualityLocked = qualityLimits?.length === 1 && qualityLimits[0] === "HD";
  
  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="relative w-full h-auto aspect-square">
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="relative">
            {/* Quality Badge */}
            <span 
              role={isQualityLocked ? undefined : "button"}
              tabIndex={isQualityLocked ? undefined : 0}
              onClick={isQualityLocked ? undefined : onQualityToggle}
              onKeyDown={isQualityLocked ? undefined : (e) => e.key === 'Enter' && onQualityToggle()}
              className={cn(
                "absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 z-10",
                !isQualityLocked && "cursor-pointer"
              )}
            >
              <span 
                className={cn(
                  "inline-flex items-center rounded-full text-xs font-semibold",
                  "border-transparent bg-primary text-primary-foreground",
                  !isQualityLocked && "hover:bg-primary/90",
                  "flex items-center gap-1 px-5 py-0.5"
                )}
              >
                {quality}
                {!isQualityLocked && (
                  quality === "HD" ? <ChevronsUp className="h-3 w-3" /> : <ChevronsDown className="h-3 w-3" />
                )}
              </span>
            </span>

            <div 
              className={cn(
                "relative overflow-hidden",
                "rounded-lg",
                "flex items-center justify-center",
                "transition-all duration-200 ease-in-out",
                "border-2 border-border/80",
              )}
              style={{
                width: `${finalWidth}px`,
                height: `${finalHeight}px`,
              }}
            >
              {/* Grid lines */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                {[...Array(9)].map((_, i) => (
                  <div 
                    key={i} 
                    className="border border-border/60 hover:border-border/60 transition-colors duration-200"
                  />
                ))}
              </div>
              
              {/* Center lines */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-full h-[2px] bg-border/60" />
                <div className="absolute h-full w-[2px] bg-border/60" />
              </div>

              {/* Helper lines */}
              <div className="absolute inset-0">
                <div className="absolute top-0 left-1/3 w-[2px] h-2 border-border/60" />
                <div className="absolute top-0 right-1/3 w-[2px] h-2 border-border/60" />
                <div className="absolute bottom-0 left-1/3 w-[2px] h-2 border-border/60" />
                <div className="absolute bottom-0 right-1/3 w-[2px] h-2 border-border/60" />
                <div className="absolute left-0 top-1/3 h-[2px] w-2 border-border/60" />
                <div className="absolute left-0 bottom-1/3 h-[2px] w-2 border-border/60" />
                <div className="absolute right-0 top-1/3 h-[2px] w-2 border-border/60" />
                <div className="absolute right-0 bottom-1/3 h-[2px] w-2 border-border/60" />
              </div>

              {/* Aspect ratio text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={cn(
                  "flex items-center gap-2 group cursor-pointer",
                  "text-base font-medium hover:text-primary transition-colors"
                )} onClick={onToggleView}>
                  <span className="flex items-center gap-1.5">
                    {ratio.split(':')[0]}
                    <RefreshCcw className="h-3.5 w-3.5 group-hover:rotate-180 transition-transform duration-300" />
                    {ratio.split(':')[1]}
                  </span>
                  {isPremium && (
                    <Lock className="h-3 w-3 text-primary opacity-80 group-hover:opacity-100 transition-opacity duration-200" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full transition-all duration-300">
        <div className={cn(
          "transition-all duration-300 transform",
          showButtons ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0 pointer-events-none absolute"
        )}>
          <AspectRatioButtons
            ratios={ratios}
            currentRatio={ratio}
            onChange={onRatioChange}
            proMode={proMode}
            premiumRatios={premiumRatios}
          />
        </div>
        <div className={cn(
          "transition-all duration-300 transform",
          !showButtons ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0 pointer-events-none absolute"
        )}>
          <CustomSlider
            value={getCurrentRatioIndex(ratio, ratios)}
            onChange={value => {
              const newRatio = getRatioFromSliderValue(value, ratios);
              onRatioChange(newRatio);
            }}
            min={-50}
            max={50}
          />
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
    const center = (max + min) / 2;
    const progress = progressRef.current;

    if (value < center) {
      // Left side of center - progress goes from current position to center
      const totalRange = center - min;
      const currentFromMin = value - min;
      const percentage = (currentFromMin / totalRange) * 50;
      
      // Ensure progress starts from current position to center
      progress.style.left = `${percentage}%`;
      progress.style.right = '50%';
    } else {
      // Right side of center - progress goes from center to current position
      const totalRange = max - center;
      const currentFromCenter = value - center;
      const percentage = (currentFromCenter / totalRange) * 50;
      
      // Ensure progress starts from center to current position
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

const AspectRatioButtons = ({ ratios, currentRatio, onChange, proMode, premiumRatios }) => {
  // Pair the ratios for the button layout
  const pairedRatios = [
    ["9:21", "21:9"],
    ["1:3", "3:1"],
    ["1:2", "2:1"],
    ["10:16", "16:10"],
    ["9:16", "16:9"],
    ["2:3", "3:2"],
    ["3:4", "4:3"],
    ["4:5", "5:4"],
    ["1:1"]
  ];

  return (
    <div className="grid grid-cols-4 gap-1.5 animate-in fade-in slide-in-from-top-4 duration-300">
      {pairedRatios.map((group, idx) => (
        <React.Fragment key={idx}>
          {group.map((ratio) => {
            const isPremium = !proMode && premiumRatios.includes(ratio);
            return (
              <button
                key={ratio}
                onClick={() => !isPremium && onChange(ratio)}
                className={cn(
                  "relative px-2 py-1.5 text-sm rounded-md border transition-all duration-200",
                  "hover:border-primary/50 hover:bg-primary/5",
                  currentRatio === ratio && "border-primary bg-primary/10",
                  !isPremium && "cursor-pointer",
                  isPremium && "opacity-50 cursor-not-allowed",
                  // Center 1:1 ratio
                  group.length === 1 && "col-span-4"
                )}
                disabled={isPremium}
              >
                {ratio}
                {isPremium && (
                  <Lock className="absolute top-1 right-1 h-3 w-3 text-primary/70" />
                )}
              </button>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
};

// Helper functions for slider calculations
const getCurrentRatioIndex = (currentRatio, ratios) => {
  const centerIndex = ratios.indexOf("1:1");
  const currentIndex = ratios.indexOf(currentRatio);
  
  if (currentIndex === centerIndex || !ratios.includes(currentRatio)) return 0;
  
  if (currentIndex < centerIndex) {
    const percentage = currentIndex / centerIndex;
    return -50 * (1 - percentage);
  } else {
    const stepsAfterCenter = currentIndex - centerIndex;
    const totalStepsAfterCenter = ratios.length - 1 - centerIndex;
    return (stepsAfterCenter / totalStepsAfterCenter) * 50;
  }
}

const getRatioFromSliderValue = (value, ratios) => {
  const centerIndex = ratios.indexOf("1:1");
  
  if (Math.abs(value) < 1) {
    return "1:1";
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
  
  return ratios[Math.max(0, Math.min(ratios.length - 1, index))] || "1:1";
}

const DimensionChooser = ({ 
  aspectRatio = "1:1", 
  setAspectRatio, 
  quality = "HD",
  setQuality,
  proMode,
  qualityLimits = null
}) => {
  const [showButtons, setShowButtons] = useState(false);
  const premiumRatios = ['16:10', '10:16', '4:3', '3:4', '2:1', '1:2', '3:1', '1:3'];
  
  // Reorder ratios from most extreme portrait to most extreme landscape
  const ratios = [
    "1:3",     // Most extreme portrait 
    "9:21",    
    "1:2",  
    "9:16",
    "10:16", 
    "2:3",
    "3:4",
    "4:5",
    "1:1",     // Center - largest state
    "5:4",
    "4:3",
    "3:2",
    "16:10",  
    "16:9", 
    "2:1",
    "21:9",
    "3:1"      // Most extreme landscape
  ].filter(ratio => proMode || !premiumRatios.includes(ratio));

  useEffect(() => {
    if (!proMode && premiumRatios.includes(aspectRatio)) {
      setAspectRatio("1:1");
    }
  }, [aspectRatio, proMode, setAspectRatio]);

  // Force HD quality when quality is limited
  useEffect(() => {
    if (qualityLimits?.length === 1 && qualityLimits[0] === "HD" && quality !== "HD") {
      setQuality("HD");
    }
  }, [qualityLimits, quality, setQuality]);

  const handleQualityToggle = () => {
    // Don't allow toggle if quality is limited to HD
    if (qualityLimits?.length === 1 && qualityLimits[0] === "HD") {
      return;
    }
    setQuality(quality === "HD" ? "HD+" : "HD");
  };

  const handleSliderChange = (value) => {
    const centerIndex = ratios.indexOf("1:1");
    
    if (Math.abs(value) < 1) {
      setAspectRatio("1:1");
      return;
    }
    
    let index;
    if (value < 0) {
      // Portrait side - decrease width
      const beforeCenterSteps = centerIndex;
      const normalizedValue = ((value + 50) / 50) * beforeCenterSteps;
      index = Math.round(normalizedValue);
    } else {
      // Landscape side - decrease height
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
      // Portrait side - calculate position based on width reduction
      const percentage = currentIndex / centerIndex;
      return -50 * (1 - percentage);
    } else {
      // Landscape side - calculate position based on height reduction
      const stepsAfterCenter = currentIndex - centerIndex;
      const totalStepsAfterCenter = ratios.length - 1 - centerIndex;
      return (stepsAfterCenter / totalStepsAfterCenter) * 50;
    }
  }

  return (
    <div className="space-y-0.5">
      <DimensionVisualizer 
        ratio={aspectRatio} 
        isPremium={!proMode && premiumRatios.includes(aspectRatio)}
        quality={quality}
        onQualityToggle={handleQualityToggle}
        qualityLimits={qualityLimits}
        onToggleView={() => setShowButtons(prev => !prev)}
        showButtons={showButtons}
        ratios={ratios}
        onRatioChange={setAspectRatio}
        proMode={proMode}
        premiumRatios={premiumRatios}
      />
    </div>
  );
}

export default DimensionChooser;
