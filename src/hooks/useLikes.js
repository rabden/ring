
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/supabase';
import { useEffect } from 'react';
import { toast } from 'sonner';

export const useLikes = (userId) => {
  const queryClient = useQueryClient();

  // Set up real-time subscription
  useEffect(() => {
    if (!userId) return;

    // Subscribe to changes in user_images table
    const subscription = supabase
      .channel('likes_channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_images',
        filter: `liked_by cs.{${userId}}`,
      }, () => {
        // Invalidate and refetch when changes occur
        queryClient.invalidateQueries(['likes', userId]);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId, queryClient]);

  const { data: userLikes = [] } = useQuery({
    queryKey: ['likes', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('user_images')
        .select('id')
        .filter('liked_by', 'cs', `{${userId}}`);
      
      if (error) {
        console.error("Error fetching likes:", error);
        return [];
      }
      return data.map(image => image.id);
    },
    enabled: !!userId
  });

  const toggleLike = useMutation({
    mutationFn: async (imageId) => {
      if (!userId) {
        toast.error('Please sign in to like images');
        return null;
      }
      
      try {
        // Get current image data to check if already liked
        const { data: imageData, error: getError } = await supabase
          .from('user_images')
          .select('liked_by, user_id, storage_path')
          .eq('id', imageId)
          .single();
        
        if (getError) throw getError;
        
        const isLiked = imageData.liked_by && imageData.liked_by.includes(userId);
        let updatedLikedBy;
        
        if (isLiked) {
          // Remove user from liked_by array
          updatedLikedBy = (imageData.liked_by || []).filter(id => id !== userId);
        } else {
          // Add user to liked_by array
          updatedLikedBy = [...(imageData.liked_by || []), userId];
          
          // Only create notification if this is a new like (not an unlike)
          if (imageData.user_id && imageData.user_id !== userId) {
            // Get current user's profile
            const { data: userProfile } = await supabase
              .from('profiles')
              .select('display_name, avatar_url')
              .eq('id', userId)
              .single();

            // Create notification for the image owner
            const { error: notificationError } = await supabase
              .from('notifications')
              .insert([{
                user_id: imageData.user_id,
                title: 'New Like',
                message: `${userProfile?.display_name || 'Someone'} liked your image`,
                image_url: supabase.storage.from('user-images').getPublicUrl(imageData.storage_path).data.publicUrl,
                link: `/profile/${userId}`,
                link_names: 'View Profile'
              }]);
            
            if (notificationError) console.error("Failed to create notification:", notificationError);
          }
        }
        
        // Update the liked_by array
        const { error } = await supabase
          .from('user_images')
          .update({ liked_by: updatedLikedBy })
          .eq('id', imageId);
          
        if (error) throw error;
        
        return { imageId, liked: !isLiked };
      } catch (error) {
        console.error("Error in toggleLike:", error);
        toast.error("Failed to update like status");
        throw error;
      }
    },
    onSuccess: (result) => {
      if (result) {
        queryClient.invalidateQueries(['likes', userId]);
      }
    },
    onError: (error) => {
      console.error("Error toggling like:", error);
    }
  });

  return {
    userLikes,
    toggleLike: toggleLike.mutate,
    isLoading: toggleLike.isLoading
  };
};
