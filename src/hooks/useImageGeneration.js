
import { supabase } from '@/integrations/supabase/supabase';
import { toast } from 'sonner';
import { qualityOptions } from '@/utils/imageConfigs';
import { calculateDimensions, getModifiedPrompt } from '@/utils/imageUtils';
import { handleApiResponse, initRetryCount } from '@/utils/retryUtils';
import { containsNSFWContent } from '@/utils/nsfwUtils';
import { useState, useRef, useCallback } from 'react';

const generateRandomSeed = () => {
  // Generate a positive 5-9 digit number within PostgreSQL int4 range (max 2147483647)
  const min = 10000;    // 5 digits minimum
  const max = 999999999; // 9 digits maximum
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const useImageGeneration = ({
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
  imageCount = 1,
  negativePrompt,
  nsfwEnabled = false,
  onNSFWDetected
}) => {
  // Queue to store pending generations
  const generationQueue = useRef([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Process the queue one item at a time
  const processQueue = useCallback(async () => {
    if (isProcessing || generationQueue.current.length === 0) return;

    setIsProcessing(true);
    const currentGeneration = generationQueue.current[0];

    try {
      const {
        generationId,
        model,
        quality,
        finalWidth,
        finalHeight,
        finalAspectRatio,
        modifiedPrompt,
        actualSeed,
        isPrivate,
        negativePrompt,
        modelConfig: queuedModelConfig
      } = currentGeneration;

      // Update UI to show processing status
      setGeneratingImages(prev => prev.map(img => 
        img.id === generationId ? { ...img, status: 'processing' } : img
      ));

      try {
        initRetryCount(generationId);

        // Prepare parameters for the model
        const parameters = {
          seed: actualSeed,
          width: finalWidth,
          height: finalHeight,
          ...(queuedModelConfig.steps && { num_inference_steps: parseInt(queuedModelConfig.steps) }),
          ...(queuedModelConfig.use_guidance && { guidance_scale: queuedModelConfig.defaultguidance }),
          ...(queuedModelConfig.use_negative_prompt && negativePrompt && { 
            negative_prompt: negativePrompt 
          })
        };

        // Log request for debugging
        console.log('Making edge function call:', {
          model: queuedModelConfig.huggingfaceId || model,
          prompt: modifiedPrompt,
          parameters
        });

        // Call our Edge Function with updated parameters and include modelName
        const { data: response, error } = await supabase.functions.invoke('generate-image', {
          body: {
            model: queuedModelConfig.huggingfaceId || model,
            modelName: queuedModelConfig.name || model, // Pass the display name
            prompt: modifiedPrompt,
            parameters,
            userId: session.user.id,          // Pass userId for storage
            isPrivate: isPrivate,             // Pass privacy setting
            quality: quality,                 // Pass quality setting
            aspectRatio: finalAspectRatio     // Pass aspect ratio
          }
        });

        if (error) {
          throw new Error(`Edge function error: ${error.message}`);
        }

        if (!response || !response.image) {
          throw new Error('Invalid response from edge function');
        }

        // The image is already stored, we just update the UI
        console.log('Edge function response received:', {
          success: response.success,
          hasImage: !!response.image,
          filePath: response.filePath
        });

        // Update UI to show completion
        setGeneratingImages(prev => prev.map(img => 
          img.id === generationId ? { ...img, status: 'completed' } : img
        ));

        toast.success(`Image generated successfully! (${isPrivate ? 'Private' : 'Public'})`);

      } catch (error) {
        console.error('API call error:', {
          error,
          model: model,
          modelConfig: queuedModelConfig
        });
        
        toast.error('Failed to generate image');
        setGeneratingImages(prev => prev.filter(img => img.id !== generationId));
      }
    } catch (error) {
      console.error('Error in generation:', error);
    } finally {
      // Remove the processed item from queue
      generationQueue.current.shift();
      setIsProcessing(false);
      
      // Process next item if any
      if (generationQueue.current.length > 0) {
        processQueue();
      }
    }
  }, [isProcessing, session, setGeneratingImages]);

  const generateImage = async (isPrivate = false, finalPrompt = null) => {
    if (!session || !prompt || !modelConfigs) {
      !session && toast.error('Please sign in to generate images');
      !prompt && toast.error('Please enter a prompt');
      !modelConfigs && console.error('Model configs not loaded');
      return;
    }

    // Lock the model config at generation time
    const lockedModelConfig = { ...modelConfigs[model] };
    if (!lockedModelConfig || !lockedModelConfig.huggingfaceId) {
      console.error('Invalid model configuration:', { model, config: lockedModelConfig });
      toast.error('Invalid model configuration');
      return;
    }

    // Log generation attempt for debugging
    console.log('Generation attempt:', {
      model,
      huggingfaceId: lockedModelConfig.huggingfaceId,
      modelName: lockedModelConfig.name
    });

    // Check for NSFW content if NSFW mode is disabled
    if (!nsfwEnabled) {
      const { isNSFW, foundWords } = containsNSFWContent(finalPrompt || prompt);
      if (isNSFW) {
        onNSFWDetected?.(foundWords);
        return;
      }
    }

    // Capture ALL states at generation time
    const generationStates = {
      model,
      quality,
      useAspectRatio,
      aspectRatio,
      width,
      height,
      negativePrompt,
      modelConfig: lockedModelConfig, // Use locked config
      maxDimension: qualityOptions[quality]
    };

    // Validate model and quality
    if (!generationStates.modelConfig) {
      toast.error('Invalid model selected');
      return;
    }

    if (generationStates.modelConfig?.qualityLimits && 
        !generationStates.modelConfig.qualityLimits.includes(generationStates.quality)) {
      toast.error(`Quality ${quality} not supported for model ${model}`);
      return;
    }

    // Deduct credits upfront for all images
    try {
      const result = await updateCredits({ quality: generationStates.quality, imageCount });
      if (result === -1) {
        toast.error('Insufficient credits');
        return;
      }
    } catch (error) {
      console.error('Error updating credits:', error);
      toast.error('Failed to process credits');
      return;
    }

    // Calculate dimensions once for all images in this batch
    const { width: finalWidth, height: finalHeight, aspectRatio: finalAspectRatio } = calculateDimensions(
      generationStates.useAspectRatio,
      generationStates.aspectRatio,
      generationStates.width,
      generationStates.height,
      generationStates.maxDimension
    );

    // Add all requested images to the queue with captured states
    for (let i = 0; i < imageCount; i++) {
      const actualSeed = randomizeSeed ? generateRandomSeed() : (seed + i);
      const generationId = Date.now().toString() + i;
      
      // Ensure we get the modified prompt without risking a circular reference
      let modifiedPrompt;
      try {
        modifiedPrompt = await getModifiedPrompt(finalPrompt || prompt, generationStates.model, modelConfigs);
      } catch (error) {
        console.error('Error modifying prompt:', error);
        modifiedPrompt = finalPrompt || prompt; // Fallback to original prompt
      }

      // Store complete generation parameters
      const queueItem = {
        generationId,
        model: generationStates.model,
        quality: generationStates.quality,
        finalWidth,
        finalHeight,
        finalAspectRatio,
        modifiedPrompt,
        actualSeed,
        isPrivate,
        negativePrompt: generationStates.negativePrompt,
        modelConfig: generationStates.modelConfig
      };

      generationQueue.current.push(queueItem);

      // Update UI state
      setGeneratingImages(prev => [...prev, {
        id: generationId,
        prompt: modifiedPrompt,
        seed: actualSeed,
        width: finalWidth,
        height: finalHeight,
        status: 'pending',
        isPrivate,
        model: generationStates.model,
        quality: generationStates.quality,
        aspect_ratio: finalAspectRatio
      }]);
    }

    // Start processing if not already processing
    if (!isProcessing) {
      processQueue();
    }
  };

  return {
    generateImage,
    isProcessing
  };
};
