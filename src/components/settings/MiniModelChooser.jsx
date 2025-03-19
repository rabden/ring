
import React from 'react';
import { Button } from "@/components/ui/button";
import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

const ModelButton = ({ name, modelKey, currentModel, onClick }) => {
  const isActive = currentModel === modelKey;
  
  return (
    <Button
      variant={isActive ? "default" : "outline"}
      size="sm"
      onClick={() => onClick(modelKey)}
      className={cn(
        "h-7 rounded-full transition-all duration-200 flex items-center gap-1.5 text-xs px-2.5",
        isActive ? "bg-primary/90" : "bg-background hover:bg-background/80"
      )}
    >
      {isActive ? (
        <Check className="h-3 w-3" />
      ) : (
        <Circle className="h-3 w-3 text-muted-foreground/50" />
      )}
      <span>{name}</span>
    </Button>
  );
};

const MiniModelChooser = ({ currentModel, onModelChange, modelConfigs }) => {
  // Define the quick access models
  const quickModels = [
    { key: 'flux', name: 'Normal' },
    { key: 'turbo', name: 'Fast' },
    { key: 'sd35l', name: 'StableDiff' },
    { key: 'anime', name: 'Anime' },
    { key: 'logodesign4', name: 'Logo' },
    { key: 'realism', name: 'Realistic' }
  ];
  
  // Check if current model is not in our quick models
  const isCustomModel = !quickModels.some(model => model.key === currentModel);
  
  // Get the current model name for the custom button
  const currentModelName = modelConfigs?.[currentModel]?.name || 'Custom';
  
  return (
    <div className="flex flex-col gap-2 items-start">
      <h3 className="text-sm font-medium ml-1">Model</h3>
      <div className="flex flex-wrap gap-1.5 max-w-[400px]">
        {quickModels.map(model => (
          <ModelButton
            key={model.key}
            name={model.name}
            modelKey={model.key}
            currentModel={currentModel}
            onClick={onModelChange}
          />
        ))}
        
        {/* Add temporary button for custom model selection */}
        {isCustomModel && (
          <ModelButton
            name={currentModelName}
            modelKey={currentModel}
            currentModel={currentModel}
            onClick={onModelChange}
          />
        )}
      </div>
    </div>
  );
};

export default MiniModelChooser;
