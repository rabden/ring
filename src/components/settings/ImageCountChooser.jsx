
import React from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import SettingSection from './SettingSection';

const ImageCountChooser = ({ count = 1, setCount }) => {
  const counts = [1, 2, 3, 4];

  return (
    <SettingSection 
      label="Number of Images" 
      tooltip="Generate multiple images at once. Each image costs the same number of credits."
      compact={true}
    >
      <div className="flex gap-1">
        {counts.map((value) => (
          <Button
            key={value}
            variant="outline"
            size="sm"
            onClick={() => setCount(value)}
            className={cn(
              "flex-1 h-7 rounded-full text-xs py-0 px-3",
              "transition-all duration-200",
              count === value 
                ? "bg-accent text-accent-foreground border-primary/20" 
                : "bg-secondary/50 hover:bg-secondary/80 text-muted-foreground hover:text-foreground/90 border-transparent"
            )}
          >
            {value}
          </Button>
        ))}
      </div>
    </SettingSection>
  );
};

export default ImageCountChooser;
