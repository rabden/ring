
import { supabase } from '@/integrations/supabase/supabase';

export const improvePrompt = async (originalPrompt, activeModel, modelConfigs, onChunk) => {
  try {
    const API_KEY = "AIzaSyCETmVzAEQdD5lFpql415j06FjJlah59Gk";
    const modelExample = modelConfigs?.[activeModel]?.example || "a photo of a cat, high quality, detailed";
    
    let improvedPrompt = "";

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:streamGenerateContent?key=" + API_KEY, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: originalPrompt }]
          }
        ],
        systemInstruction: {
          parts: [{ 
            text: `You are an expert AI image prompt engineer. Your task is to enhance the given prompt for high-quality image generation. Preserve the core idea and artistic vision, enrich brief prompts with details, and remove any extraneous noise. Keep the final prompt concise, between 20 to 80 words, and follow these guidelines: ${modelExample}. Output only the improved prompt.` 
          }]
        },
        generationConfig: {
          temperature: 0.8,
          topP: 0.7,
          responseMimeType: "text/plain"
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API error:", errorData);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    // Process the stream
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      
      try {
        // Gemini returns data in a specific format - we need to parse it
        const lines = chunk.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.substring(6);
            if (jsonStr === '[DONE]') continue;
            
            try {
              const data = JSON.parse(jsonStr);
              if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                const textPart = data.candidates[0].content.parts.find(part => part.text);
                if (textPart) {
                  const newContent = textPart.text;
                  improvedPrompt += newContent;
                  if (onChunk) {
                    onChunk(newContent, true);
                  }
                }
              }
            } catch (parseError) {
              console.warn("Error parsing JSON chunk:", parseError);
              // Continue with other chunks even if one fails to parse
            }
          }
        }
      } catch (processError) {
        console.warn("Error processing chunk:", processError);
      }
    }

    // If onChunk wasn't called with streaming data, call it once with the final result
    if (improvedPrompt && (!onChunk || improvedPrompt !== originalPrompt)) {
      if (onChunk) onChunk(improvedPrompt, false);
    }

    return improvedPrompt.trim() || originalPrompt;
  } catch (error) {
    console.error('Error improving prompt:', error);
    // Return the original prompt on error so the user can still proceed
    return originalPrompt;
  }
}
