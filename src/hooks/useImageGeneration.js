
import { supabase } from '@/integrations/supabase/supabase';
import { toast } from 'sonner';
import { qualityOptions } from '@/utils/imageConfigs';
import { calculateDimensions, getModifiedPrompt } from '@/utils/imageUtils';
import { containsNSFWContent } from '@/utils/nsfwUtils';
import { useState, useRef, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

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
  // Store in-progress generations
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Subscribe to queue status updates
  useEffect(() => {
    if (!session?.user?.id) return;
    
    const channel = supabase
      .channel('queue-updates')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'image_generation_queue',
        filter: `user_id=eq.${session.user.id}`
      }, handleQueueUpdate)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'image_generation_results',
        filter: `id=neq.00000000-0000-0000-0000-000000000000` // any row
      }, handleResultInsert)
      .subscribe();
      
    console.log('Subscribed to queue updates');
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id]);
  
  // Handle queue status updates
  const handleQueueUpdate = useCallback((payload) => {
    console.log('Queue update:', payload);
    const { new: newRecord } = payload;
    
    // Update UI based on status changes
    setGeneratingImages(prev => prev.map(img => {
      // Match by queueId stored in the UI state
      if (img.queueId === newRecord.id) {
        return { 
          ...img, 
          status: newRecord.status,
          error: newRecord.error_message
        };
      }
      return img;
    }));
    
    // If failed, show error toast
    if (newRecord.status === 'failed') {
      toast.error(`Generation failed: ${newRecord.error_message || 'Unknown error'}`);
    }
  }, [setGeneratingImages]);
  
  // Handle new results
  const handleResultInsert = useCallback(async (payload) => {
    console.log('Result insert:', payload);
    const { new: newResult } = payload;
    
    // First check if this result belongs to the current user
    const { data: queueItem, error: queueError } = await supabase
      .from('image_generation_queue')
      .select('*')
      .eq('id', newResult.queue_id)
      .eq('user_id', session?.user?.id)
      .single();
      
    if (queueError || !queueItem) {
      console.log('Queue item not found or error:', queueError);
      return;
    }
    
    // Update UI with completed image
    setGeneratingImages(prev => prev.map(img => {
      if (img.queueId === queueItem.id) {
        return { 
          ...img, 
          status: 'completed', 
          imageUrl: newResult.image_url,
          user_image_id: newResult.user_image_id
        };
      }
      return img;
    }));
    
    toast.success('Image generated successfully!');
  }, [session?.user?.id, setGeneratingImages]);

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
      modelConfig: lockedModelConfig,
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

    setIsProcessing(true);
    
    try {
      // Add all requested images to the queue
      for (let i = 0; i < imageCount; i++) {
        const actualSeed = randomizeSeed ? generateRandomSeed() : (seed + i);
        const generationId = Date.now().toString() + i;
        
        // Get the modified prompt without risking a circular reference
        let modifiedPrompt;
        try {
          modifiedPrompt = await getModifiedPrompt(finalPrompt || prompt, generationStates.model, modelConfigs);
        } catch (error) {
          console.error('Error modifying prompt:', error);
          modifiedPrompt = finalPrompt || prompt; // Fallback to original prompt
        }
        
        // Create queue entry
        const queueId = uuidv4();
        const { data: queueData, error: queueError } = await supabase
          .from('image_generation_queue')
          .insert({
            id: queueId,
            user_id: session.user.id,
            prompt: modifiedPrompt,
            model: model,
            seed: actualSeed,
            width: finalWidth,
            height: finalHeight,
            quality: quality,
            aspect_ratio: finalAspectRatio,
            negative_prompt: negativePrompt,
            is_private: isPrivate,
            status: 'pending'
          })
          .select()
          .single();
          
        if (queueError) {
          console.error('Error adding to queue:', queueError);
          toast.error('Failed to add image to generation queue');
          continue;
        }
        
        console.log('Added to queue:', queueData);
        
        // Update UI state
        setGeneratingImages(prev => [...prev, {
          id: generationId,
          queueId: queueId,
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
      
      toast.success(`Added ${imageCount} image${imageCount > 1 ? 's' : ''} to generation queue`);
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to start image generation');
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    generateImage,
    isProcessing
  };
};
