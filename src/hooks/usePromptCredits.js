import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/supabase';

export const usePromptCredits = (userId) => {
  const queryClient = useQueryClient();

  const deductPromptCredits = async () => {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const creditCost = 1; // Fixed cost for prompt improvement

    const { data: profile } = await supabase
      .from('profiles')
      .select('credit_count, bonus_credits')
      .eq('id', userId)
      .single();

    if (!profile) throw new Error('Profile not found');

    const totalCredits = profile.credit_count + profile.bonus_credits;
    if (totalCredits < creditCost) return -1;

    let newCreditCount = profile.credit_count;
    let newBonusCredits = profile.bonus_credits;

    if (profile.credit_count >= creditCost) {
      newCreditCount -= creditCost;
    } else {
      const remainingCost = creditCost - profile.credit_count;
      newCreditCount = 0;
      newBonusCredits -= remainingCost;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        credit_count: newCreditCount,
        bonus_credits: newBonusCredits
      })
      .eq('id', userId);

    if (error) throw error;
    return { newCreditCount, newBonusCredits };
  };

  const mutation = useMutation({
    mutationKey: ['deductPromptCredits', userId],
    mutationFn: deductPromptCredits,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userCredits', userId] });
    },
  });

  return {
    deductCredits: () => {
      if (!userId) {
        throw new Error('User ID is required');
      }
      return mutation.mutate();
    },
    isDeducting: mutation.isPending,
    error: mutation.error
  };
}; 