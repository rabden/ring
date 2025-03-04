
import React, { useState } from 'react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useModelConfigs } from '@/hooks/useModelConfigs'
import { useGeneratingImages } from '@/contexts/GeneratingImagesContext'
import CancelGenerationDialog from './alerts/CancelGenerationDialog'
import GenerationStatusItem from './generations/GenerationStatusItem'
import { Loader, Check, Clock, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const GeneratingImagesDrawer = ({ open, onOpenChange }) => {
  const { data: modelConfigs } = useModelConfigs();
  const { 
    generatingImages, 
    cancelGeneration, 
    getCompletedCount,
    getPendingCount,
    getProcessingCount,
    getFailedCount
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
  const failedCount = getFailedCount();

  // Sort images by status and then by creation date (newest first)
  const sortedImages = [...generatingImages].sort((a, b) => {
    const order = { processing: 0, pending: 1, completed: 2, failed: 3 };
    // First sort by status priority
    const statusDiff = order[a.status] - order[b.status];
    if (statusDiff !== 0) return statusDiff;
    
    // Then sort by creation date (newest first) if status is the same
    const dateA = new Date(a.created_at || 0).getTime();
    const dateB = new Date(b.created_at || 0).getTime();
    return dateB - dateA;
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
              ) : failedCount > 0 ? (
                <div className="flex items-center gap-3">
                  <div className="p-1 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-destructive/90" />
                  </div>
                  <span>Failed {failedCount} image{failedCount > 1 ? 's' : ''}</span>
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
            <DrawerDescription className="text-xs mt-1">
              {pendingCount > 0 && processingCount > 0 ? 'Images will be generated one at a time.' : ''}
            </DrawerDescription>
          </DrawerHeader>
          <ScrollArea className="flex-1 h-[70vh]">
            <div className="px-4 py-4 space-y-3">
              {sortedImages.map((img) => (
                <GenerationStatusItem
                  key={img.id}
                  image={img}
                  onCancelClick={handleCancelClick}
                  modelConfigs={modelConfigs}
                />
              ))}
            </div>
          </ScrollArea>
          <DrawerFooter className="px-4 py-3 border-t border-border/5">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onOpenChange(false)}
              className="w-full"
            >
              Close
            </Button>
          </DrawerFooter>
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
