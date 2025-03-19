
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
        "h-9 rounded-full transition-all duration-200 flex items-center gap-1.5",
        isActive ? "bg-primary/90" : "bg-background hover:bg-background/80"
      )}
    >
      {isActive ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <Circle className="h-3.5 w-3.5 text-muted-foreground/50" />
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
    { key: 'logodesign4', name: 'Logo' }
  ];
  
  // Check if current model is not in our quick models
  const isCustomModel = !quickModels.some(model => model.key === currentModel);
  
  // Get the current model name for the custom button
  const currentModelName = modelConfigs?.[currentModel]?.name || 'Custom';
  
  return (
    <div className="flex flex-wrap gap-2 justify-center">
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
  );
};

export default MiniModelChooser;
