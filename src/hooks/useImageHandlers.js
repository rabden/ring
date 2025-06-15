
import { useCallback } from 'react'
import { deleteImageCompletely } from '@/integrations/supabase/imageUtils'
import { useModelConfigs } from '@/hooks/useModelConfigs'
import { useProUser } from '@/hooks/useProUser'
import { toast } from 'sonner'
import { handleImageDiscard } from '@/utils/discardUtils'
import { useNavigate } from 'react-router-dom'
import { qualityOptions } from '@/utils/imageConfigs'

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
    handleDownload,
    handleDiscard,
    handleViewDetails,
  }
}
