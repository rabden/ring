
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

// Add console logs for debugging
console.log('Creating Supabase client with URL:', supabaseUrl ? `${supabaseUrl.substring(0, 15)}...` : 'undefined');
console.log('API key present:', supabaseKey ? 'Yes' : 'No');

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase configuration is missing. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: customStorageAdapter,
    storageKey: 'sb-auth-token',
    flowType: 'pkce',
    debug: true // Enable debug logs for authentication issues
  }
});

// Export a function to check if the API key table exists and has valid keys
export const checkHuggingFaceApiKeys = async () => {
  try {
    const { data, error, count } = await supabase
      .from('huggingface_api_keys')
      .select('*', { count: 'exact' })
      .eq('is_active', true);
    
    if (error) {
      console.error('Error checking HuggingFace API keys:', error);
      return { valid: false, error: error.message };
    }
    
    return { 
      valid: count > 0, 
      count,
      message: count > 0 ? `Found ${count} active API keys` : 'No active API keys found'
    };
  } catch (e) {
    console.error('Exception checking HuggingFace API keys:', e);
    return { valid: false, error: e.message };
  }
};
