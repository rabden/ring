
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { HfInference } from "https://esm.sh/@huggingface/inference@2.3.2"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { prompt, model, parameters } = await req.json()
    
    console.log('Received request with model:', model, 'and prompt:', prompt)
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get a random API key from the database
    const { data: keyData, error: keyError } = await supabase
      .from('huggingface_api_keys')
      .select('api_key')
      .eq('is_active', true)
      .order('last_used_at', { ascending: true })
      .limit(1);
    
    if (keyError || !keyData || keyData.length === 0) {
      console.error('Error fetching API key:', keyError);
      throw new Error('Failed to get a valid API key');
    }
    
    const apiKey = keyData[0].api_key;
    
    // Update the last used time for this key
    await supabase
      .from('huggingface_api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('api_key', apiKey);
    
    console.log('Using API key from database');
    
    // Initialize the HF client with API key
    const hf = new HfInference(apiKey)
    
    console.log('Parameters:', parameters)
    
    // Make the API call to generate the image
    const result = await hf.textToImage({
      inputs: prompt,
      model: model,
      parameters: parameters,
    })
    
    console.log('Generated image successfully')
    
    // Convert the blob to a base64 string for response
    const arrayBuffer = await result.arrayBuffer()
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
    
    // Return the generated image as base64
    return new Response(
      JSON.stringify({ 
        image: `data:image/png;base64,${base64}`,
        success: true 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Error generating image:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to generate image',
        success: false
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 500 
      }
    )
  }
})
