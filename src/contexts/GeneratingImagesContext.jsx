
import React, { createContext, useContext } from 'react';
import { useSupabaseAuth } from '@/integrations/supabase/auth';
import { useGenerationStatus } from '@/hooks/useGenerationStatus';

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
    getProcessingCount
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
    error: status.error_message
  }));

  const value = {
    generatingImages,
    isLoadingGenerations: isLoading,
    cancelGeneration,
    createGenerationStatus,
    removeGenerationStatus,
    getCompletedCount,
    getPendingCount,
    getProcessingCount
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
