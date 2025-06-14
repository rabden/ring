
import React, { createContext, useContext, useRef, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/supabase';
import { useQueryClient } from '@tanstack/react-query';

const RealtimeManagerContext = createContext();

export const RealtimeManagerProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const subscriptionsRef = useRef(new Map());
  const channelsRef = useRef(new Map());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
    
    return () => {
      // Cleanup all channels on unmount
      channelsRef.current.forEach((channel) => {
        supabase.removeChannel(channel);
      });
      channelsRef.current.clear();
      subscriptionsRef.current.clear();
    };
  }, []);

  const createSubscriptionKey = (table, filter = '') => {
    return `${table}:${filter}`;
  };

  const subscribe = (table, filter, callback, options = {}) => {
    if (!isReady) return null;

    const subscriptionKey = createSubscriptionKey(table, filter);
    
    // Check if subscription already exists
    if (subscriptionsRef.current.has(subscriptionKey)) {
      console.log(`Reusing existing subscription for ${subscriptionKey}`);
      const existingSubscription = subscriptionsRef.current.get(subscriptionKey);
      existingSubscription.callbacks.add(callback);
      return subscriptionKey;
    }

    console.log(`Creating new subscription for ${subscriptionKey}`);

    // Create unique channel name
    const channelName = `${table}-${filter}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: table,
        filter: filter || undefined
      }, (payload) => {
        console.log(`Realtime update for ${subscriptionKey}:`, payload);
        
        // Call all registered callbacks
        const subscription = subscriptionsRef.current.get(subscriptionKey);
        if (subscription) {
          subscription.callbacks.forEach(cb => {
            try {
              cb(payload);
            } catch (error) {
              console.error('Error in realtime callback:', error);
            }
          });
        }

        // Invalidate relevant queries
        if (options.queryKeys) {
          options.queryKeys.forEach(queryKey => {
            queryClient.invalidateQueries({ queryKey });
          });
        }
      })
      .subscribe();

    // Store subscription info
    subscriptionsRef.current.set(subscriptionKey, {
      channel,
      callbacks: new Set([callback]),
      table,
      filter
    });
    
    channelsRef.current.set(subscriptionKey, channel);

    return subscriptionKey;
  };

  const unsubscribe = (subscriptionKey, callback) => {
    const subscription = subscriptionsRef.current.get(subscriptionKey);
    if (!subscription) return;

    // Remove callback
    subscription.callbacks.delete(callback);

    // If no more callbacks, remove the entire subscription
    if (subscription.callbacks.size === 0) {
      console.log(`Removing subscription for ${subscriptionKey}`);
      supabase.removeChannel(subscription.channel);
      subscriptionsRef.current.delete(subscriptionKey);
      channelsRef.current.delete(subscriptionKey);
    }
  };

  const value = {
    subscribe,
    unsubscribe,
    isReady
  };

  return (
    <RealtimeManagerContext.Provider value={value}>
      {children}
    </RealtimeManagerContext.Provider>
  );
};

export const useRealtimeManager = () => {
  const context = useContext(RealtimeManagerContext);
  if (!context) {
    throw new Error('useRealtimeManager must be used within a RealtimeManagerProvider');
  }
  return context;
};
