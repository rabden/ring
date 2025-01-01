import { useState, useEffect } from 'react';
import { useModelConfigs } from './useModelConfigs';

export const useImageGeneratorState = () => {
  const { data: modelConfigs } = useModelConfigs();
  
  const [state, setState] = useState({
    prompt: '',
    seed: 0,
    randomizeSeed: true,
    width: 1024,
    height: 1024,
    model: 'fluxDev',
    activeTab: 'images',
    aspectRatio: '1:1',
    useAspectRatio: true,
    quality: 'HD',
    modelSidebarOpen: false,
    selectedImage: null,
    detailsDialogOpen: false,
    fullScreenViewOpen: false,
    fullScreenImageIndex: 0,
    generatingImages: [],
    activeView: 'myImages',
    nsfwEnabled: false,
    style: null,
    imageCount: 1,
    isPrivate: false
  });

  // Add auto-removal of completed images
  useEffect(() => {
    const completedImages = state.generatingImages.filter(img => img.status === 'completed');
    
    if (completedImages.length > 0) {
      const timeouts = completedImages.map(img => {
        return setTimeout(() => {
          setState(prev => ({
            ...prev,
            generatingImages: prev.generatingImages.filter(i => i.id !== img.id)
          }));
        }, 10000); // 10 seconds
      });

      // Cleanup timeouts
      return () => {
        timeouts.forEach(timeout => clearTimeout(timeout));
      };
    }
  }, [state.generatingImages]);

  const setGeneratingImages = (value) => {
    setState(prev => ({
      ...prev,
      generatingImages: Array.isArray(value) ? value : typeof value === 'function' ? value(prev.generatingImages) : []
    }));
  };

  // Create setters for each state property
  const setters = {
    setPrompt: (value) => setState(prev => ({ ...prev, prompt: value })),
    setSeed: (value) => setState(prev => ({ ...prev, seed: value })),
    setRandomizeSeed: (value) => setState(prev => ({ ...prev, randomizeSeed: value })),
    setWidth: (value) => setState(prev => ({ ...prev, width: value })),
    setHeight: (value) => setState(prev => ({ ...prev, height: value })),
    setModel: (value) => setState(prev => ({ ...prev, model: value })),
    setActiveTab: (value) => setState(prev => ({ ...prev, activeTab: value })),
    setAspectRatio: (value) => setState(prev => ({ ...prev, aspectRatio: value })),
    setUseAspectRatio: (value) => setState(prev => ({ ...prev, useAspectRatio: value })),
    setQuality: (value) => setState(prev => ({ ...prev, quality: value })),
    setModelSidebarOpen: (value) => setState(prev => ({ ...prev, modelSidebarOpen: value })),
    setSelectedImage: (value) => setState(prev => ({ ...prev, selectedImage: value })),
    setDetailsDialogOpen: (value) => setState(prev => ({ ...prev, detailsDialogOpen: value })),
    setFullScreenViewOpen: (value) => setState(prev => ({ ...prev, fullScreenViewOpen: value })),
    setFullScreenImageIndex: (value) => setState(prev => ({ ...prev, fullScreenImageIndex: value })),
    setGeneratingImages,
    setActiveView: (value) => setState(prev => ({ ...prev, activeView: value })),
    setNsfwEnabled: (value) => setState(prev => ({ ...prev, nsfwEnabled: value })),
    setStyle: (value) => setState(prev => ({ ...prev, style: value })),
    setImageCount: (value) => setState(prev => ({ ...prev, imageCount: value })),
    setIsPrivate: (value) => setState(prev => ({ ...prev, isPrivate: value }))
  };

  return {
    ...state,
    ...setters
  };
};