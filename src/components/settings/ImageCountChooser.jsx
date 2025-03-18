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
    >
      <div className="flex gap-2">
        {counts.map((value) => (
          <Button
            key={value}
            variant="outline"
            size="sm"
            onClick={() => setCount(value)}
            className={cn(
              "flex-1 h-8 rounded-full",
              "transition-all duration-200",
              count === value 
                ? "bg-accent border border-border/0 hover:border-border text-primary hover:bg-accent/70" 
                : "hover:bg-accent/30 border border-border/0 hover:border-border/50 text-primary/50 "
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