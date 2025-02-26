import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/supabase';

export const useProRequest = (userId) => {
  return useQuery({
    queryKey: ['proRequest', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('is_pro_request')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data?.is_pro_request || false;
    },
    enabled: !!userId
  });
};