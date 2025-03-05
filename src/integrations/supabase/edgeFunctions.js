
import { supabase } from './supabase';

/**
 * Call a Supabase Edge Function with proper error handling
 * @param {string} functionName - The name of the edge function
 * @param {object} payload - The data to send to the function
 * @returns {Promise<any>} - The response from the function
 */
export const callEdgeFunction = async (functionName, payload = {}) => {
  try {
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: payload,
    });

    if (error) {
      console.error(`Edge function error (${functionName}):`, error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error(`Failed to call edge function ${functionName}:`, err);
    throw err;
  }
};

/**
 * Helper to check if an edge function exists/is deployed
 * @param {string} functionName - The name of the edge function
 * @returns {Promise<boolean>} - Whether the function exists
 */
export const checkEdgeFunction = async (functionName) => {
  try {
    const { data, error } = await supabase.functions.invoke('health-check', {
      body: { functionName },
    });
    
    if (error || !data?.exists) {
      return false;
    }
    
    return true;
  } catch (err) {
    return false;
  }
};
