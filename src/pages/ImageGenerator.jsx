import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/integrations/supabase/components/AuthProvider';
import { useUserCredits } from '@/hooks/useUserCredits';
import { useImageGeneration } from '@/hooks/useImageGeneration';
import { useQueryClient } from '@tanstack/react-query';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { usePromptImprovement } from '@/hooks/usePromptImprovement';
import { useImageGeneratorState } from '@/hooks/useImageGeneratorState';
import { useImageHandlers } from '@/hooks/useImageHandlers';
import { useProUser } from '@/hooks/useProUser';
import { useModelConfigs } from '@/hooks/useModelConfigs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/supabase';
import { toast } from 'sonner';
import ImageGeneratorContent from '@/components/ImageGeneratorContent';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { useGeneratingImages } from '@/contexts/GeneratingImagesContext';

const ImageGenerator = () => {
  const [searchParams] = useSearchParams();
  const remixId = searchParams.get('remix');
  const { session } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('images');
  const [activeFilters, setActiveFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [showPrivate, setShowPrivate] = useState(false);
  const [negativePrompt, setNegativePrompt] = useState("");
  const [remixProcessed, setRemixProcessed] = useState(false);

  const queryClient = useQueryClient();
  const isHeaderVisible = useScrollDirection();
  const { setIsRemixMode } = useUserPreferences();
  const { generatingImages, setGeneratingImages } = useGeneratingImages();
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
    imageCount,
    negativePrompt
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

  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#imagegenerate') {
      setActiveTab('input');
    } else if (hash === '#notifications') {
      setActiveTab('notifications');
    } else {
      setActiveTab('images');
    }
  }, [window.location.hash]);

  const { data: remixImage, isLoading: isRemixLoading } = useQuery({
    queryKey: ['remixImage', remixId],
    queryFn: async () => {
      if (!remixId) return null;
      const { data, error } = await supabase
        .from('user_images')
        .select('*')
        .eq('id', remixId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!remixId && !remixProcessed,
  });

  useEffect(() => {
    if (remixImage && !remixProcessed) {
      setRemixProcessed(true);
      setIsRemixMode(true);
      
      setPrompt(remixImage.prompt);
      setSeed(remixImage.seed);
      setRandomizeSeed(false);
      setWidth(remixImage.width);
      setHeight(remixImage.height);
      setModel(remixImage.model);
      setQuality(remixImage.quality);
      
      if (remixImage.aspect_ratio) {
        setAspectRatio(remixImage.aspect_ratio);
        setUseAspectRatio(true);
      }
      
      setActiveTab('input');
      
      if (window.history.replaceState) {
        const newUrl = window.location.pathname;
        window.history.replaceState({ path: newUrl }, '', newUrl);
      }
    }
  }, [
    remixImage, remixProcessed, setActiveTab, setAspectRatio, setHeight, 
    setIsRemixMode, setModel, setPrompt, setQuality, setRandomizeSeed, 
    setSeed, setUseAspectRatio, setWidth
  ]);
  
  useEffect(() => {
    return () => {
      setIsRemixMode(false);
    };
  }, [setIsRemixMode]);

  if (isRemixLoading && !remixProcessed) {
    return <div>Loading remix...</div>;
  }

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
