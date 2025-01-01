import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_PROJECT_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_API_KEY;

// Configure session storage
const customStorageAdapter = {
  getItem: (key) => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error retrieving from storage:', error);
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error setting storage:', error);
    }
  },
  removeItem: (key) => {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from storage:', error);
    }
  }
};

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: customStorageAdapter,
    storageKey: 'sb-auth-token',
    flowType: 'pkce',
    debug: import.meta.env.DEV // Enable debug logs in development
  }
});