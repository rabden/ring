
import { useCallback } from 'react'
import { deleteImageCompletely } from '@/integrations/supabase/imageUtils'
import { useModelConfigs } from '@/hooks/useModelConfigs'
import { useProUser } from '@/hooks/useProUser'
import { toast } from 'sonner'
import { handleImageDiscard } from '@/utils/discardUtils'
import { useNavigate } from 'react-router-dom'
import { qualityOptions } from '@/utils/imageConfigs'
import { useUserPreferences } from '@/contexts/UserPreferencesContext'

export const useImageHandlers = ({
  generateImage,
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
  aspectRatios = [],
  session,
  queryClient,
  activeView,
  setDetailsDialogOpen,
  setActiveView,
}) => {
  // Always initialize hooks at the top level, never conditionally
  const navigate = useNavigate();
  const { data: modelConfigs } = useModelConfigs();
  const { data: isPro = false } = useProUser(session?.user?.id);
  const { setIsRemixMode } = useUserPreferences();

  // Convert all handler functions to useCallback to prevent unnecessary re-renders
  const handleGenerateImage = useCallback(async () => {
    await generateImage()
  }, [generateImage]);

  const handleImageClick = useCallback((image) => {
    setSelectedImage(image)
    setFullScreenViewOpen(true)
  }, [setSelectedImage, setFullScreenViewOpen]);

  const handleModelChange = useCallback((newModel) => {
    const modelConfig = modelConfigs?.[newModel];
    if (modelConfig?.qualityLimits) {
      // If current quality is not in the allowed qualities for this model, set to HD
      if (!modelConfig.qualityLimits.includes(quality)) {
        setQuality('HD');
      }
    }
    setModel(newModel);
  }, [modelConfigs, quality, setQuality, setModel]);

  const handleRemix = useCallback((image) => {
    if (!session) {
      return;
    }
    
    // Set remix mode flag
    setIsRemixMode(true);

    setPrompt(image.prompt);
    setSeed(image.seed);
    setRandomizeSeed(false);
    setWidth(image.width);
    setHeight(image.height);
    setModel(image.model);
    
    // Check if the quality is valid for the model before setting it
    const modelConfig = modelConfigs?.[image.model];
    if (modelConfig?.qualityLimits) {
      if (modelConfig.qualityLimits.includes(image.quality)) {
        setQuality(image.quality);
      } else {
        setQuality('HD'); // Default to HD if quality not supported
      }
    } else {
      setQuality(image.quality);
    }

    if (image.aspect_ratio) {
      setAspectRatio(image.aspect_ratio);
      setUseAspectRatio(true);
    }
    
    // Instead of directly setting the activeView, we'll use the navigate function
    // which will trigger the appropriate effect in ImageGenerator
    navigate('/#imagegenerate');
  }, [
    session, setIsRemixMode, setPrompt, setSeed, setRandomizeSeed, 
    setWidth, setHeight, setModel, modelConfigs, setQuality, 
    setAspectRatio, setUseAspectRatio, navigate
  ]);

  const handleDownload = useCallback(async (imageUrl, prompt) => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `${prompt}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, []);

  const handleDiscard = useCallback(async (imageId) => {
    if (!imageId) {
      return;
    }
    
    try {
      await handleImageDiscard({ id: imageId }, queryClient);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }, [queryClient]);

  const handleViewDetails = useCallback((image) => {
    setSelectedImage(image);
    setDetailsDialogOpen(true);
  }, [setSelectedImage, setDetailsDialogOpen]);

  return {
    handleGenerateImage,
    handleImageClick,
    handleModelChange,
    handleRemix,
    handleDownload,
    handleDiscard,
    handleViewDetails,
  }
}
