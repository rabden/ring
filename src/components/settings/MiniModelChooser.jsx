import React, { useEffect } from 'react';
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
import { useUserPreferences } from '@/contexts/UserPreferencesContext';

const ModelButton = ({ name, modelKey, currentModel, onClick }) => {
  const isActive = currentModel === modelKey;
  
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onClick(modelKey)}
      className={cn(
        "flex-1 h-8 rounded-full text-xs py-0 px-3",
        "transition-all duration-200",
        isActive 
          ? "bg-accent hover:bg-accent-70 text-accent-foreground border-border-80" 
          : "bg-transparent hover:bg-background/80 text-muted-foreground hover:text-foreground/90 border-transparent"
      )}
    >
      {name}
    </Button>
  );
};

const MiniModelChooser = ({ currentModel, onModelChange, modelConfigs }) => {
  const { nsfwEnabled } = useUserPreferences();
  
  const quickModels = [
    { key: 'flux', name: 'Normal' },
    { key: 'turbo', name: 'Fast' },
    { key: 'Illustration', name: 'Design' }
  ];
  
  const defaultModel = 'flux';
  
  const isCustomModel = !quickModels.some(model => model.key === currentModel);
  
  const currentModelName = modelConfigs?.[currentModel]?.name || 'Custom';
  
  const currentCustomModel = isCustomModel ? { key: currentModel, name: currentModelName } : null;
  
  useEffect(() => {
    const currentModelConfig = modelConfigs?.[currentModel];
    const isCorrectCategory = nsfwEnabled 
      ? currentModelConfig?.category === "NSFW"
      : currentModelConfig?.category === "General";
      
    if (currentModelConfig && !isCorrectCategory) {
      onModelChange(defaultModel);
    }
  }, [nsfwEnabled, currentModel, modelConfigs, onModelChange, defaultModel]);
  
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
            />
          ))}
          
          {isCustomModel && (
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
