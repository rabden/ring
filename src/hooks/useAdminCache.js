
import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/supabase';

const ADMIN_CACHE_KEY = 'cached_admin_status';

export const useAdminCache = (userId) => {
  const queryClient = useQueryClient();

  // First check localStorage for cached status
  const getCachedStatus = () => {
    try {
      const cached = localStorage.getItem(ADMIN_CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error reading admin cache:', error);
      return null;
    }
  };

  const { data: isAdmin = getCachedStatus() } = useQuery({
    queryKey: ['admin_status', userId],
    queryFn: async () => {
      if (!userId) return false;
      const { data } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .single();
      
      // Cache the result
      if (data?.is_admin !== undefined) {
        localStorage.setItem(ADMIN_CACHE_KEY, JSON.stringify(data.is_admin));
      }
      
      return data?.is_admin || false;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    cacheTime: 1000 * 60 * 30, // Keep in memory for 30 minutes
  });

  // Clear cache on logout
  useEffect(() => {
    if (!userId) {
      localStorage.removeItem(ADMIN_CACHE_KEY);
      queryClient.removeQueries(['admin_status']);
    }
  }, [userId, queryClient]);

  return { isAdmin: isAdmin || false };
};
