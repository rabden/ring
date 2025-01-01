import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/supabase';
import { cn } from '@/lib/utils';

const FollowStats = ({ userId, className }) => {
  const { data: stats = { followers: 0, following: 0 } } = useQuery({
    queryKey: ['followStats', userId],
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
        followers: followersResult.count || 0,
        following: followingResult.count || 0
      };
    },
    enabled: !!userId
  });

  return (
    <div className={cn("grid grid-cols-2", className)}>
      <div className="text-center">
        <span className="block text-sm font-medium text-foreground">{stats.followers}</span>
        <span className="text-xs text-muted-foreground/80">Followers</span>
      </div>
      <div className="text-center">
        <span className="block text-sm font-medium text-foreground">{stats.following}</span>
        <span className="text-xs text-muted-foreground/80">Following</span>
      </div>
    </div>
  );
};

export default FollowStats;