
import React from 'react';
import { Button } from "@/components/ui/button";
import { Check, Circle, MoreHorizontal, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import SettingSection from './SettingSection';

const ModelButton = ({ name, modelKey, currentModel, onClick, disabled, config, proMode }) => {
  const isActive = currentModel === modelKey;
  
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={disabled ? undefined : () => onClick(modelKey)}
      disabled={disabled}
      className={cn(
        "flex-1 h-8 rounded-full text-xs py-0 px-3 gap-1",
        "transition-all duration-200",
        isActive 
          ? "bg-accent hover:bg-accent-70 text-accent-foreground border-border-80" 
          : "bg-transparent hover:bg-background/80 text-muted-foreground hover:text-foreground/90 border-transparent",
        disabled && "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-muted-foreground"
      )}
    >
      {name}
      {config?.isPremium && !proMode && <Lock className="h-3 w-3 flex-shrink-0" />}
    </Button>
  );
};

const MiniModelChooser = ({ currentModel, onModelChange, proMode, modelConfigs }) => {
  if (!modelConfigs) return null;

  // Filter models for General category (same as in ModelChooser)
  const generalModels = Object.entries(modelConfigs).filter(([_, config]) => 
    config.category === "General"
  );

  // Get first 3 models for quick access
  const quickModels = generalModels.slice(0, 3);
  
  return (
    <SettingSection label="Model" compact={true}>
      <ScrollArea className="w-full">
        <div className="flex gap-1 pb-1">
          {quickModels.map(([key, config]) => (
            <ModelButton
              key={key}
              name={config.name}
              modelKey={key}
              currentModel={currentModel}
              onClick={onModelChange}
              disabled={config.isPremium && !proMode}
              config={config}
              proMode={proMode}
            />
          ))}
        </div>
      </ScrollArea>
    </SettingSection>
  );
};

export default MiniModelChooser;
