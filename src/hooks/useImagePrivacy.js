import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/supabase';
import { useEffect } from 'react';

export const useImagePrivacy = (imageId) => {
  const queryClient = useQueryClient();

  // Set up real-time subscription
  useEffect(() => {
    if (!imageId) return;

    const subscription = supabase
      .channel('image_privacy_channel')
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

    return () => {
      subscription.unsubscribe();
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