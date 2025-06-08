
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/supabase';
import { useQueryClient } from '@tanstack/react-query';

export const useRealtimeProfile = (userId) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    // Create a unique channel name per user to avoid conflicts
    const channelName = `profile-changes-${userId}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`
        },
        (payload) => {
          queryClient.invalidateQueries(['user', userId]);
          queryClient.invalidateQueries(['proUser', userId]);
          queryClient.invalidateQueries(['proRequest', userId]);
        }
      )
      .subscribe();

    return () => {
      // Properly unsubscribe and remove the channel
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);
};
