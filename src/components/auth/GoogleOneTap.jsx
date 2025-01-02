import React, { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/supabase';
import { toast } from 'sonner';

const GoogleOneTap = () => {
  useEffect(() => {
    const loadGoogleScript = () => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      script.onload = () => {
        if (window.google) {
          window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: true,
            cancel_on_tap_outside: false,
          });

          window.google.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
              console.log('One Tap was not displayed or was skipped');
            }
          });
        }
      };
    };

    const handleCredentialResponse = async (response) => {
      try {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: response.credential,
        });

        if (error) throw error;
        
        toast.success('Welcome back!');
      } catch (error) {
        console.error('Error signing in with Google:', error);
        toast.error(error.message || 'Failed to sign in with Google');
      }
    };

    // Only load if not in iframe/puppeteer
    try {
      const isIframe = window.self !== window.top;
      const isPuppeteer = navigator.userAgent.includes('puppeteer');
      if (!isIframe && !isPuppeteer) {
        loadGoogleScript();
      }
    } catch (e) {
      console.log('Likely in iframe, skipping Google One Tap');
    }

    return () => {
      // Cleanup Google One Tap
      const script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (script) {
        script.remove();
      }
      // Remove the Google One Tap iframe
      const iframe = document.querySelector('iframe[src^="https://accounts.google.com/gsi/"]');
      if (iframe) {
        iframe.remove();
      }
    };
  }, []);

  return null;
};

export default GoogleOneTap;