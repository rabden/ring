
import React from 'react';
import { Button } from "@/components/ui/button";
import { Check, Circle, MoreHorizontal, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import SettingSection from './SettingSection';
import { useProUser } from '@/hooks/useProUser';
import { useSupabaseAuth } from '@/integrations/supabase/auth';
import { modelConfig } from '@/config/modelConfig';

const ModelButton = ({ name, modelKey, currentModel, onClick, isPremium, isLocked }) => {
  const isActive = currentModel === modelKey;
  
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => !isLocked && onClick(modelKey)}
      disabled={isLocked}
      className={cn(
        "flex-1 h-8 rounded-full text-xs py-0 px-3 relative",
        "transition-all duration-200",
        isActive 
          ? "bg-accent hover:bg-accent-70 text-accent-foreground border-border-80" 
          : "bg-transparent hover:bg-background/80 text-muted-foreground hover:text-foreground/90 border-transparent",
        isLocked && "opacity-50 cursor-not-allowed"
      )}
    >
      {isPremium && isLocked && (
        <Lock className="h-3 w-3 mr-1" />
      )}
      {name}
    </Button>
  );
};

const MiniModelChooser = ({ currentModel, onModelChange }) => {
  const { session } = useSupabaseAuth();
  const { data: isProUser } = useProUser(session?.user?.id);
  
  const quickModels = [
    { key: 'flux', name: 'Flux' },
    { key: 'fluxDev', name: 'Flux Pro' },
    { key: 'flash', name: 'Flash' }
  ];
  
  return (
    <SettingSection label="Model" compact={true}>
      <ScrollArea className="w-full">
        <div className="flex gap-1 pb-1">
          {quickModels.map(model => {
            const modelInfo = modelConfig[model.key];
            const isPremium = modelInfo?.isPremium || false;
            const isLocked = isPremium && !isProUser;
            
            return (
              <ModelButton
                key={model.key}
                name={model.name}
                modelKey={model.key}
                currentModel={currentModel}
                onClick={onModelChange}
                isPremium={isPremium}
                isLocked={isLocked}
              />
            );
          })}
        </div>
      </ScrollArea>
    </SettingSection>
  );
};

export default MiniModelChooser;
