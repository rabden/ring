
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/supabase';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';

export const useImagePrivacy = (imageId) => {
  const queryClient = useQueryClient();

  const callback = (payload) => {
    console.log('Image privacy realtime update:', payload);
    queryClient.invalidateQueries({ queryKey: ['imagePrivacy', imageId] });
  };

  useRealtimeSubscription(
    'user_images',
    imageId ? `id=eq.${imageId}` : null,
    callback,
    {
      queryKeys: [['imagePrivacy', imageId]]
    }
  );

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
