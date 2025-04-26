
import React from 'react';
import { Button } from "@/components/ui/button";
import { Check, Circle, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import SettingSection from './SettingSection';

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

const MiniModelChooser = ({ currentModel, onModelChange }) => {
  const quickModels = [
    { key: 'flux', name: 'Fast' },
    { key: 'fluxDev', name: 'Dev' },
    { key: 'sd35l', name: 'SD 3.5' }
  ];
  
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
        </div>
      </ScrollArea>
    </SettingSection>
  );
};

export default MiniModelChooser;
