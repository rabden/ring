
import { supabase } from '@/integrations/supabase/supabase';
import { toast } from 'sonner';
import { qualityOptions } from '@/utils/imageConfigs';
import { calculateDimensions, getModifiedPrompt } from '@/utils/imageUtils';
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
  modelConfigs,
  imageCount = 1,
  negativePrompt,
  nsfwEnabled = false,
  onNSFWDetected,
  createGenerationStatus
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  // Process a single generation
  const processGeneration = useCallback(async (generationData) => {
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
        modelConfig
      } = generationData;

      // Prepare parameters for the model
      const parameters = {
        seed: actualSeed,
        width: finalWidth,
        height: finalHeight,
        ...(modelConfig.steps && { num_inference_steps: parseInt(modelConfig.steps) }),
        ...(modelConfig.use_guidance && { guidance_scale: modelConfig.defaultguidance }),
        ...(modelConfig.use_negative_prompt && negativePrompt && { 
          negative_prompt: negativePrompt 
        })
      };

      // Log request for debugging
      console.log('Making edge function call:', {
        model: modelConfig.huggingfaceId || model,
        prompt: modifiedPrompt,
        parameters,
        generationId
      });

      // Call our Edge Function with updated parameters and include modelName and generationId
      const { data: response, error } = await supabase.functions.invoke('generate-image', {
        body: {
          model: modelConfig.huggingfaceId || model,
          modelName: modelConfig.name || model, // Pass the display name
          prompt: modifiedPrompt,
          parameters,
          userId: session.user.id,          // Pass userId for storage
          isPrivate,                        // Pass privacy setting
          quality,                          // Pass quality setting
          aspectRatio: finalAspectRatio,    // Pass aspect ratio
          generationId                      // Pass the generation ID
        }
      });

      if (error) {
        throw new Error(`Edge function error: ${error.message}`);
      }

      if (!response || !response.image) {
        throw new Error('Invalid response from edge function');
      }

      // The image is already stored, we just log the success
      console.log('Edge function response received:', {
        success: response.success,
        hasImage: !!response.image,
        filePath: response.filePath
      });

      toast.success(`Image generated successfully! (${isPrivate ? 'Private' : 'Public'})`);

    } catch (error) {
      console.error('API call error:', {
        error,
        model: model,
        modelConfig
      });
      
      toast.error('Failed to generate image');
    } finally {
      setIsProcessing(false);
    }
  }, [session]);

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

    // Create generation statuses for all requested images
    for (let i = 0; i < imageCount; i++) {
      const actualSeed = randomizeSeed ? generateRandomSeed() : (seed + i);
      const modifiedPrompt = await getModifiedPrompt(finalPrompt || prompt, generationStates.model, modelConfigs);

      try {
        // Store complete generation parameters
        const parameters = {
          seed: actualSeed,
          width: finalWidth,
          height: finalHeight,
          ...(generationStates.modelConfig.steps && { 
            num_inference_steps: parseInt(generationStates.modelConfig.steps) 
          }),
          ...(generationStates.modelConfig.use_guidance && { 
            guidance_scale: generationStates.modelConfig.defaultguidance 
          }),
          ...(generationStates.modelConfig.use_negative_prompt && negativePrompt && { 
            negative_prompt: negativePrompt 
          })
        };

        // Create a generation status record
        const generationRecord = await createGenerationStatus({
          user_id: session.user.id,
          model: generationStates.model,
          model_name: generationStates.modelConfig.name,
          prompt: modifiedPrompt,
          parameters,
          status: 'pending',
          aspect_ratio: finalAspectRatio,
          quality: generationStates.quality,
          is_private: isPrivate
        });

        // Start processing the first image immediately
        if (i === 0) {
          setIsProcessing(true);
          processGeneration({
            generationId: generationRecord.id,
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
          });
        }
      } catch (error) {
        console.error('Error creating generation status:', error);
        toast.error('Failed to start image generation');
      }
    }
  };

  return {
    generateImage,
    isProcessing
  };
};
