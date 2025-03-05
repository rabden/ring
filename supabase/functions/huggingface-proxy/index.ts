
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { model, inputs, parameters, apiKey } = await req.json();

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (!model || !inputs) {
      return new Response(
        JSON.stringify({ error: 'Model and inputs are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Prepare the request to Hugging Face
    const url = `https://api-inference.huggingface.co/models/${model}`;
    
    console.log(`Making request to Hugging Face: ${url}`);
    console.log(`With input prompt: ${inputs.substring(0, 50)}...`);
    
    // Make the request to Hugging Face
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'image/*'
      },
      body: JSON.stringify({
        inputs,
        parameters
      }),
      // Add a longer timeout
      signal: AbortSignal.timeout(120000) // 2 minute timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Hugging Face API error (${response.status}): ${errorText}`);
      
      return new Response(
        JSON.stringify({ 
          error: `Hugging Face API error: ${response.status}`,
          details: errorText
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: response.status
        }
      );
    }

    // Get the image data as a blob
    const imageBlob = await response.blob();
    
    console.log(`Response received from Hugging Face, size: ${imageBlob.size} bytes`);
    
    // Return the image data directly
    return new Response(imageBlob, { 
      headers: { 
        ...corsHeaders,
        'Content-Type': imageBlob.type
      }
    });
  } catch (error) {
    console.error('Proxy error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'An unexpected error occurred',
        details: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
