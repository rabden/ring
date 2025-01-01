import React, { useState } from 'react';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const MAX_LENGTH = 150;

const ImagePromptSection = ({ image }) => {
  const [isPromptExpanded, setIsPromptExpanded] = useState(false);
  const [isNegativePromptExpanded, setIsNegativePromptExpanded] = useState(false);

  const shouldTruncatePrompt = image.prompt.length > MAX_LENGTH;
  const shouldTruncateNegativePrompt = image.negative_prompt?.length > MAX_LENGTH;

  const displayedPrompt = shouldTruncatePrompt && !isPromptExpanded
    ? `${image.prompt.slice(0, MAX_LENGTH)}...`
    : image.prompt;

  const displayedNegativePrompt = shouldTruncateNegativePrompt && !isNegativePromptExpanded
    ? `${image.negative_prompt.slice(0, MAX_LENGTH)}...`
    : image.negative_prompt;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Prompt</Label>
        <div className={cn(
          "rounded-md",
          "bg-muted/5 hover:bg-muted/10",
          "border border-border/5",
          "transition-colors duration-200",
          "group"
        )}>
          <p className="text-sm text-foreground/90 leading-relaxed p-3">{displayedPrompt}</p>
          {shouldTruncatePrompt && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full flex items-center justify-center py-1 text-xs text-muted-foreground/70"
              onClick={() => setIsPromptExpanded(!isPromptExpanded)}
            >
              {isPromptExpanded ? (
                <><ChevronUp className="h-4 w-4 mr-1" /> Show Less</>
              ) : (
                <><ChevronDown className="h-4 w-4 mr-1" /> Show More</>
              )}
            </Button>
          )}
        </div>
      </div>

      {image.negative_prompt && (
        <div className="space-y-2">
          <Label>Negative Prompt</Label>
          <div className={cn(
            "rounded-md",
            "bg-muted/5 hover:bg-muted/10",
            "border border-border/5",
            "transition-colors duration-200",
            "group"
          )}>
            <p className="text-sm text-foreground/90 leading-relaxed p-3">{displayedNegativePrompt}</p>
            {shouldTruncateNegativePrompt && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full flex items-center justify-center py-1 text-xs text-muted-foreground/70"
                onClick={() => setIsNegativePromptExpanded(!isNegativePromptExpanded)}
              >
                {isNegativePromptExpanded ? (
                  <><ChevronUp className="h-4 w-4 mr-1" /> Show Less</>
                ) : (
                  <><ChevronDown className="h-4 w-4 mr-1" /> Show More</>
                )}
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Model</Label>
          <div className={cn(
            "rounded-md",
            "bg-muted/5 hover:bg-muted/10",
            "border border-border/5",
            "transition-colors duration-200",
            "group",
            "p-3"
          )}>
            <p className="text-sm text-foreground/90">{image.model}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImagePromptSection; 