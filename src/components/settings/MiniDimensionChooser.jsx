
import React from 'react';
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SettingSection from './SettingSection';

const AspectRatioButton = ({ ratio, currentRatio, onClick }) => {
  const isActive = currentRatio === ratio;
  
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onClick(ratio)}
      className={cn(
        "flex-1 h-8 rounded-full text-xs py-0 px-3",
        "transition-all duration-200",
        isActive 
          ? "bg-accent hover:bg-accent-70 text-accent-foreground border-border-80" 
          : "bg-transparent hover:bg-background/80 text-muted-foreground hover:text-foreground/90 border-transparent"
      )}
    >
      {ratio}
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
    <SettingSection label="Aspect Ratio" compact={true}>
      <ScrollArea className="w-full">
        <div className="flex gap-1 pb-1 items-center">
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
                  className="h-8 w-8 rounded-full transition-all p-0 duration-200 flex items-center justify-center flex-shrink-0 bg-primary/90"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
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
    </SettingSection>
  );
};

export default MiniDimensionChooser;
