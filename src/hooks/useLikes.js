
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
          .select('liked_by, user_id, storage_path, like_count')
          .eq('id', imageId)
          .single();
        
        if (getError) throw getError;
        
        const currentLikedBy = imageData.liked_by || [];
        const isLiked = currentLikedBy.includes(userId);
        let updatedLikedBy;
        let updatedLikeCount = imageData.like_count || 0;
        
        if (isLiked) {
          // Remove user from liked_by array
          updatedLikedBy = currentLikedBy.filter(id => id !== userId);
          updatedLikeCount = Math.max(0, updatedLikeCount - 1);
        } else {
          // Add user to liked_by array
          updatedLikedBy = [...currentLikedBy, userId];
          updatedLikeCount = updatedLikeCount + 1;
          
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
        
        // Update the liked_by array and like_count
        const { error } = await supabase
          .from('user_images')
          .update({ 
            liked_by: updatedLikedBy,
            like_count: updatedLikeCount
          })
          .eq('id', imageId);
          
        if (error) throw error;
        
        return { imageId, liked: !isLiked, likeCount: updatedLikeCount };
      } catch (error) {
        console.error("Error in toggleLike:", error);
        toast.error("Failed to update like status");
        throw error;
      }
    },
    onSuccess: (result) => {
      if (result) {
        queryClient.invalidateQueries(['likes', userId]);
        
        // Update the image in the cache to reflect the new like status
        queryClient.setQueryData(['galleryImages'], (oldData) => {
          if (!oldData) return oldData;
          
          return {
            ...oldData,
            pages: oldData.pages.map(page => ({
              ...page,
              data: page.data.map(image => 
                image.id === result.imageId 
                  ? { ...image, like_count: result.likeCount } 
                  : image
              )
            }))
          };
        });
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
