import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { Loader } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { cn } from "@/lib/utils";
import { EmailAuthForm } from './EmailAuthForm';

export const AuthUI = ({ buttonText }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    // Check if page is in an iframe or being rendered by puppeteer
    try {
      const isIframe = window.self !== window.top;
      const isPuppeteer = navigator.userAgent.includes('puppeteer');
      setIsInIframe(isIframe || isPuppeteer);
    } catch (e) {
      setIsInIframe(true);
    }
  }, []);

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in with Google:', error.message);
      setError(error.message || 'Failed to sign in with Google');
      toast.error(error.message || 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-3 flex flex-col items-center">
      {isInIframe ? (
        <div className="max-w-[300px] w-full mx-auto">
          <EmailAuthForm />
        </div>
      ) : (
        <Button
          className={cn(
            "w-auto h-8 md:h-10",
            "rounded-full text-sm md:text-base",
            "bg-primary hover:bg-zinc-50 text-black", 
            "border border-border/80",
            "shadow-[0_8px_30px_rgb(0,0,0,0.06)]",
            "backdrop-blur-[2px]",
            "transition-all duration-300",
            "hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]",
            "hover:border-border/20",
            "disabled:opacity-70"
          )}
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader className={cn(
              "mr-2 h-4 w-4 md:h-5 md:w-5",
              "animate-spin text-foreground/70"
            )} />
          ) : (
            <FcGoogle className="mr-2 h-5 w-5 md:h-6 md:w-6" />
          )}
          {buttonText || "Continue with Google"}
        </Button>
      )}

      {error && (
        <div className={cn(
          "p-3 rounded-lg",
          "bg-destructive/5 text-destructive/90",
          "text-xs md:text-sm text-center",
          "border border-destructive/10",
          "transition-all duration-200"
        )}>
          {error}
        </div>
      )}
    </div>
  );
};