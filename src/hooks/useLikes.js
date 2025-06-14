
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/supabase';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { toast } from 'sonner';

export const useLikes = (userId) => {
  const queryClient = useQueryClient();

  const callback = (payload) => {
    console.log('Likes realtime update:', payload);
    queryClient.invalidateQueries({ queryKey: ['likes', userId] });
  };

  useRealtimeSubscription(
    'user_images',
    userId ? `liked_by.cs.{${userId}}` : null,
    callback,
    {
      queryKeys: [['likes', userId]]
    }
  );

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
      
      console.log(`Attempting to toggle like for image ${imageId} by user ${userId}`);
      
      try {
        // Get current image data to check if already liked
        const { data: imageData, error: getError } = await supabase
          .from('user_images')
          .select('liked_by, user_id, storage_path, like_count')
          .eq('id', imageId)
          .single();
        
        if (getError) {
          console.error("Error fetching image data:", getError);
          throw getError;
        }
        
        console.log("Image data fetched:", imageData);
        
        // Ensure we have valid arrays and numbers
        const currentLikedBy = Array.isArray(imageData.liked_by) ? imageData.liked_by : [];
        const isLiked = currentLikedBy.includes(userId);
        
        // Make sure like_count is a number (not null)
        let updatedLikeCount = typeof imageData.like_count === 'number' ? imageData.like_count : 0;
        let updatedLikedBy;
        
        console.log(`Current like status: ${isLiked ? 'Liked' : 'Not liked'}`);
        console.log(`Current liked_by array:`, currentLikedBy);
        console.log(`Current like_count:`, updatedLikeCount);
        
        if (isLiked) {
          // Remove user from liked_by array
          updatedLikedBy = currentLikedBy.filter(id => id !== userId);
          updatedLikeCount = Math.max(0, updatedLikeCount - 1);
          console.log(`Removing user ${userId} from liked_by`);
          console.log(`Updated liked_by array:`, updatedLikedBy);
          console.log(`Updated like_count:`, updatedLikeCount);
        } else {
          // Add user to liked_by array
          updatedLikedBy = [...currentLikedBy, userId];
          updatedLikeCount = updatedLikeCount + 1;
          console.log(`Adding user ${userId} to liked_by`);
          console.log(`Updated liked_by array:`, updatedLikedBy);
          console.log(`Updated like_count:`, updatedLikeCount);
          
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
        
        // We now have database triggers that ensure liked_by is an array and like_count matches,
        // but we'll still be explicit here to prevent any issues
        const updateData = {
          liked_by: updatedLikedBy,
          like_count: updatedLikeCount
        };
        
        console.log(`Updating image ${imageId} with new data:`, updateData);
        
        const { error } = await supabase
          .from('user_images')
          .update(updateData)
          .eq('id', imageId);
          
        if (error) {
          console.error("Error updating like status:", error);
          throw error;
        }
        
        console.log(`Like status updated successfully`);
        return { imageId, liked: !isLiked, likeCount: updatedLikeCount };
      } catch (error) {
        console.error("Error in toggleLike:", error);
        toast.error("Failed to update like status");
        throw error;
      }
    },
    onSuccess: (result) => {
      if (result) {
        console.log(`Like toggle success:`, result);
        queryClient.invalidateQueries({
          queryKey: ['likes', userId]
        });
        
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
