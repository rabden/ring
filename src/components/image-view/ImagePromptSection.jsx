import React from 'react';
import { Button } from "@/components/ui/button";
import { Copy, Share2, Check } from "lucide-react";
import TruncatablePrompt from '../TruncatablePrompt';
import { cn } from "@/lib/utils";

const ImagePromptSection = ({ 
  prompt, 
  negative_prompt,
  copyIcon, 
  shareIcon, 
  onCopyPrompt, 
  onShare 
}) => {
  return (
    <div className={cn("flex flex-col space-y-4")}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">Prompt</h3>
          <div className="flex gap-1.5">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onCopyPrompt}
              className={cn(
                "h-6 w-6 p-0 rounded-md",
                "bg-muted/5 hover:bg-muted/10",
                "transition-all duration-200"
              )}
            >
              {copyIcon === 'copy' ? (
                <Copy className="h-3.5 w-3.5 text-foreground/70" />
              ) : (
                <Check className="h-3.5 w-3.5 text-primary/90 animate-in zoom-in duration-300" />
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onShare}
              className={cn(
                "h-6 w-6 p-0 rounded-md",
                "bg-muted/5 hover:bg-muted/10",
                "transition-all duration-200"
              )}
            >
              {shareIcon === 'share' ? (
                <Share2 className="h-3.5 w-3.5 text-foreground/70" />
              ) : (
                <Check className="h-3.5 w-3.5 text-primary/90 animate-in zoom-in duration-300" />
              )}
            </Button>
          </div>
        </div>
        <div className={cn("rounded-md")}>
          <TruncatablePrompt 
            prompt={prompt} 
            className="text-sm text-foreground/90 leading-relaxed"
          />
        </div>
      </div>

      {negative_prompt && (
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">Negative Prompt</h3>
          <div className={cn("rounded-md")}>
            <TruncatablePrompt 
              prompt={negative_prompt} 
              className="text-sm text-foreground/90 leading-relaxed"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImagePromptSection;