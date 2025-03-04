
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/supabase';
import { toast } from 'sonner';

export const useLikes = (userId) => {
  const [userLikes, setUserLikes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setUserLikes([]);
      setIsLoading(false);
      return;
    }

    const fetchLikes = async () => {
      try {
        const { data, error } = await supabase
          .from('user_image_likes')
          .select('image_id')
          .eq('created_by', userId);

        if (error) throw error;
        setUserLikes(data.map(like => like.image_id));
      } catch (error) {
        console.error('Error fetching likes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLikes();

    // Set up realtime subscription for likes
    const channel = supabase
      .channel('likes-changes')
      .on('postgres_changes', 
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_image_likes',
          filter: `created_by=eq.${userId}`,
        }, 
        (payload) => {
          // Add new like
          setUserLikes(prev => [...prev, payload.new.image_id]);
        }
      )
      .on('postgres_changes', 
        {
          event: 'DELETE',
          schema: 'public',
          table: 'user_image_likes',
          filter: `created_by=eq.${userId}`,
        }, 
        (payload) => {
          // Remove like
          setUserLikes(prev => prev.filter(id => id !== payload.old.image_id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const toggleLike = async (imageId) => {
    if (!userId) {
      toast.error('Please sign in to like images');
      return;
    }

    try {
      const isLiked = userLikes.includes(imageId);

      if (isLiked) {
        // Unlike the image
        await supabase
          .from('user_image_likes')
          .delete()
          .eq('image_id', imageId)
          .eq('created_by', userId);
      } else {
        // Like the image
        await supabase
          .from('user_image_likes')
          .insert({
            image_id: imageId,
            user_id: userId,
            created_by: userId
          });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    }
  };

  return {
    userLikes,
    isLoading,
    toggleLike
  };
};
