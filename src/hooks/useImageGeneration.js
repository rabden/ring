
import { supabase } from '@/integrations/supabase/supabase';
import { toast } from 'sonner';
import { qualityOptions } from '@/utils/imageConfigs';
import { calculateDimensions, getModifiedPrompt } from '@/utils/imageUtils';
import { handleApiResponse, initRetryCount } from '@/utils/retryUtils';
import { useState, useRef, useCallback } from 'react';
import { HfInference } from "@huggingface/inference";
import { useGeneratingImages } from '@/contexts/GeneratingImagesContext';

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
  imageCount = 1
}) => {
  // Get guidance scale and negative prompt from context
  const { guidanceScale, negativePrompt } = useGeneratingImages();
  
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
        modifiedPrompt,
        actualSeed,
        isPrivate,
        negativePrompt: queuedNegativePrompt,
        guidanceScale: queuedGuidanceScale,
        modelConfig: queuedModelConfig
      } = currentGeneration;

      // Update UI to show processing status
      setGeneratingImages(prev => prev.map(img => 
        img.id === generationId ? { ...img, status: 'processing' } : img
      ));

      const makeRequest = async (needNewKey = false) => {
        try {
          initRetryCount(generationId);

          const { data: apiKeyData, error: apiKeyError } = await supabase
            .from('huggingface_api_keys')
            .select('api_key')
            .eq('is_active', true)
            .order('last_used_at', { ascending: true })
            .limit(1)
            .single();
          
          if (apiKeyError) {
            setGeneratingImages(prev => prev.filter(img => img.id !== generationId));
            toast.error('Failed to get API key');
            throw new Error(`Failed to get API key: ${apiKeyError.message}`);
          }
          if (!apiKeyData) {
            setGeneratingImages(prev => prev.filter(img => img.id !== generationId));
            toast.error('No active API key available');
            throw new Error('No active API key available');
          }

          await supabase
            .from('huggingface_api_keys')
            .update({ last_used_at: new Date().toISOString() })
            .eq('api_key', apiKeyData.api_key);

          const parameters = {
            seed: actualSeed,
            width: finalWidth,
            height: finalHeight,
            ...(queuedModelConfig.steps && { num_inference_steps: parseInt(queuedModelConfig.steps) }),
            ...(queuedModelConfig.use_guidance && { guidance_scale: queuedGuidanceScale }),
            ...(queuedModelConfig.use_negative_prompt && queuedNegativePrompt && { 
              negative_prompt: queuedNegativePrompt 
            })
          };

          // Log actual API call for debugging
          console.log('Processing queued generation:', {
            model: model,
            modelName: modelConfigs[model]?.name,
            huggingfaceModelId: queuedModelConfig.huggingfaceId || model,
            guidanceScale: queuedGuidanceScale,
            negativePrompt: queuedNegativePrompt
          });

          // Create HfInference client with API key
          const client = new HfInference(apiKeyData.api_key);
          
          console.log('Making HfInference API call:', {
            model: queuedModelConfig.huggingfaceId || model,
            inputs: modifiedPrompt,
            parameters
          });

          // Use the HfInference client to generate the image
          const imageBlob = await client.textToImage({
            model: queuedModelConfig.huggingfaceId || model,
            inputs: modifiedPrompt,
            parameters,
          });

          // Log response for debugging
          console.log('API response received:', {
            model: model,
            success: !!imageBlob,
            blobSize: imageBlob?.size
          });

          if (!imageBlob || imageBlob.size === 0) {
            setGeneratingImages(prev => prev.filter(img => img.id !== generationId));
            toast.error('Generated image is invalid');
            throw new Error('Generated image is empty or invalid');
          }

          const timestamp = Date.now();
          const filePath = `${session.user.id}/${timestamp}.png`;
          
          const { error: uploadError } = await supabase.storage
            .from('user-images')
            .upload(filePath, imageBlob);
            
          if (uploadError) {
            throw uploadError;
          }

          // Insert new image record with like_count initialized to 0
          const { data: insertData, error: insertError } = await supabase
            .from('user_images')
            .insert([{
              user_id: session.user.id,
              storage_path: filePath,
              prompt: modifiedPrompt,
              seed: actualSeed,
              width: finalWidth,
              height: finalHeight,
              model,
              quality,
              aspect_ratio: currentGeneration.finalAspectRatio,
              is_private: isPrivate,
              negative_prompt: queuedNegativePrompt,
              like_count: 0
            }])
            .select()
            .single();

          if (insertError) {
            console.error('Error inserting image record:', insertError);
            throw insertError;
          }

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
          
          // Handle rate limiting and other errors
          if (error.message && (error.message.includes('429') || error.message.includes('rate limit'))) {
            toast.error('Rate limit exceeded. Trying again...');
            setTimeout(() => makeRequest(true), 2000);
            return;
          }
          
          toast.error('Failed to generate image');
          setGeneratingImages(prev => prev.filter(img => img.id !== generationId));
        }
      };

      await makeRequest();

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
      modelName: lockedModelConfig.name,
      guidanceScale,
      negativePrompt
    });

    // Capture ALL states at generation time
    const generationStates = {
      model,
      quality,
      useAspectRatio,
      aspectRatio,
      width,
      height,
      negativePrompt, // From context
      guidanceScale, // From context
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
      
      const modifiedPrompt = await getModifiedPrompt(finalPrompt || prompt, generationStates.model, modelConfigs);

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
        guidanceScale: generationStates.guidanceScale,
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
