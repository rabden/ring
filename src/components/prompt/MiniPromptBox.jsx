
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const MiniPromptBox = ({ 
  prompt, 
  onChange, 
  onSubmit, 
  hasEnoughCredits, 
  className,
  focusMainPrompt,
  visible = true
}) => {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Focus the main prompt instead of submitting
    if (focusMainPrompt) {
      focusMainPrompt();
    }
  };

  return (
    <div 
      className={cn(
        "flex items-center gap-2 max-w-[350px] w-full bg-card/80 backdrop-blur-sm rounded-full border border-border/80 px-3 py-1.5",
        "shadow-md hover:shadow-lg",
        "transition-all duration-300 ease-in-out cursor-pointer",
        visible ? "translate-x-0 opacity-100" : "translate-x-[200px] opacity-0 pointer-events-none",
        className
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick(e);
        }
      }}
    >
      <input
        type="text"
        value={prompt}
        readOnly
        placeholder="Enter your prompt..."
        className="flex-grow bg-transparent text-sm focus:outline-none cursor-pointer"
        onClick={handleClick}
      />
      
      <div className="flex items-center">
        <Button
          size="sm"
          className="h-7 px-3 rounded-full bg-primary/90 hover:bg-primary/80 transition-all duration-300"
          onClick={(e) => {
            e.stopPropagation();
            onSubmit();
          }}
          disabled={!prompt?.length || !hasEnoughCredits}
        >
          <div className="flex items-center">
            <span className="text-sm">Create</span>
            <ChevronRight className="ml-1 h-4 w-4" />
          </div>
        </Button>
      </div>
    </div>
  );
};

export default MiniPromptBox;
