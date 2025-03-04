
import React, { createContext, useContext } from 'react';
import { useSupabaseAuth } from '@/integrations/supabase/auth';
import { useGenerationStatus } from '@/hooks/useGenerationStatus';
import { toast } from 'sonner';

const GeneratingImagesContext = createContext();

export const GeneratingImagesProvider = ({ children }) => {
  const { session } = useSupabaseAuth();
  const userId = session?.user?.id;
  
  const {
    generationStatuses,
    isLoading,
    cancelGeneration,
    createGenerationStatus,
    removeGenerationStatus,
    getCompletedCount,
    getPendingCount,
    getProcessingCount,
    getFailedCount
  } = useGenerationStatus(userId);

  // Map generation statuses to the previous format for backward compatibility
  const generatingImages = generationStatuses.map(status => ({
    id: status.id,
    prompt: status.prompt,
    seed: status.parameters?.seed,
    width: status.parameters?.width,
    height: status.parameters?.height,
    status: status.status === 'pending' ? 'pending' : 
           status.status === 'processing' ? 'processing' : 
           status.status === 'completed' ? 'completed' : 'failed',
    isPrivate: status.is_private,
    model: status.model,
    quality: status.quality,
    aspect_ratio: status.aspect_ratio,
    error: status.error_message,
    created_at: status.created_at,
    updated_at: status.updated_at,
    image_id: status.image_id
  }));

  // Cancel all pending and processing generations
  const cancelAllGenerations = async () => {
    const pendingAndProcessing = generationStatuses.filter(
      status => status.status === 'pending' || status.status === 'processing'
    );
    
    if (pendingAndProcessing.length === 0) return;
    
    try {
      await Promise.all(pendingAndProcessing.map(status => cancelGeneration(status.id)));
      toast.success(`Cancelled ${pendingAndProcessing.length} generations`);
    } catch (error) {
      console.error('Error cancelling generations:', error);
      toast.error('Failed to cancel some generations');
    }
  };

  // Get the most recent generation (useful for tracking current progress)
  const getMostRecentGeneration = () => {
    if (generatingImages.length === 0) return null;
    
    return generatingImages.sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    })[0];
  };

  // Check if any generations are active (pending or processing)
  const hasActiveGenerations = () => {
    return getProcessingCount() > 0 || getPendingCount() > 0;
  };

  const value = {
    generatingImages,
    isLoadingGenerations: isLoading,
    cancelGeneration,
    cancelAllGenerations,
    createGenerationStatus,
    removeGenerationStatus,
    getCompletedCount,
    getPendingCount,
    getProcessingCount,
    getFailedCount,
    getMostRecentGeneration,
    hasActiveGenerations
  };

  return (
    <GeneratingImagesContext.Provider value={value}>
      {children}
    </GeneratingImagesContext.Provider>
  );
};

export const useGeneratingImages = () => {
  const context = useContext(GeneratingImagesContext);
  if (context === undefined) {
    throw new Error('useGeneratingImages must be used within a GeneratingImagesProvider');
  }
  return context;
};
