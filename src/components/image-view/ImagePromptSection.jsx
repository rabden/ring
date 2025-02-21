import React from 'react';
import { Button } from "@/components/ui/button";
import { Copy, Share2, Check } from "lucide-react";
import TruncatablePrompt from '../TruncatablePrompt';
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const ImagePromptSection = ({ 
  prompt, 
  negative_prompt,
  copyIcon, 
  shareIcon, 
  onCopyPrompt, 
  onShare 
}) => {
  return (
    <div className={cn("flex flex-col space-y-6")}>
      <Separator className="bg-accent" />
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground/90 uppercase tracking-wide">Prompt</h3>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onCopyPrompt}
              className={cn(
                "h-7 w-7 p-0 rounded-md",
                "bg-accent/10 hover:bg-accent/80",
                "transition-all duration-200"
              )}
            >
              {copyIcon === 'copy' ? (
                <Copy className="h-4 w-4 text-foreground/80" />
              ) : (
                <Check className="h-4 w-4 text-primary/90 animate-in zoom-in duration-300" />
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onShare}
              className={cn(
                "h-7 w-7 p-0 rounded-md",
                "bg-accent/10 hover:bg-accent/50",
                "transition-all duration-200"
              )}
            >
              {shareIcon === 'share' ? (
                <Share2 className="h-4 w-4 text-foreground/80" />
              ) : (
                <Check className="h-4 w-4 text-primary/90 animate-in zoom-in duration-300" />
              )}
            </Button>
          </div>
        </div>
        <div className={cn(
          "rounded-none",
          "bg-muted/5 hover:bg-muted/10",
          "border border-border/5",
          "transition-all duration-200"
        )}>
          <TruncatablePrompt 
            prompt={prompt} 
            className="text-[15px] leading-relaxed text-foreground/90 font-medium"
          />
        </div>
      </div>

      <Separator className="bg-accent" />

      {negative_prompt && (
        <>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground/90 uppercase tracking-wide">Negative Prompt</h3>
            <div className={cn(
              "rounded-none",
              "bg-muted/5 hover:bg-muted/10",
              "border border-border/5",
              "transition-all duration-200"
            )}>
              <TruncatablePrompt 
                prompt={negative_prompt} 
                className="text-[15px] leading-relaxed text-foreground/80 font-medium"
              />
            </div>
          </div>
          <Separator className="bg-accent" />
        </>
      )}
    </div>
  );
};

export default ImagePromptSection;