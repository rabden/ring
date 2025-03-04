
import React, { useState, useEffect } from 'react'
import { Loader, Check, Clock, X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useModelConfigs } from '@/hooks/useModelConfigs'
import { MeshGradient } from "@/components/ui/mesh-gradient"
import { cn } from "@/lib/utils"
import CancelGenerationDialog from './alerts/CancelGenerationDialog'
import { useGeneratingImages } from '@/contexts/GeneratingImagesContext'

const GeneratingImagesDropdown = () => {
  const { data: modelConfigs } = useModelConfigs();
  const { 
    generatingImages, 
    cancelGeneration, 
    getCompletedCount,
    getPendingCount,
    getProcessingCount,
    getFailedCount
  } = useGeneratingImages();
  
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Show dropdown whenever there are any images (generating or completed)
  useEffect(() => {
    if (generatingImages.length > 0) {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  }, [generatingImages.length]);

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

  if (!showDropdown) return null;

  const processingCount = getProcessingCount();
  const pendingCount = getPendingCount();
  const completedCount = getCompletedCount();
  const failedCount = getFailedCount();
  const isAllCompleted = generatingImages.length > 0 && generatingImages.every(img => img.status === 'completed');

  const sortedImages = [...generatingImages].sort((a, b) => {
    const order = { processing: 0, pending: 1, completed: 2, failed: 3 };
    return order[a.status] - order[b.status];
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn(
              "h-8 rounded-xl bg-background/50 hover:bg-accent",
              "transition-all duration-200",
              isAllCompleted && "text-primary"
            )}
          >
            {isAllCompleted ? (
              <div className={cn(
                "p-1 rounded-lg mr-2",
                "animate-in zoom-in duration-300"
              )}>
                <Check className="w-4 h-4 text-primary/90" />
              </div>
            ) : processingCount > 0 ? (
              <div className="p-1 rounded-lg mr-2">
                <Loader className="w-4 h-4 animate-spin text-primary/90" />
              </div>
            ) : pendingCount > 0 ? (
              <div className="p-1 rounded-lg mr-2">
                <Clock className="w-4 h-4 text-muted-foreground/70" />
              </div>
            ) : failedCount > 0 ? (
              <div className="p-1 rounded-lg mr-2">
                <AlertCircle className="w-4 h-4 text-destructive/90" />
              </div>
            ) : (
              <div className="p-1 rounded-lg mr-2">
                <Check className="w-4 h-4 text-primary/90" />
              </div>
            )}
            <span className="text-sm">
              {processingCount > 0 ? 'Generating' : 
               pendingCount > 0 ? `Queued-${pendingCount}` : 
               failedCount > 0 ? `Failed-${failedCount}` :
               completedCount > 0 ? `Generated-${completedCount}` : 'Complete'}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="p-2 border-border/80 bg-card m-4 min-w-[350px]"
        >
          <ScrollArea className="max-h-[600px] scrollbar-none">
            {sortedImages.map((img) => (
              <DropdownMenuItem 
                key={img.id} 
                className={cn(
                  "flex flex-col items-start gap-2 p-3 rounded-lg",
                  "transition-all duration-200",
                  "hover:bg-accent/10 focus:bg-accent/10",
                  "group relative overflow-hidden",
                  "min-w-[300px]",
                  img.status === 'processing' && "min-h-[90px]"
                )}
                onSelect={(e) => e.preventDefault()}
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
                      ) : img.status === 'failed' ? (
                        <AlertCircle className="w-3.5 h-3.5 text-destructive/90" />
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
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>

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

export default GeneratingImagesDropdown;
