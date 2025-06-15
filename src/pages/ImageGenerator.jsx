
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useLocation, useSearchParams } from 'react-router-dom';
import { useSupabaseAuth } from '@/integrations/supabase/auth';
import { useUserCredits } from '@/hooks/useUserCredits';
import { useImageGeneration } from '@/hooks/useImageGeneration';
import { useQueryClient } from '@tanstack/react-query';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { usePromptImprovement } from '@/hooks/usePromptImprovement';
import { useImageGeneratorState } from '@/hooks/useImageGeneratorState';
import { useImageHandlers } from '@/hooks/useImageHandlers';
import { useProUser } from '@/hooks/useProUser';
import { useModelConfigs } from '@/hooks/useModelConfigs';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { toast } from 'sonner';
import ImageGeneratorContent from '@/components/ImageGeneratorContent';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { useGeneratingImages } from '@/contexts/GeneratingImagesContext';

const ImageGenerator = () => {
  const location = useLocation();
  const { session } = useSupabaseAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('images');
  const [activeFilters, setActiveFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [showPrivate, setShowPrivate] = useState(false);
  const [remixProcessed, setRemixProcessed] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const queryClient = useQueryClient();
  const isHeaderVisible = useScrollDirection();
  const { generatingImages, setGeneratingImages, negativePrompt, setNegativePrompt, guidanceScale, setGuidanceScale, updateModelSettings } = useGeneratingImages();
  const { credits, bonusCredits, updateCredits } = useUserCredits(session?.user?.id);
  const { data: isPro } = useProUser(session?.user?.id);
  const { data: modelConfigs } = useModelConfigs();
  
  const {
    isImproving,
    improveCurrentPrompt
  } = usePromptImprovement(session?.user?.id);

  const {
    prompt, setPrompt, seed, setSeed, randomizeSeed, setRandomizeSeed,
    width, setWidth, height, setHeight,
    model, setModel, aspectRatio, setAspectRatio,
    useAspectRatio, setUseAspectRatio, quality, setQuality,
    selectedImage, setSelectedImage,
    detailsDialogOpen, setDetailsDialogOpen, fullScreenViewOpen, setFullScreenViewOpen,
    fullScreenImageIndex, setFullScreenImageIndex,
    activeView, setActiveView,
    imageCount, setImageCount
  } = useImageGeneratorState();

  const defaultModel = useMemo(() => {
    return 'flux';
  }, []);

  const { generateImage } = useImageGeneration({
    session,
    prompt,
    seed,
    randomizeSeed,
    width,
    height,
    model,
    quality,
    useAspectRatio,
    aspectRatio,
    updateCredits,
    setGeneratingImages,
    modelConfigs,
    imageCount
  });

  const handleGenerateImage = useCallback(async () => {
    console.log('handleGenerateImage called', {prompt, session, isImproving});
    
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }
    if (!session) {
      toast.error('Please sign in to generate images');
      return;
    }

    setIsGenerating(true);
    try {
      let finalPrompt = prompt;
      
      if (isImproving) {
        const improved = await improveCurrentPrompt(prompt, model, modelConfigs);
        if (!improved) {
          setIsGenerating(false);
          return;
        }
        finalPrompt = improved;
        setPrompt(improved);
      }

      console.log('Calling generateImage with:', {isPrivate, finalPrompt});
      await generateImage(isPrivate, finalPrompt);
    } catch (error) {
      toast.error('Failed to generate image');
      console.error('Generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [
    prompt, session, isImproving, generateImage, 
    isPrivate, improveCurrentPrompt, model, modelConfigs, setPrompt
  ]);

  const handleAspectRatioChange = useCallback((newRatio) => {
    setAspectRatio(newRatio);
  }, [setAspectRatio]);

  const imageHandlers = useImageHandlers({
    generateImage: handleGenerateImage,
    setSelectedImage,
    setFullScreenViewOpen,
    setModel,
    setPrompt,
    setSeed,
    setRandomizeSeed,
    setWidth,
    setHeight,
    setQuality,
    quality,
    setAspectRatio,
    setUseAspectRatio,
    aspectRatios: [],
    session,
    queryClient,
    activeView,
    setDetailsDialogOpen,
    setActiveView,
  });

  const {
    handleImageClick,
    handleModelChange,
    handleRemix,
    handleDownload,
    handleDiscard,
    handleViewDetails,
  } = imageHandlers;

  // Simplified remix processing - handle state from navigation
  useEffect(() => {
    const remixImage = location.state?.remixImage;
    if (remixImage && !remixProcessed) {
      console.log('Processing remix from navigation state:', remixImage);
      setRemixProcessed(true);
      
      // Apply remix data
      setPrompt(remixImage.user_prompt || remixImage.prompt);
      setSeed(remixImage.seed);
      setRandomizeSeed(false);
      setWidth(remixImage.width);
      setHeight(remixImage.height);
      setModel(remixImage.model);
      setQuality(remixImage.quality);
      
      // Update context values
      if (remixImage.negative_prompt) {
        setNegativePrompt(remixImage.negative_prompt);
      }
      
      // Set guidance scale from model config
      if (modelConfigs && modelConfigs[remixImage.model]?.defaultguidance !== undefined) {
        setGuidanceScale(modelConfigs[remixImage.model].defaultguidance);
      }
      
      if (remixImage.aspect_ratio) {
        setAspectRatio(remixImage.aspect_ratio);
        setUseAspectRatio(true);
      }
      
      // Set tab based on device
      if (isMobile) {
        setActiveTab('input');
      } else {
        setActiveTab('images');
        // Scroll to top for desktop
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      }
      
      // Clear remix state
      window.history.replaceState({}, '', location.pathname);
      
      console.log('Remix processing completed');
    }
  }, [
    location.state, remixProcessed, setActiveTab, setAspectRatio, setHeight, 
    setModel, setPrompt, setQuality, setRandomizeSeed, 
    setSeed, setUseAspectRatio, setWidth, setNegativePrompt, setGuidanceScale, 
    modelConfigs, isMobile
  ]);

  // Reset remix processed flag when location pathname changes
  useEffect(() => {
    setRemixProcessed(false);
  }, [location.pathname]);

  useEffect(() => {
    if (modelConfigs && modelConfigs[model]) {
      updateModelSettings(modelConfigs[model]);
    }
  }, [model, modelConfigs, updateModelSettings]);

  return (
    <>
      <ImageGeneratorContent
        session={session}
        credits={credits}
        bonusCredits={bonusCredits}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        generatingImages={generatingImages}
        setGeneratingImages={setGeneratingImages}
        showPrivate={showPrivate}
        setShowPrivate={setShowPrivate}
        activeFilters={activeFilters}
        onFilterChange={(type, value) => setActiveFilters(prev => ({ ...prev, [type]: value }))}
        onRemoveFilter={(type) => {
          const newFilters = { ...activeFilters };
          delete newFilters[type];
          setActiveFilters(newFilters);
        }}
        onSearch={setSearchQuery}
        isHeaderVisible={isHeaderVisible}
        handleImageClick={handleImageClick}
        handleDownload={handleDownload}
        handleDiscard={handleDiscard}
        handleRemix={handleRemix}
        handleViewDetails={handleViewDetails}
        selectedImage={selectedImage}
        detailsDialogOpen={detailsDialogOpen}
        setDetailsDialogOpen={setDetailsDialogOpen}
        fullScreenViewOpen={fullScreenViewOpen}
        setFullScreenViewOpen={setFullScreenViewOpen}
        proMode={isPro}
        imageGeneratorProps={{
          prompt,
          setPrompt,
          generateImage: handleGenerateImage,
          model,
          setModel: handleModelChange,
          seed,
          setSeed,
          randomizeSeed,
          setRandomizeSeed,
          quality,
          setQuality,
          useAspectRatio,
          setUseAspectRatio,
          aspectRatio,
          setAspectRatio,
          width,
          setWidth,
          height,
          setHeight,
          imageCount,
          setImageCount,
          isPrivate,
          setIsPrivate,
          modelConfigs,
          negativePrompt,
          setNegativePrompt,
          updateCredits,
          onModelChange: handleModelChange,
          onAspectRatioChange: handleAspectRatioChange,
          proMode: isPro
        }}
      />
    </>
  );
};

export default ImageGenerator;
