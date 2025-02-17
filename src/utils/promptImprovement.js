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

    const client = new HfInference(apiKeyData.api_key);
    
    const modelExample = modelConfigs?.[activeModel]?.example || "a photo of a cat, high quality, detailed";
    
    let improvedPrompt = "";
    
    const stream = await client.chatCompletionStream({
      model: "meta-llama/Llama-3.2-3B-Instruct",
      messages: [
        {
          role: "system",
          content: `Act as an expert AI image prompt engineer for high-quality image generation. Enhance the provided prompt by preserving its core idea and artistic vision. If it's too brief, enrich it with details; remove any extraneous noise that might make image-generator AI confused. Keep the final prompt between 30 to 80 words and strongly follow these Guidelines: ${modelExample} Don't write anything else except the prompt.`
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
          onChunk(newContent);
        }
      }
    }

    return improvedPrompt.trim();
  } catch (error) {
    console.error('Error improving prompt:', error);
    throw error;
  }
}