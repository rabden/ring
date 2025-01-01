import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/supabase';

export const useFollowCounts = (userId) => {
  const { data, isLoading } = useQuery({
    queryKey: ['followCounts', userId],
    queryFn: async () => {
      const [followersResult, followingResult] = await Promise.all([
        supabase
          .from('user_follows')
          .select('*', { count: 'exact' })
          .eq('following_id', userId),
        supabase
          .from('user_follows')
          .select('*', { count: 'exact' })
          .eq('follower_id', userId)
      ]);

      return {
        followersCount: followersResult.count || 0,
        followingCount: followingResult.count || 0
      };
    },
    enabled: !!userId
  });

  return {
    followersCount: data?.followersCount || 0,
    followingCount: data?.followingCount || 0,
    isLoading
  };
};