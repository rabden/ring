
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/supabase';
import { useSupabaseAuth } from '@/integrations/supabase/auth';

export const useIsAdmin = () => {
  const { session } = useSupabaseAuth();

  const { data: userProfile, isLoading } = useQuery({
    queryKey: ['userProfile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!session?.user?.id
  });

  return {
    isAdmin: userProfile?.is_admin || false,
    isLoading
  };
};
