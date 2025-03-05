
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/supabase';
import { useSupabaseAuth } from '@/integrations/supabase/auth';

const GeneratingImagesContext = createContext();

export const GeneratingImagesProvider = ({ children }) => {
  const [generatingImages, setGeneratingImages] = useState([]);
  const { session } = useSupabaseAuth();
  
  // Load active generations on initial load
  useEffect(() => {
    if (!session?.user?.id) return;
    
    const loadActiveGenerations = async () => {
      // Get active queue items
      const { data: queueItems, error } = await supabase
        .from('image_generation_queue')
        .select(`
          id,
          prompt,
          model,
          seed,
          width,
          height,
          quality,
          aspect_ratio,
          negative_prompt,
          status,
          created_at,
          is_private,
          error_message
        `)
        .eq('user_id', session.user.id)
        .in('status', ['pending', 'processing'])
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching queue:', error);
        return;
      }
      
      // Get any completed results for these items
      const queueIds = queueItems.map(item => item.id);
      if (queueIds.length === 0) return;
      
      const { data: results, error: resultsError } = await supabase
        .from('image_generation_results')
        .select('*')
        .in('queue_id', queueIds);
        
      if (resultsError) {
        console.error('Error fetching results:', resultsError);
      }
      
      // Map results to queue items
      const resultsByQueueId = (results || []).reduce((acc, result) => {
        acc[result.queue_id] = result;
        return acc;
      }, {});
      
      // Create UI state
      const activeGenerations = queueItems.map(item => ({
        id: Date.now().toString() + Math.random().toString().substr(2, 5),
        queueId: item.id,
        prompt: item.prompt,
        seed: item.seed,
        width: item.width,
        height: item.height,
        status: item.status,
        error: item.error_message,
        isPrivate: item.is_private,
        model: item.model,
        quality: item.quality,
        aspect_ratio: item.aspect_ratio,
        imageUrl: resultsByQueueId[item.id]?.image_url,
        user_image_id: resultsByQueueId[item.id]?.user_image_id
      }));
      
      setGeneratingImages(activeGenerations);
    };
    
    loadActiveGenerations();
  }, [session?.user?.id]);

  // Add auto-removal of completed images after 10 seconds
  useEffect(() => {
    const completedImages = generatingImages.filter(img => img.status === 'completed');
    
    if (completedImages.length > 0) {
      const timeouts = completedImages.map(img => {
        return setTimeout(() => {
          setGeneratingImages(prev => prev.filter(i => i.id !== img.id));
        }, 10000); // 10 seconds
      });

      // Cleanup timeouts
      return () => {
        timeouts.forEach(timeout => clearTimeout(timeout));
      };
    }
  }, [generatingImages]);

  const cancelGeneration = async (imageId) => {
    // Find the corresponding image entry
    const imageToCancel = generatingImages.find(img => img.id === imageId);
    if (!imageToCancel?.queueId) return;
    
    // Update the queue entry status
    const { error } = await supabase
      .from('image_generation_queue')
      .update({ status: 'cancelled' })
      .eq('id', imageToCancel.queueId)
      .eq('user_id', session?.user?.id);
      
    if (error) {
      console.error('Error cancelling generation:', error);
      toast.error('Failed to cancel generation');
      return;
    }
    
    // Update local state
    setGeneratingImages(prev => prev.filter(img => img.id !== imageId));
  };

  const value = {
    generatingImages,
    setGeneratingImages,
    cancelGeneration
  };

  return (
    <GeneratingImagesContext.Provider value={value}>
      {children}
    </GeneratingImagesContext.Provider>
  );
};

export const useGeneratingImages = () => {
  const context = useContext(GeneratingImagesContext);
  if (context === undefined) {
    throw new Error('useGeneratingImages must be used within a GeneratingImagesProvider');
  }
  return context;
};
