
import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const MiniPromptBox = ({ 
  prompt, 
  onChange, 
  onSubmit, 
  hasEnoughCredits, 
  className,
  handleImprovePrompt,
  isImproving,
  hasEnoughCreditsForImprovement
}) => {
  return (
    <div className={cn(
      "flex items-center gap-2 max-w-[500px] w-full bg-card/80 rounded-full border border-border/80 px-3 py-1.5",
      "transition-all duration-200 ease-in-out",
      className
    )}>
      <input
        type="text"
        value={prompt}
        onChange={onChange}
        placeholder="Enter your prompt..."
        className="flex-grow bg-transparent text-sm focus:outline-none"
      />
      
      <div className="flex items-center gap-1.5">
        <Button
          size="sm"
          variant="outline"
          className="h-7 px-2 rounded-full bg-card hover:bg-background/50 transition-all duration-200"
          onClick={handleImprovePrompt}
          disabled={!prompt?.length || isImproving || !hasEnoughCreditsForImprovement}
        >
          <Sparkles className="h-3.5 w-3.5 text-foreground/70" />
        </Button>
        <Button
          size="sm"
          className="h-7 px-2 rounded-full bg-primary/90 hover:bg-primary/80 transition-all duration-200"
          onClick={onSubmit}
          disabled={!prompt?.length || !hasEnoughCredits || isImproving}
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};

export default MiniPromptBox;
