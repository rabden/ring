import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Copy, Share2, Check } from "lucide-react"
import { useModelConfigs } from '@/hooks/useModelConfigs'
import { format } from 'date-fns'
import { cn } from "@/lib/utils"
import TruncatablePrompt from './TruncatablePrompt'

const ImageDetailsDialog = ({ open, onOpenChange, image }) => {
  const { data: modelConfigs } = useModelConfigs();
  const [copyIcon, setCopyIcon] = useState('copy');
  const [shareIcon, setShareIcon] = useState('share');
  
  if (!image) return null;

  const detailItems = [
    { label: "Model", value: modelConfigs?.[image.model]?.name || image.model },
    { label: "Seed", value: image.seed },
    { label: "Size", value: `${image.width}x${image.height}` },
    { label: "Aspect Ratio", value: image.aspect_ratio },
    { label: "Quality", value: image.quality },
    { label: "Created", value: format(new Date(image.created_at), 'MMM d, yyyy h:mm a') }
  ];

  const handleCopyPrompt = async () => {
    await navigator.clipboard.writeText(image.prompt);
    setCopyIcon('check');
    setTimeout(() => setCopyIcon('copy'), 1500);
  };

  const handleShare = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/image/${image.id}`);
    setShareIcon('check');
    setTimeout(() => setShareIcon('share'), 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "sm:max-w-[500px] max-h-[80vh] overflow-hidden",
        "border-border/80 bg-card",
        "p-4 md:p-6 rounded-lg"
      )}>
        <DialogHeader className="px-2">
          <DialogTitle className="text-md font-medium text-muted-foreground/70 uppercase tracking-wider">Image Details</DialogTitle>
        </DialogHeader>
        <ScrollArea className="mt-3 max-h-[calc(80vh-80px)]">
          <div className="space-y-4 px-1">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">Prompt</h3>
                <div className="flex gap-1.5">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn(
                      "h-8 w-8 p-0 rounded-md",
                      "bg-card hover:bg-secondary ",
                      "transition-all duration-200"
                    )}
                    onClick={handleCopyPrompt}
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
                    className={cn(
                      "h-8 w-8 p-0 rounded-md",
                      "bg-card hover:bg-secondary ",
                      "transition-all duration-200"
                    )}
                    onClick={handleShare}
                  >
                    {shareIcon === 'share' ? (
                      <Share2 className="h-3.5 w-3.5 text-foreground/70" />
                    ) : (
                      <Check className="h-3.5 w-3.5 text-primary/90 animate-in zoom-in duration-300" />
                    )}
                  </Button>
                </div>
              </div>
              <div className={cn(
                "rounded-md",
                "bg-card",
                "border border-border/5",
                "transition-colors duration-200",
                "group",
              )}>
                <TruncatablePrompt prompt={image.prompt} />
              </div>
            </div>

            {image?.negative_prompt && (
              <div className="space-y-2">
                <h3 className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">Negative Prompt</h3>
                <div className={cn(
                  "rounded-md",
                  "bg-card",
                  "transition-colors duration-200",
                  "group",
                )}>
                  <TruncatablePrompt prompt={image.negative_prompt} />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              {detailItems.map((item, index) => (
                <div 
                  key={index} 
                  className={cn(
                    "space-y-1 p-2 rounded-md",
                    "bg-card",
                    "border border-border/5",
                    "transition-colors duration-200",
                    "group"
                  )}
                >
                  <p className="text-xs text-muted-foreground/60 uppercase tracking-wider group-hover:text-muted-foreground/70 transition-colors duration-200">
                    {item.label}
                  </p>
                  <p className="text-sm font-medium text-foreground/90">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ImageDetailsDialog;