
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/supabase';
import { useQueryClient } from '@tanstack/react-query';

export const useRealtimeProfile = (userId) => {
  const queryClient = useQueryClient();
  const channelRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    // Clean up existing channel if it exists
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Create unique channel name
    const channelName = `profile-changes-${userId}-${Date.now()}`;
    
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
          console.log('Profile realtime update:', payload);
          queryClient.invalidateQueries({ queryKey: ['user', userId] });
          queryClient.invalidateQueries({ queryKey: ['proUser', userId] });
          queryClient.invalidateQueries({ queryKey: ['proRequest', userId] });
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [userId, queryClient]);
};
