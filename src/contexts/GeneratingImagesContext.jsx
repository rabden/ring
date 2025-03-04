
import React, { createContext, useContext } from 'react';
import { useSupabaseAuth } from '@/integrations/supabase/auth';
import { useGenerationStatus } from '@/hooks/useGenerationStatus';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/supabase';

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

  // Get latest pending or processing generation
  const getLatestActiveGeneration = () => {
    if (!hasActiveGenerations()) return null;
    
    const active = generatingImages.filter(
      img => img.status === 'processing' || img.status === 'pending'
    );
    
    if (active.length === 0) return null;
    
    return active.sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    })[0];
  };

  // Get all active generations
  const getActiveGenerations = () => {
    return generatingImages.filter(
      img => img.status === 'processing' || img.status === 'pending'
    );
  };

  // Clear completed generations to reduce clutter
  const clearCompletedGenerations = async () => {
    const completed = generationStatuses.filter(
      status => status.status === 'completed' || status.status === 'failed'
    );
    
    if (completed.length === 0) return;
    
    try {
      await Promise.all(completed.map(status => removeGenerationStatus(status.id)));
      toast.success(`Cleared ${completed.length} completed generations`);
    } catch (error) {
      console.error('Error clearing completed generations:', error);
      toast.error('Failed to clear some completed generations');
    }
  };

  // Format estimated time remaining based on position in queue and model
  const getEstimatedTimeRemaining = (generationId) => {
    const activeGenerations = getActiveGenerations();
    const position = activeGenerations.findIndex(gen => gen.id === generationId);
    
    if (position === -1) return null;
    
    // Average time per generation in seconds (estimated)
    const avgTimePerGeneration = {
      'stable-diffusion': 15,
      'sdxl': 30,
      'dall-e': 20,
      'default': 20
    };
    
    const generation = activeGenerations[position];
    const estimatedTimePerGen = avgTimePerGeneration[generation.model] || avgTimePerGeneration.default;
    
    // If processing, it's already being generated
    if (generation.status === 'processing') {
      return 'Processing now';
    }
    
    // If pending, calculate position in queue
    const pendingAhead = activeGenerations
      .filter(gen => gen.status === 'pending')
      .findIndex(gen => gen.id === generationId);
    
    if (pendingAhead === 0) {
      return 'Next in queue';
    }
    
    const totalSeconds = pendingAhead * estimatedTimePerGen;
    
    if (totalSeconds < 60) {
      return `~${totalSeconds} seconds`;
    } else {
      const minutes = Math.ceil(totalSeconds / 60);
      return `~${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
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
    hasActiveGenerations,
    getLatestActiveGeneration,
    getActiveGenerations,
    clearCompletedGenerations,
    getEstimatedTimeRemaining
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
