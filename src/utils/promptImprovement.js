
import { HfInference } from "@huggingface/inference";
import { supabase } from '@/integrations/supabase/supabase';

export const improvePrompt = async (originalPrompt, activeModel, modelConfigs, onChunk) => {
  try {
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

    // Set custom fetch options with no-cors mode
    const customFetch = (url, options = {}) => {
      return fetch(url, {
        ...options,
        mode: 'no-cors',
        credentials: 'omit'
      });
    };

    // Create HfInference client with custom fetch
    const client = new HfInference(apiKeyData.api_key, {
      fetch: customFetch
    });
    
    const modelExample = modelConfigs?.[activeModel]?.example || "a photo of a cat, high quality, detailed";
    
    let improvedPrompt = "";
    
    try {
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
    } catch (streamError) {
      console.error('Stream error:', streamError);
      // Fallback to non-streaming request if streaming fails
      try {
        console.log('Falling back to non-streaming request');
        const response = await client.chatCompletion({
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
        improvedPrompt = response.choices[0].message.content;
      } catch (fallbackError) {
        console.error('Fallback request failed:', fallbackError);
        // If all fails, just return the original prompt
        improvedPrompt = originalPrompt;
      }
    }

    // If onChunk wasn't called with streaming data, call it once with the final result
    if (improvedPrompt && (!onChunk || improvedPrompt !== originalPrompt)) {
      if (onChunk) onChunk(improvedPrompt, false);
    }

    return improvedPrompt.trim() || originalPrompt;
  } catch (error) {
    console.error('Error improving prompt:', error);
    return originalPrompt; // Return original prompt on error
  }
}
