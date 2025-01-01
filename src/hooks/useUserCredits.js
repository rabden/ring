import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/supabase';

export const useUserCredits = (userId) => {
  const queryClient = useQueryClient();

  const fetchCredits = async () => {
    if (!userId) return { credit_count: 0, bonus_credits: 0, last_refill_time: null };
    
    const { data, error } = await supabase
      .from('profiles')
      .select('credit_count, bonus_credits, last_refill_time')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  };

  const updateCredits = async ({ quality, imageCount = 1 }) => {
    let creditCost;
    
    if (typeof quality === 'string') {
      // Handle quality-based cost for image generation
      creditCost = {
        "HD": 1,
        "HD+": 2,
        "4K": 3
      }[quality] * imageCount;
    } else {
      // Handle direct credit cost (for prompt improvement)
      creditCost = quality;
    }

    if (!creditCost) throw new Error('Invalid credit cost');

    const { data: profile } = await supabase
      .from('profiles')
      .select('credit_count, bonus_credits')
      .eq('id', userId)
      .single();

    if (!profile) throw new Error('Profile not found');

    // Check if user has enough credits
    const totalCredits = profile.credit_count + profile.bonus_credits;
    if (totalCredits < creditCost) return -1;

    let newCreditCount = profile.credit_count;
    let newBonusCredits = profile.bonus_credits;

    // For deduction, use regular credits first, then bonus credits
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
    return newCreditCount + newBonusCredits;
  };

  const addBonusCredits = async (amount) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        bonus_credits: supabase.raw(`bonus_credits + ${amount}`)
      })
      .eq('id', userId)
      .select('bonus_credits')
      .single();

    if (error) throw error;
    return data.bonus_credits;
  };

  const { data: creditsData, isLoading, error } = useQuery({
    queryKey: ['userCredits', userId],
    queryFn: fetchCredits,
    enabled: Boolean(userId),
    refetchInterval: 60000,
    initialData: { credit_count: 0, bonus_credits: 0, last_refill_time: null }
  });

  const updateCreditsMutation = useMutation({
    mutationFn: updateCredits,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userCredits', userId] });
    },
  });

  const addBonusCreditsMutation = useMutation({
    mutationFn: addBonusCredits,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userCredits', userId] });
    },
  });

  return {
    credits: creditsData?.credit_count ?? 0,
    bonusCredits: creditsData?.bonus_credits ?? 0,
    totalCredits: (creditsData?.credit_count ?? 0) + (creditsData?.bonus_credits ?? 0),
    lastRefillTime: creditsData?.last_refill_time,
    isLoading,
    error,
    updateCredits: updateCreditsMutation.mutate,
    addBonusCredits: addBonusCreditsMutation.mutate,
  };
};