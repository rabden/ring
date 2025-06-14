
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { useQueryClient } from '@tanstack/react-query';

export const useRealtimeProfile = (userId) => {
  const queryClient = useQueryClient();

  const callback = (payload) => {
    console.log('Profile realtime update:', payload);
    queryClient.invalidateQueries({ queryKey: ['user', userId] });
    queryClient.invalidateQueries({ queryKey: ['proUser', userId] });
    queryClient.invalidateQueries({ queryKey: ['proRequest', userId] });
  };

  useRealtimeSubscription(
    'profiles',
    userId ? `id=eq.${userId}` : null,
    callback,
    {
      queryKeys: [
        ['user', userId],
        ['proUser', userId],
        ['proRequest', userId]
      ]
    }
  );
};
