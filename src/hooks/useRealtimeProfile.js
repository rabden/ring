
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

    const channel = supabase
      .channel(`profile-changes-${userId}-${Date.now()}`) // Unique channel name
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

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [userId, queryClient]);
};
