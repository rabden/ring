
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/supabase';

export const useProTrialStatus = (userId) => {
  return useQuery({
    queryKey: ['proTrialStatus', userId],
    queryFn: async () => {
      if (!userId) return { canUseTrial: false, isProTrialUsed: false };
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_pro, pro_trial_used')
          .eq('id', userId)
          .single();
          
        if (error) {
          console.error('Error fetching pro trial status:', error);
          return { canUseTrial: false, isProTrialUsed: false };
        }
        
        return {
          canUseTrial: !data.is_pro && !data.pro_trial_used,
          isProTrialUsed: data.pro_trial_used || false,
          isPro: data.is_pro || false
        };
      } catch (err) {
        console.error('Error in useProTrialStatus:', err);
        return { canUseTrial: false, isProTrialUsed: false };
      }
    },
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
    retry: 2
  });
};
