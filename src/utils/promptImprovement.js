
import { HfInference } from "@huggingface/inference";
import { supabase } from '@/integrations/supabase/supabase';

export const improvePrompt = async (originalPrompt, activeModel, modelConfigs, onChunk) => {
  try {
    // First, try the direct streaming approach
    return await improvePromptWithStreaming(originalPrompt, activeModel, modelConfigs, onChunk);
  } catch (error) {
    console.error('Error with streaming approach:', error);
    
    // If streaming fails (likely due to CORS), fall back to non-streaming approach
    if (error.message && (error.message.includes('CORS') || error.message.includes('Failed to fetch'))) {
      console.log('Falling back to non-streaming approach due to CORS issues');
      return await improvePromptWithoutStreaming(originalPrompt, activeModel, modelConfigs, onChunk);
    }
    
    // If it's another type of error, rethrow it
    throw error;
  }
};

// Streaming approach - might fail due to CORS
const improvePromptWithStreaming = async (originalPrompt, activeModel, modelConfigs, onChunk) => {
  const { data: apiKeyData, error: apiKeyError } = await supabase
    .from('huggingface_api_keys')
    .select('api_key')
    .eq('is_active', true)
    .order('last_used_at', { ascending: true })
    .limit(1)
    .single();
  
  if (apiKeyError) {
    throw new Error(`Failed to get API key: ${apiKeyError.message}`);
  }
  if (!apiKeyData) {
    throw new Error('No active API key available');
  }

  // Update the last_used_at timestamp for the selected key
  await supabase
    .from('huggingface_api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('api_key', apiKeyData.api_key);

  const client = new HfInference(apiKeyData.api_key);
  
  const modelExample = modelConfigs?.[activeModel]?.example || "a photo of a cat, high quality, detailed";
  
  let improvedPrompt = "";
  
  const stream = await client.chatCompletionStream({
    model: "meta-llama/Llama-3.2-3B-Instruct",
    messages: [
      {
        role: "system",
        content: `You are an expert AI image prompt engineer. Your task is to enhance the given prompt for high-quality image generation. Preserve the core idea and artistic vision, enrich brief prompts with details, and remove any extraneous noise. Keep the final prompt concise, between 20 to 80 words, and follow these guidelines: ${modelExample}. Output only the improved prompt.`
      },
      {
        role: "user",
        content: originalPrompt
      }
    ],
    temperature: 0.5,
    max_tokens: 64000,
    top_p: 0.7
  });

  for await (const chunk of stream) {
    if (chunk.choices && chunk.choices.length > 0) {
      const newContent = chunk.choices[0].delta.content;
      if (newContent) {
        improvedPrompt += newContent;
        if (onChunk) onChunk(newContent, true);
      }
    }
  }

  // If onChunk wasn't called with streaming data, call it once with the final result
  if (improvedPrompt && (!onChunk || improvedPrompt !== originalPrompt)) {
    if (onChunk) onChunk(improvedPrompt, false);
  }

  return improvedPrompt.trim();
};

// Non-streaming approach using RPC function - works around CORS issues
const improvePromptWithoutStreaming = async (originalPrompt, activeModel, modelConfigs, onChunk) => {
  try {
    const modelExample = modelConfigs?.[activeModel]?.example || "a photo of a cat, high quality, detailed";
    
    const { data, error } = await supabase.rpc('improve_prompt', { 
      original_prompt: originalPrompt,
      model_example: modelExample
    });
    
    if (error) throw error;
    
    if (data && onChunk) {
      onChunk(data, false); // Call once with the full result
    }
    
    return data || originalPrompt;
  } catch (error) {
    console.error('Error improving prompt with RPC:', error);
    
    // If RPC fails, return the original prompt
    if (onChunk) onChunk(originalPrompt, false);
    return originalPrompt;
  }
};
