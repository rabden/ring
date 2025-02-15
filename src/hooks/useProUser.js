import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/supabase';

export const useProUser = (userId) => {
  return useQuery({
    queryKey: ['proUser', userId],
    queryFn: async () => {
      if (!userId) return false;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_pro')
          .eq('id', userId)
          .single();
          
        if (error) {
          console.error('Error fetching pro status:', error);
          return false;
        }
        
        return data?.is_pro || false;
      } catch (err) {
        console.error('Error in useProUser:', err);
        return false;
      }
    },
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
    retry: 2
  });
};