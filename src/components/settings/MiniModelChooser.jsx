
import React from 'react';
import { Button } from "@/components/ui/button";
import { Check, Circle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ModelButton = ({ name, modelKey, currentModel, onClick }) => {
  const isActive = currentModel === modelKey;
  
  return (
    <Button
      variant={isActive ? "default" : "outline"}
      size="sm"
      onClick={() => onClick(modelKey)}
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
      <span>{name}</span>
    </Button>
  );
};

const MiniModelChooser = ({ currentModel, onModelChange, modelConfigs }) => {
  // Define the quick access models (3 basic models)
  const quickModels = [
    { key: 'flux', name: 'Normal' },
    { key: 'turbo', name: 'Fast' },
    { key: 'Illustration', name: 'Design' }
  ];
  
  // Check if current model is not in our quick models
  const isCustomModel = !quickModels.some(model => model.key === currentModel);
  
  // Get the current model name for the dropdown button
  const currentModelName = modelConfigs?.[currentModel]?.name || 'Custom';
  
  // Get all available models for the dropdown
  const allModels = modelConfigs ? Object.entries(modelConfigs).map(([key, config]) => ({
    key,
    name: config.name
  })).filter(model => !quickModels.some(qm => qm.key === model.key)) : [];
  
  return (
    <div className="flex flex-col gap-2 items-start">
      <h3 className="text-sm font-medium ml-1">Model</h3>
      <ScrollArea className="w-[300px]">
        <div className="flex gap-1.5 pb-1">
          {quickModels.map(model => (
            <ModelButton
              key={model.key}
              name={model.name}
              modelKey={model.key}
              currentModel={currentModel}
              onClick={onModelChange}
            />
          ))}
          
          {/* Dropdown for custom model selection */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={isCustomModel ? "default" : "outline"}
                size="sm"
                className={cn(
                  "h-7 rounded-full transition-all duration-200 flex items-center gap-1.5 text-xs px-2 flex-shrink-0",
                  isCustomModel ? "bg-primary/90" : "bg-background hover:bg-background/80"
                )}
              >
                {isCustomModel ? (
                  <>
                    <Check className="h-3 w-3" />
                    <span>{currentModelName}</span>
                  </>
                ) : (
                  <>
                    <Circle className="h-3 w-3 text-muted-foreground/50" />
                    <span>More</span>
                  </>
                )}
                <ChevronDown className="h-3 w-3 ml-0.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {allModels.map(model => (
                <DropdownMenuItem 
                  key={model.key}
                  onClick={() => onModelChange(model.key)}
                  className={cn(
                    "cursor-pointer",
                    currentModel === model.key && "bg-accent/80"
                  )}
                >
                  {model.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </ScrollArea>
    </div>
  );
};

export default MiniModelChooser;
