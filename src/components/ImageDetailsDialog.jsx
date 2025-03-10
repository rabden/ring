import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useModelConfigs } from '@/hooks/useModelConfigs'
import { format } from 'date-fns'
import { cn } from "@/lib/utils"
import ImagePromptSection from './image-view/ImagePromptSection'
import ImageDetailsSection from './image-view/ImageDetailsSection'

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
          <DialogTitle className="text-sm font-semibold text-foreground/90 uppercase tracking-wide">Image Details</DialogTitle>
        </DialogHeader>
        <ScrollArea className="mt-6 max-h-[calc(80vh-80px)]">
          <div className="space-y-6 px-2">
            <ImagePromptSection 
              prompt={image.user_prompt || image.prompt}
              negative_prompt={image.negative_prompt}
              copyIcon={copyIcon}
              shareIcon={shareIcon}
              onCopyPrompt={handleCopyPrompt}
              onShare={handleShare}
            />

            <ImageDetailsSection detailItems={detailItems} />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ImageDetailsDialog;