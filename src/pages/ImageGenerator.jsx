
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
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/supabase';
import { toast } from 'sonner';
import ImageGeneratorContent from '@/components/ImageGeneratorContent';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { useGeneratingImages } from '@/contexts/GeneratingImagesContext';
import NSFWAlert from '@/components/alerts/NSFWAlert';
import { containsNSFWContent } from '@/utils/nsfwUtils';

const ImageGenerator = () => {
  // Always initialize all state and hooks at the top level
  const [searchParams] = useSearchParams();
  const remixId = searchParams.get('remix');
  const { session } = useSupabaseAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('images');
  const [showNSFWAlert, setShowNSFWAlert] = useState(false);
  const [nsfwFoundWords, setNsfwFoundWords] = useState([]);
  const [activeFilters, setActiveFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [showPrivate, setShowPrivate] = useState(false);
  const [negativePrompt, setNegativePrompt] = useState("");
  const [remixProcessed, setRemixProcessed] = useState(false);

  const queryClient = useQueryClient();
  const isHeaderVisible = useScrollDirection();
  const { nsfwEnabled, setNsfwEnabled, setIsRemixMode } = useUserPreferences();
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
    return nsfwEnabled ? 'nsfwMaster' : 'flux';
  }, [nsfwEnabled]);

  const { generateImage, nsfwDetected } = useImageGeneration({
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
    negativePrompt,
    nsfwEnabled,
    onNSFWDetected: (foundWords) => {
      setNsfwFoundWords(foundWords);
      setShowNSFWAlert(true);
    }
  });

  // Define handleGenerateImage with useCallback to prevent unnecessary re-renders
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

    if (!nsfwEnabled) {
      const { isNSFW, foundWords } = containsNSFWContent(prompt);
      if (isNSFW) {
        setNsfwFoundWords(foundWords);
        setShowNSFWAlert(true);
        return;
      }
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
    prompt, session, isImproving, nsfwEnabled, generateImage, 
    isPrivate, improveCurrentPrompt, model, modelConfigs, setPrompt
  ]);

  const handleAspectRatioChange = useCallback((newRatio) => {
    setAspectRatio(newRatio);
  }, [setAspectRatio]);

  // Define imageHandlers object - ensure this is always created regardless of conditions
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

  // Extract all handlers from the imageHandlers object
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

  // Use a separate useEffect to handle remix ID to avoid loops
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
      // Mark as processed to prevent multiple applications
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
      
      // Clean up URL without causing a refresh or state update
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
      <NSFWAlert 
        isVisible={showNSFWAlert} 
        onClose={() => setShowNSFWAlert(false)}
        foundWords={nsfwFoundWords}
      />
      <ImageGeneratorContent
        session={session}
        credits={credits}
        bonusCredits={bonusCredits}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        generatingImages={generatingImages}
        setGeneratingImages={setGeneratingImages}
        nsfwEnabled={nsfwEnabled}
        setNsfwEnabled={setNsfwEnabled}
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
          nsfwEnabled,
          setNsfwEnabled,
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
