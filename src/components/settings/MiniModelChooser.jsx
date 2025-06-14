
import React from 'react';
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import SettingSection from './SettingSection';

const ModelButton = ({ name, modelKey, currentModel, onClick, isPremium, proMode }) => {
  const isActive = currentModel === modelKey;
  const isDisabled = isPremium && !proMode;
  
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => !isDisabled && onClick(modelKey)}
      disabled={isDisabled}
      className={cn(
        "flex-1 h-8 rounded-full text-xs py-0 px-3 flex items-center justify-center",
        "transition-all duration-200",
        isActive && !isDisabled
          ? "bg-accent hover:bg-accent-70 text-accent-foreground border-border-80" 
          : "bg-transparent hover:bg-background/80 text-muted-foreground hover:text-foreground/90 border-transparent",
        isDisabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <span>{name}</span>
      {isDisabled && <Lock className="h-3 w-3 ml-1.5 shrink-0" />}
    </Button>
  );
};

const MiniModelChooser = ({ currentModel, onModelChange, proMode, modelConfigs }) => {
  const quickModelKeys = ['flux', 'fluxDev', 'flash'];
  
  const quickModels = quickModelKeys
    .map(key => (modelConfigs && modelConfigs[key] ? { key, ...modelConfigs[key] } : null))
    .filter(Boolean);
  
  return (
    <SettingSection label="Model" compact={true}>
      <ScrollArea className="w-full">
        <div className="flex gap-1 pb-1">
          {quickModels.map(model => (
            <ModelButton
              key={model.key}
              name={model.name}
              modelKey={model.key}
              currentModel={currentModel}
              onClick={onModelChange}
              isPremium={model.isPremium}
              proMode={proMode}
            />
          ))}
        </div>
      </ScrollArea>
    </SettingSection>
  );
};

export default MiniModelChooser;
