
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
    console.log('Checking HuggingFace API keys in Supabase...');
    const { data, error, count } = await supabase
      .from('huggingface_api_keys')
      .select('*', { count: 'exact' })
      .eq('is_active', true);
    
    if (error) {
      console.error('Error checking HuggingFace API keys:', error);
      return { valid: false, error: error.message };
    }
    
    // Log the retrieved keys for debugging (masking most of the key for security)
    if (data && data.length > 0) {
      data.forEach((key, index) => {
        if (key.api_key) {
          const maskedKey = key.api_key.substring(0, 4) + '***' + key.api_key.slice(-4);
          console.log(`API Key ${index + 1}: ${maskedKey} (Last used: ${key.last_used_at || 'Never'})`);
        } else {
          console.log(`API Key ${index + 1}: Invalid - No key value`);
        }
      });
    } else {
      console.log('No active API keys found in database');
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

// Add a helper function to check the validity of a specific API key
export const testHuggingFaceApiKey = async (apiKey) => {
  try {
    // Simple fetch to check if the API key is valid
    const response = await fetch('https://api-inference.huggingface.co/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    const isValid = response.status === 200;
    console.log('API Key test:', isValid ? 'Valid' : 'Invalid', 'Status:', response.status);
    
    return { 
      valid: isValid,
      status: response.status,
      message: isValid ? 'API key is valid' : `API key is invalid (Status: ${response.status})`
    };
  } catch (e) {
    console.error('Error testing HuggingFace API key:', e);
    return { valid: false, error: e.message };
  }
};
