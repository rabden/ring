
import React, { createContext, useContext, useState, useEffect } from 'react';

const GeneratingImagesContext = createContext();

export const GeneratingImagesProvider = ({ children }) => {
  const [generatingImages, setGeneratingImages] = useState([]);
  const [shouldOpenDrawer, setShouldOpenDrawer] = useState(false);
  const [guidanceScale, setGuidanceScale] = useState(7.5);
  const [negativePrompt, setNegativePrompt] = useState("");

  // Add auto-removal of completed images after 10 seconds
  useEffect(() => {
    const completedImages = generatingImages.filter(img => img.status === 'completed');
    
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

  // Auto-open drawer logic
  useEffect(() => {
    // If a new image is added and it's the only one processing/pending
    if (generatingImages.length > 0) {
      const processingOrPendingCount = generatingImages.filter(img => 
        img.status === 'processing' || img.status === 'pending'
      ).length;
      
      // Only trigger auto-open when we're just starting a new generation
      // and there wasn't already something in the queue
      if (processingOrPendingCount === 1) {
        setShouldOpenDrawer(true);
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

  const resetShouldOpenDrawer = () => {
    setShouldOpenDrawer(false);
  };

  // Function to update guidance based on model config
  const updateModelSettings = (modelConfig) => {
    if (modelConfig) {
      // Set guidance scale from model's default only if guidance is used
      if (modelConfig.use_guidance && modelConfig.defaultguidance !== undefined) {
        setGuidanceScale(modelConfig.defaultguidance);
      }
      
      // Don't auto-fill negative prompt textbox
      // Only clear it if the model doesn't support negative prompts
      if (!modelConfig.use_negative_prompt) {
        setNegativePrompt("");
      }
    }
  };

  const value = {
    generatingImages,
    setGeneratingImages,
    cancelGeneration,
    shouldOpenDrawer,
    resetShouldOpenDrawer,
    guidanceScale,
    setGuidanceScale,
    negativePrompt,
    setNegativePrompt,
    updateModelSettings
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
