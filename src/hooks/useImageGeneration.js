import { supabase } from '@/integrations/supabase/supabase';
import { toast } from 'sonner';
import { qualityOptions } from '@/utils/imageConfigs';
import { calculateDimensions, getModifiedPrompt } from '@/utils/imageUtils';
import { handleApiResponse, initRetryCount } from '@/utils/retryUtils';
import { useState, useRef, useCallback } from 'react';

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
  negativePrompt
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
        modifiedPrompt,
        actualSeed,
        isPrivate,
        negativePrompt,
        modelConfig
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
            ...(modelConfig.steps && { num_inference_steps: parseInt(modelConfig.steps) }),
            ...(modelConfig.use_guidance && { guidance_scale: modelConfig.defaultguidance }),
            ...(modelConfig.use_negative_prompt && negativePrompt && { 
              negative_prompt: negativePrompt 
            })
          };

          const response = await fetch(modelConfig?.apiUrl, {
            headers: {
              Authorization: `Bearer ${apiKeyData.api_key}`,
              "Content-Type": "application/json",
              "x-wait-for-model": "true"
            },
            method: "POST",
            body: JSON.stringify({
              inputs: modifiedPrompt,
              parameters
            }),
          });

          const imageBlob = await handleApiResponse(response, generationId, () => makeRequest(response.status === 429));
          if (!imageBlob) {
            setGeneratingImages(prev => prev.filter(img => img.id !== generationId));
            toast.error('Failed to generate image');
            return;
          }

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
              is_private: isPrivate
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
          console.error('Error generating image:', error);
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
  }, [isProcessing, session, setGeneratingImages, updateCredits]);

  const generateImage = async (isPrivate = false, finalPrompt = null) => {
    if (!session || !prompt || !modelConfigs) {
      !session && toast.error('Please sign in to generate images');
      !prompt && toast.error('Please enter a prompt');
      !modelConfigs && console.error('Model configs not loaded');
      return;
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
      modelConfig: modelConfigs[model], // Store the specific config for this generation
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
      const actualSeed = randomizeSeed ? Math.floor(Math.random() * 1000000) : seed + i;
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
        modelConfig: generationStates.modelConfig // Keep for API URL and specific settings
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
        quality: generationStates.quality
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