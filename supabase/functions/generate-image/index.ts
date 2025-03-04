
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { HfInference } from "https://esm.sh/@huggingface/inference@2.3.2"

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
    
    // Get API key from environment variable
    const apiKey = Deno.env.get('HUGGINGFACE_API_KEY')
    if (!apiKey) {
      throw new Error('Missing HUGGINGFACE_API_KEY environment variable')
    }

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
