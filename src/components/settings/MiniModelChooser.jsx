
import React from 'react';
import { Button } from "@/components/ui/button";
import { Check, Circle, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SettingSection from './SettingSection';

const ModelButton = ({ name, modelKey, currentModel, onClick }) => {
  const isActive = currentModel === modelKey;
  
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onClick(modelKey)}
      className={cn(
        "flex-1 h-8 rounded-full",
        "transition-all duration-200",
        isActive 
          ? "bg-accent border border-border/0 hover:border-border text-primary hover:bg-accent/70" 
          : "hover:bg-accent/30 border border-border/0 hover:border-border/50 text-primary/50"
      )}
    >
      {name}
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
  
  // Get the current custom model for the dropdown (when a custom model is selected)
  const currentCustomModel = isCustomModel ? { key: currentModel, name: currentModelName } : null;
  
  return (
    <SettingSection label="Model">
      <ScrollArea className="w-full">
        <div className="flex gap-2 pb-1">
          {quickModels.map(model => (
            <ModelButton
              key={model.key}
              name={model.name}
              modelKey={model.key}
              currentModel={currentModel}
              onClick={onModelChange}
            />
          ))}
          
          {/* Only show the more icon when a custom model is selected */}
          {isCustomModel && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  className="h-8 w-8 rounded-full transition-all p-0 duration-200 flex items-center justify-center flex-shrink-0 bg-primary/90"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {currentCustomModel && (
                  <DropdownMenuItem 
                    key={currentCustomModel.key}
                    onClick={() => onModelChange(currentCustomModel.key)}
                    className="cursor-pointer bg-accent/80"
                  >
                    {currentCustomModel.name}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </ScrollArea>
    </SettingSection>
  );
};

export default MiniModelChooser;
