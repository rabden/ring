
import React from 'react';
import { Button } from "@/components/ui/button";
import { Check, Circle, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AspectRatioButton = ({ ratio, currentRatio, onClick }) => {
  const isActive = currentRatio === ratio;
  
  return (
    <Button
      variant={isActive ? "default" : "outline"}
      size="sm"
      onClick={() => onClick(ratio)}
      className={cn(
        "h-7 rounded-full transition-all duration-200 flex items-center gap-1.5 text-xs px-2 flex-shrink-0",
        isActive ? "bg-primary/90" : "bg-background hover:bg-background/80"
      )}
    >
      {isActive ? (
        <Check className="h-3 w-3" />
      ) : (
        <Circle className="h-3 w-3 text-muted-foreground/50" />
      )}
      <span>{ratio}</span>
    </Button>
  );
};

const MiniDimensionChooser = ({ currentRatio, onRatioChange, proMode }) => {
  const { aspectRatio, setAspectRatio, isRemixMode } = useUserPreferences();
  
  // Define the quick access ratios
  const quickRatios = [
    { key: '1:1', name: '1:1' },
    { key: '16:9', name: '16:9' },
    { key: '9:16', name: '9:16' }
  ];
  
  // All available ratios (for the dropdown)
  const allRatios = [
    "9:21", "1:2", "9:16", "10:16", "2:3", "3:4", "4:5",
    "1:1", "5:4", "4:3", "3:2", "16:10", "16:9", "2:1", "21:9"
  ];
  
  // Filter dropdown ratios to exclude the quick access ratios
  const dropdownRatios = allRatios.filter(ratio => 
    !quickRatios.some(quickRatio => quickRatio.key === ratio)
  );
  
  // Check if current ratio is not in our quick ratios
  const isCustomRatio = !quickRatios.some(ratio => ratio.key === currentRatio);
  
  const handleRatioChange = (ratio) => {
    // Call the provided onRatioChange prop
    onRatioChange(ratio);
    
    // Also update the context if not in remix mode
    if (!isRemixMode) {
      setAspectRatio(ratio);
    }
  };
  
  return (
    <div className="flex flex-col gap-2 items-start w-full">
      <h3 className="text-sm font-medium ml-1">Aspect Ratio</h3>
      <ScrollArea className="w-auto">
        <div className="flex gap-1.5 pb-1 items-center">
          {quickRatios.map(ratio => (
            <AspectRatioButton
              key={ratio.key}
              ratio={ratio.key}
              currentRatio={currentRatio}
              onClick={handleRatioChange}
            />
          ))}
          
          {/* Dropdown for other aspect ratios */}
          {isCustomRatio && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  className="h-7 w-7 rounded-full transition-all p-0 duration-200 flex items-center justify-center flex-shrink-0 bg-primary/90"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem 
                  key={currentRatio}
                  onClick={() => handleRatioChange(currentRatio)}
                  className="cursor-pointer bg-accent/80"
                >
                  {currentRatio}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default MiniDimensionChooser;
