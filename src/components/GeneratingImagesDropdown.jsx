
import React, { useState, useEffect } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useModelConfigs } from '@/hooks/useModelConfigs';
import { cn } from "@/lib/utils";
import CancelGenerationDialog from './alerts/CancelGenerationDialog';
import { useGeneratingImages } from '@/contexts/GeneratingImagesContext';
import GenerationStatusButton from './generations/GenerationStatusButton';
import GenerationStatusItem from './generations/GenerationStatusItem';

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
          <GenerationStatusButton
            processingCount={processingCount}
            pendingCount={pendingCount}
            completedCount={completedCount}
            failedCount={failedCount}
            isAllCompleted={isAllCompleted}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="p-2 border-border/80 bg-card m-4 min-w-[350px]"
        >
          <ScrollArea className="max-h-[600px] scrollbar-none">
            {sortedImages.map((img) => (
              <DropdownMenuItem 
                key={img.id} 
                onSelect={(e) => e.preventDefault()}
              >
                <GenerationStatusItem
                  image={img}
                  onCancelClick={handleCancelClick}
                  modelConfigs={modelConfigs}
                />
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
