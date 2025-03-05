
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/supabase';

const GeneratingImagesContext = createContext();

export const GeneratingImagesProvider = ({ children }) => {
  const [generatingImages, setGeneratingImages] = useState([]);

  // Add auto-removal of completed images after 10 seconds
  useEffect(() => {
    const completedImages = generatingImages.filter(img => img.status === 'completed' || img.status === 'failed');
    
    if (completedImages.length > 0) {
      const timeouts = completedImages.map(img => {
        return setTimeout(() => {
          setGeneratingImages(prev => prev.filter(i => i.id !== img.id));
        }, 10000); // 10 seconds
      });

      // Cleanup timeouts
      return () => {
        timeouts.forEach(timeout => clearTimeout(timeout));
      };
    }
  }, [generatingImages]);

  // Monitor and manage the generation queue
  useEffect(() => {
    const processingCount = generatingImages.filter(img => img.status === 'processing').length;
    
    // If there's no image processing and we have pending images
    if (processingCount === 0) {
      const pendingImages = generatingImages.filter(img => img.status === 'pending');
      if (pendingImages.length > 0) {
        // Update the first pending image to processing
        setGeneratingImages(prev => prev.map(img => 
          img.id === pendingImages[0].id ? { ...img, status: 'processing' } : img
        ));
      }
    }
  }, [generatingImages]);

  const cancelGeneration = (imageId) => {
    setGeneratingImages(prev => {
      // Get the image being cancelled
      const cancelledImage = prev.find(img => img.id === imageId);
      
      // If the cancelled image was processing, we need to update the queue
      const wasProcessing = cancelledImage?.status === 'processing';
      
      // Remove the cancelled image
      const updatedImages = prev.filter(img => img.id !== imageId);
      
      // If the cancelled image was processing and we have pending images,
      // update the first pending image to processing
      if (wasProcessing) {
        const firstPending = updatedImages.find(img => img.status === 'pending');
        if (firstPending) {
          return updatedImages.map(img =>
            img.id === firstPending.id ? { ...img, status: 'processing' } : img
          );
        }
      }
      
      return updatedImages;
    });
  };

  const value = {
    generatingImages,
    setGeneratingImages,
    cancelGeneration
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
