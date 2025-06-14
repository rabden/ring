
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/supabase';
import { useEffect, useRef } from 'react';

export const useImagePrivacy = (imageId) => {
  const queryClient = useQueryClient();
  const channelRef = useRef(null);

  // Set up real-time subscription
  useEffect(() => {
    if (!imageId) return;

    // Clean up existing channel if it exists
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Create unique channel name
    const channelName = `image-privacy-${imageId}-${Date.now()}`;

    const subscription = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_images',
        filter: `id=eq.${imageId}`,
      }, (payload) => {
        console.log('Image privacy realtime update:', payload);
        // Invalidate and refetch when changes occur
        queryClient.invalidateQueries({ queryKey: ['imagePrivacy', imageId] });
      })
      .subscribe();

    channelRef.current = subscription;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
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
      queryClient.invalidateQueries({ queryKey: ['imagePrivacy', imageId] });
    }
  });

  return {
    isPrivate: isPrivate || false,
    togglePrivacy: togglePrivacy.mutate
  };
}; 
