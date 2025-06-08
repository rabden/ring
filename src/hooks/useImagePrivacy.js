
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/supabase';
import { useEffect, useRef } from 'react';

export const useImagePrivacy = (imageId) => {
  const queryClient = useQueryClient();
  const subscriptionRef = useRef(null);

  // Set up real-time subscription with proper cleanup
  useEffect(() => {
    if (!imageId) return;

    // Clean up existing subscription if it exists
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }

    const subscription = supabase
      .channel(`image_privacy_${imageId}_${Date.now()}`) // Unique channel name
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_images',
        filter: `id=eq.${imageId}`,
      }, () => {
        // Invalidate and refetch when changes occur
        queryClient.invalidateQueries(['imagePrivacy', imageId]);
      })
      .subscribe();

    subscriptionRef.current = subscription;

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [imageId, queryClient]);

  const { data: isPrivate } = useQuery({
    queryKey: ['imagePrivacy', imageId],
    queryFn: async () => {
      if (!imageId) return false;
      const { data, error } = await supabase
        .from('user_images')
        .select('is_private')
        .eq('id', imageId)
        .single();
      
      if (error) throw error;
      return data?.is_private || false;
    },
    enabled: !!imageId
  });

  const togglePrivacy = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('user_images')
        .update({ is_private: !isPrivate })
        .eq('id', imageId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['imagePrivacy', imageId]);
    }
  });

  return {
    isPrivate: isPrivate || false,
    togglePrivacy: togglePrivacy.mutate
  };
}; 
