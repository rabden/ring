import { useEffect, useRef } from 'react';
import { useRealtimeManager } from '@/contexts/RealtimeManagerContext';

export const useRealtimeSubscription = (table, filter, callback, options = {}) => {
  const { subscribe, unsubscribe, isReady } = useRealtimeManager();
  const subscriptionKeyRef = useRef(null);
  const callbackRef = useRef(callback);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!isReady || !table) return;

    const wrappedCallback = (...args) => {
      if (callbackRef.current) {
        callbackRef.current(...args);
      }
    };

    subscriptionKeyRef.current = subscribe(table, filter, wrappedCallback, options);

    return () => {
      if (subscriptionKeyRef.current) {
        unsubscribe(subscriptionKeyRef.current, wrappedCallback);
        subscriptionKeyRef.current = null;
      }
    };
  }, [table, filter, subscribe, unsubscribe, isReady, options.queryKeys?.join(',')]);

  return { isReady };
};
