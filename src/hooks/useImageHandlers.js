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
  const navigate = useNavigate();
  const { data: modelConfigs } = useModelConfigs();
  const { data: isPro = false } = useProUser(session?.user?.id);
  const { setIsRemixMode } = useUserPreferences();

  const handleGenerateImage = async () => {
    await generateImage()
  }

  const handleImageClick = (image) => {
    setSelectedImage(image)
    setFullScreenViewOpen(true)
  }

  const handleModelChange = (newModel) => {
    const modelConfig = modelConfigs?.[newModel];
    if (modelConfig?.qualityLimits) {
      // If current quality is not in the allowed qualities for this model, set to HD
      if (!modelConfig.qualityLimits.includes(quality)) {
        setQuality('HD');
      }
    }
    setModel(newModel);
  }

  const handleRemix = (image) => {
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
    setActiveView('input');
    navigate('/#imagegenerate');
  }

  const handleDownload = async (imageUrl, prompt) => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `${prompt}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  const handleDiscard = async (imageId) => {
    if (!imageId) {
      return;
    }
    
    try {
      await handleImageDiscard({ id: imageId }, queryClient);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }

  const handleViewDetails = (image) => {
    setSelectedImage(image);
    setDetailsDialogOpen(true);
  }

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
