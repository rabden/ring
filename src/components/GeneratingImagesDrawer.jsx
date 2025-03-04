
import React, { useState } from 'react'
import { Loader, Check, Clock, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useModelConfigs } from '@/hooks/useModelConfigs'
import { MeshGradient } from "@/components/ui/mesh-gradient"
import { cn } from "@/lib/utils"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import CancelGenerationDialog from './alerts/CancelGenerationDialog'
import { useGeneratingImages } from '@/contexts/GeneratingImagesContext'

const GeneratingImagesDrawer = ({ open, onOpenChange }) => {
  const { data: modelConfigs } = useModelConfigs();
  const { 
    generatingImages, 
    cancelGeneration, 
    getCompletedCount,
    getPendingCount,
    getProcessingCount
  } = useGeneratingImages();
  
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const handleCancelClick = (e, imageId) => {
    e.stopPropagation();
    setSelectedImageId(imageId);
    setShowCancelDialog(true);
  };

  const handleConfirmCancel = () => {
    if (selectedImageId) {
      cancelGeneration(selectedImageId);
    }
    setShowCancelDialog(false);
    setSelectedImageId(null);
  };

  if (generatingImages.length === 0) return null;

  const processingCount = getProcessingCount();
  const pendingCount = getPendingCount();
  const completedCount = getCompletedCount();

  const sortedImages = [...generatingImages].sort((a, b) => {
    const order = { processing: 0, pending: 1, completed: 2, failed: 3 };
    return order[a.status] - order[b.status];
  });

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="focus:outline-none">
          <DrawerHeader className="border-b border-border/5 p-4">
            <DrawerTitle className="flex items-center gap-3 text-base font-medium text-foreground/90">
              {processingCount > 0 ? (
                <div className="flex items-center gap-3">
                  <div className="p-1 rounded-lg">
                    <Loader className="h-4 w-4 animate-spin text-primary/90" />
                  </div>
                  <span>Generating {processingCount} image{processingCount > 1 ? 's' : ''}...</span>
                </div>
              ) : pendingCount > 0 ? (
                <div className="flex items-center gap-3">
                  <div className="p-1 rounded-lg">
                    <Clock className="h-4 w-4 text-muted-foreground/70" />
                  </div>
                  <span>Queued {pendingCount} image{pendingCount > 1 ? 's' : ''}</span>
                </div>
              ) : completedCount > 0 ? (
                <div className="flex items-center gap-3">
                  <div className="p-1 rounded-lg">
                    <Check className="h-4 w-4 text-primary/90" />
                  </div>
                  <span>Generated {completedCount} image{completedCount > 1 ? 's' : ''}</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="p-1 rounded-lg">
                    <Loader className="h-4 w-4 animate-spin text-primary/90" />
                  </div>
                  <span>Processing...</span>
                </div>
              )}
            </DrawerTitle>
          </DrawerHeader>
          <ScrollArea className="flex-1 h-[70vh]">
            <div className="px-4 py-4 space-y-3">
              {sortedImages.map((img) => (
                <div 
                  key={img.id} 
                  className={cn(
                    "flex flex-col gap-2 p-3 rounded-lg",
                    "transition-all duration-200",
                    "hover:bg-accent/10",
                    "group relative overflow-hidden",
                    img.status === 'processing' && "min-h-[90px]"
                  )}
                >
                  {img.status === 'processing' && (
                    <MeshGradient 
                      className="opacity-50" 
                      intensity="strong" 
                      speed="fast" 
                      size={1000}
                    />
                  )}
                  <div className="flex items-center gap-3 w-full relative">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-lg">
                        {img.status === 'processing' ? (
                          <Loader className="w-3.5 h-3.5 animate-spin text-primary/90" />
                        ) : img.status === 'pending' ? (
                          <Clock className="w-3.5 h-3.5 text-muted-foreground/70" />
                        ) : (
                          <Check className="w-3.5 h-3.5 text-primary/90" />
                        )}
                      </div>
                      <span className="text-sm font-medium text-primary/90">
                        {img.status === 'processing' ? 'Generating...' : 
                         img.status === 'pending' ? 'Queued' : 
                         img.status === 'failed' ? 'Failed' : 'Complete'}
                      </span>
                    </div>
                    {(img.status === 'processing' || img.status === 'pending') && (
                      <button
                        onClick={(e) => handleCancelClick(e, img.id)}
                        className={cn(
                          "ml-auto p-1 rounded-md",
                          "text-destructive/70 hover:text-destructive hover:bg-destructive/10",
                          "transition-all duration-200"
                        )}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  {img.prompt && (
                    <span className="text-xs text-muted-foreground/60 truncate w-full group-hover:text-muted-foreground/70 transition-colors duration-200">
                      {img.prompt.length > 50 ? `${img.prompt.substring(0, 50)}...` : img.prompt}
                    </span>
                  )}
                  {img.error && (
                    <span className="text-xs text-destructive truncate w-full">
                      Error: {img.error}
                    </span>
                  )}
                  <div className="flex items-center gap-2 w-full">
                    <div className="flex gap-2 text-xs text-muted-foreground/50 group-hover:text-muted-foreground/60 transition-colors duration-200">
                      <span>{modelConfigs?.[img.model]?.name || img.model}</span>
                    </div>
                    <div className="flex gap-1 ml-auto">
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          "bg-muted/20 hover:bg-muted/30 text-foreground/70",
                          "transition-colors duration-200"
                        )}
                      >
                        {img.aspect_ratio || "1:1"}
                      </Badge>
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          "bg-muted/20 hover:bg-muted/30 text-foreground/70",
                          "transition-colors duration-200"
                        )}
                      >
                        {img.quality}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DrawerContent>
      </Drawer>

      <CancelGenerationDialog 
        isOpen={showCancelDialog}
        onClose={() => {
          setShowCancelDialog(false);
          setSelectedImageId(null);
        }}
        onConfirm={handleConfirmCancel}
      />
    </>
  );
};

export default GeneratingImagesDrawer;
