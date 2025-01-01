import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Zap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/supabase';
import { useSupabaseAuth } from '@/integrations/supabase/auth';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const CreditCounter = ({ credits, bonusCredits, className }) => {
  const MAX_CREDITS = 50;
  const creditsProgress = (credits / MAX_CREDITS) * 100;
  const { session } = useSupabaseAuth();

  const { data: profile } = useQuery({
    queryKey: ['profile-refill', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('last_refill_time')
        .eq('id', session.user.id)
        .single();
      return data;
    },
    enabled: !!session?.user?.id
  });

  const getHoursUntilRefill = () => {
    if (!profile?.last_refill_time) return 24;
    const lastRefill = new Date(profile.last_refill_time);
    const now = new Date();
    const nextRefill = new Date(lastRefill);
    nextRefill.setHours(nextRefill.getHours() + 24);
    const hoursRemaining = Math.ceil((nextRefill - now) / (1000 * 60 * 60));
    return Math.max(0, Math.min(24, hoursRemaining));
  };

  const hoursRemaining = getHoursUntilRefill();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("space-y-0.5 w-full", className)}>
            <div className="flex justify-between text-xs items-center px-1">
              <span className="text-muted-foreground">daily credits</span>
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                <span>{credits}/{MAX_CREDITS} remaining</span>
                {bonusCredits > 0 && (
                  <>
                    <span className="mx-1">+</span>
                    <Zap className="w-3 h-3" />
                    <span className="text-green-500">B{bonusCredits}</span>
                  </>
                )}
              </div>
            </div>
            <Progress value={creditsProgress} className="h-2 bg-destructive/25" />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{hoursRemaining} hours remaining until refill</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CreditCounter;