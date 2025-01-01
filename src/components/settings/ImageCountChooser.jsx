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
              "flex-1 h-8 rounded-lg",
              count === value 
                ? "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20" 
                : "hover:bg-accent/10"
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