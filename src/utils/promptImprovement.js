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
      model: "Qwen/Qwen2.5-Coder-32B-Instruct",
      messages: [
        {
          role: "system",
          content: `You are an expert AI image prompt engineer specializing in enhancing prompts for high-quality image generation. Your task is to improve the given prompt while maintaining its core concept and artistic intent but if the prompt is lacking and too short add more details to it making it better and more detailed, Just return the improved prompt saying nothing else. stongly follow these Guidelines: ${modelExample}`
        },
        {
          role: "user",
          content: originalPrompt
        }
      ],
      max_tokens: 2048,
      temperature: 0.7
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