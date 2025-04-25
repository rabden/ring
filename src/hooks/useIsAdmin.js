
import { useSupabaseAuth } from '@/integrations/supabase/auth';
import { useAdminCache } from './useAdminCache';

export const useIsAdmin = () => {
  const { session } = useSupabaseAuth();
  const { isAdmin } = useAdminCache(session?.user?.id);
  
  return { isAdmin };
};
