
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Check, Crown, Zap, Palette, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/supabase';
import { toast } from "sonner";
import { useQueryClient } from '@tanstack/react-query';

const ProUpgradeModal = ({ isOpen, onOpenChange, userId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const queryClient = useQueryClient();

  const benefits = [
    {
      icon: Zap,
      title: "2x Daily Credits",
      description: "Get 50 credits daily instead of 25"
    },
    {
      icon: Palette,
      title: "Unlocked Aspect Ratios",
      description: "Access all aspect ratio options"
    },
    {
      icon: Clock,
      title: "Faster Generations",
      description: "Priority processing for your images"
    },
    {
      icon: Crown,
      title: "Pro Badge",
      description: "Show off your Pro status"
    }
  ];

  const handleStartTrial = async () => {
    setIsLoading(true);
    try {
      // Calculate end time (30 days from now)
      const endTime = new Date();
      endTime.setDate(endTime.getDate() + 30);

      // Create trial record
      const { error: trialError } = await supabase
        .from('pro_trials')
        .insert({
          user_id: userId,
          end_time: endTime.toISOString()
        });

      if (trialError) throw trialError;

      // Update user to pro status
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ is_pro: true })
        .eq('id', userId);

      if (profileError) throw profileError;

      setIsActivated(true);
      toast.success("Pro trial activated! Enjoy 30 days of Pro features.");
      
      // Invalidate queries to refresh pro status
      queryClient.invalidateQueries(['proUser', userId]);
      queryClient.invalidateQueries(['profile', userId]);
      
      setTimeout(() => {
        onOpenChange(false);
      }, 2000);

    } catch (error) {
      console.error('Error activating pro trial:', error);
      toast.error("Failed to activate pro trial. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const content = (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Crown className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-primary">
          Upgrade to Pro
        </h2>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-center">Pro Benefits:</h3>
        <div className="grid gap-3">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <benefit.icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-sm">{benefit.title}</h4>
                <p className="text-xs text-muted-foreground">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
        <p className="text-center font-medium text-sm">
          🎉 <span className="text-primary">
            Enjoy a month of free Pro subscription!
          </span>
        </p>
        <p className="text-center text-xs text-muted-foreground mt-1">
          No need to add any payment details, just enroll
        </p>
      </div>
    </div>
  );

  const actionButton = (
    <Button 
      onClick={handleStartTrial}
      disabled={isLoading || isActivated}
      className="w-full"
    >
      {isActivated ? (
        <>
          <Check className="w-4 h-4 mr-2" />
          Subscription Started
        </>
      ) : isLoading ? (
        "Starting Trial..."
      ) : (
        "Start Pro Subscription"
      )}
    </Button>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader>
            <DrawerTitle className="sr-only">Upgrade to Pro</DrawerTitle>
          </DrawerHeader>
          <ScrollArea className="flex-1 px-4">
            {content}
          </ScrollArea>
          <DrawerFooter className="pt-4">
            {actionButton}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="sr-only">Upgrade to Pro</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 pr-4">
          {content}
        </ScrollArea>
        <div className="pt-4">
          {actionButton}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProUpgradeModal;
