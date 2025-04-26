
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { originalPrompt, activeModel, modelExample } = await req.json();
    const API_KEY = "AIzaSyCETmVzAEQdD5lFpql415j06FjJlah59Gk";
    
    console.log(`Improving prompt for model: ${activeModel}, example: ${modelExample || "Not provided"}`);
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:streamGenerateContent?key=${API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: "a dog" }]
          },
          {
            role: "model",
            parts: [{ 
              text: "A majestic golden retriever, radiating joy and boundless energy, frolicking playfully in a vibrant, sun-drenched meadow filled with wildflowers. Captured with a shallow depth of field, emphasizing the dog's expressive eyes and fluffy fur. Cinematic lighting and a warm, inviting atmosphere." 
            }]
          },
          {
            role: "user",
            parts: [{ text: originalPrompt }]
          }
        ],
        systemInstruction: {
          parts: [{ 
            text: `You are an expert AI image prompt engineer. Your task is to enhance the given prompt for high-quality image generation. Preserve the core idea and artistic vision, enrich brief prompts with details, and remove any extraneous noise. Keep the final prompt concise, between 20 to 80 words, and follow these guidelines: ${modelExample || "a photo of a cat, high quality, detailed"}. Output only the improved prompt.` 
          }]
        },
        generationConfig: {
          temperature: 0.8,
          topP: 0.7,
          responseMimeType: "text/plain"
        }
      })
    });

    // Stream the response back to the client
    return new Response(response.body, { 
      headers: { 
        ...corsHeaders,
        'Content-Type': 'text/event-stream' 
      } 
    });
    
  } catch (error) {
    console.error('Error improving prompt:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
