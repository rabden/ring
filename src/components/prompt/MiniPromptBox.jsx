
import React from 'react';
import { Button } from '@/components/ui/button';
import { X, ChevronRight, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';

const MiniPromptBox = ({ 
  prompt,
  onChange,
  onSubmit,
  hasEnoughCredits,
  onClear,
  className,
}) => {
  const { settingsActive, setSettingsActive } = useUserPreferences();

  const handlePromptChange = (e) => {
    if (typeof onChange === 'function') {
      onChange({ target: { value: e.target.value } });
    }
  };

  const toggleSettings = () => {
    setSettingsActive(prev => !prev);
  };

  return (
    <div className={cn(
      "flex items-center gap-2 h-8 bg-card border border-border/80 rounded-lg overflow-hidden transition-all duration-200",
      className
    )}>
      <input
        type="text"
        value={prompt}
        onChange={handlePromptChange}
        placeholder="Enter prompt..."
        className={cn(
          "h-8 flex-grow bg-transparent px-3 text-sm focus:outline-none",
          "placeholder:text-muted-foreground/40",
        )}
      />
      
      {prompt?.length > 0 && (
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 rounded-full hover:bg-background/50"
          onClick={onClear}
        >
          <X className="h-4 w-4 text-foreground/70" />
        </Button>
      )}
      
      <Button
        size="sm"
        className="h-8 rounded-full bg-primary/90 hover:bg-primary/80 transition-all duration-200 mr-1"
        onClick={onSubmit}
        disabled={!prompt?.length || !hasEnoughCredits}
      >
        <div className="flex items-center">
          <span className="text-xs">Create</span>
          <ChevronRight className="ml-1 h-4 w-4" />
        </div>
      </Button>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant={settingsActive ? "default" : "ghost"}
              className={cn(
                "h-8 w-8 p-0 rounded-full transition-all duration-200 mr-1",
                settingsActive 
                  ? "bg-background text-foreground hover:bg-background/80" 
                  : "hover:bg-background/50"
              )}
              aria-label="Settings"
              onClick={toggleSettings}
            >
              <Settings 
                className={cn(
                  "h-4 w-4", 
                  settingsActive 
                    ? "text-foreground" 
                    : "text-foreground/70"
                )} 
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Toggle settings panel</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default MiniPromptBox;
