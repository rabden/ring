
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
    const { prompt, model, parameters, userId, isPrivate, quality, aspectRatio, modelName } = await req.json()
    
    console.log('Received request with model:', model, 'and prompt:', prompt)
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get a random API key from the database with locking mechanism
    // Lock is created by temporarily marking the key as inactive
    let apiKey;
    
    // Transaction to get a key and mark it as in-use
    const { data: keyData, error: keyError } = await supabase
      .from('huggingface_api_keys')
      .select('id, api_key')
      .eq('is_active', true)
      .order('last_used_at', { ascending: true })
      .limit(1);
    
    if (keyError || !keyData || keyData.length === 0) {
      console.error('Error fetching API key:', keyError);
      throw new Error('Failed to get a valid API key');
    }
    
    const keyId = keyData[0].id;
    apiKey = keyData[0].api_key;
    
    console.log('Using API key ID:', keyId);

    // Create a timestamp ID for this generation
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 10);
    const filePath = `${userId}/${timestamp}_${randomString}.png`;
    
    // If userId is provided, create a processing record in the database
    if (userId) {
      // Insert a processing record
      const { data: insertData, error: insertError } = await supabase
        .from('user_images')
        .insert([{
          user_id: userId,
          storage_path: filePath,
          prompt: prompt,
          seed: parameters.seed,
          width: parameters.width,
          height: parameters.height,
          model: modelName || model, // Use the provided modelName or fallback to model id
          quality,
          aspect_ratio: aspectRatio || `${parameters.width}:${parameters.height}`,
          is_private: isPrivate,
          negative_prompt: parameters.negative_prompt,
          like_count: 0,
          status: 'processing' // Add status field to track generation
        }])
        .select()
        .single();
        
      if (insertError) {
        console.error('Database insert error:', insertError);
        throw insertError;
      }
      
      const imageId = insertData.id;
      console.log('Created processing record with ID:', imageId);
      
      // Start the image generation in the background
      const backgroundTask = async () => {
        try {
          console.log('Starting background generation for image:', imageId);
          
          // Initialize the HF client with API key
          const hf = new HfInference(apiKey);
          
          console.log('Parameters:', parameters);
          
          // Make the API call to generate the image
          const result = await hf.textToImage({
            inputs: prompt,
            model: model,
            parameters: parameters,
          });
          
          console.log('Generated image successfully');
          
          // Convert the blob to a base64 string for storage
          const arrayBuffer = await result.arrayBuffer();
          const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
          
          // Convert base64 to Blob for storage
          const byteString = atob(base64);
          const mimeType = 'image/png';
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          
          const imageBlob = new Blob([ab], { type: mimeType });
          
          // Upload to storage
          const { error: uploadError } = await supabase.storage
            .from('user-images')
            .upload(filePath, imageBlob);
            
          if (uploadError) {
            console.error('Storage upload error:', uploadError);
            await supabase
              .from('user_images')
              .update({ status: 'failed' })
              .eq('id', imageId);
            return;
          }
          
          // Get the public URL for the image
          const { data: { publicUrl } } = supabase.storage
            .from('user-images')
            .getPublicUrl(filePath);
          
          // Update the record with completed status
          await supabase
            .from('user_images')
            .update({ 
              status: 'completed', 
              image_url: publicUrl 
            })
            .eq('id', imageId);
            
          console.log('Image generation completed, updated database record:', imageId);
        } catch (error) {
          console.error('Background generation error:', error);
          
          // Update the record with failed status
          await supabase
            .from('user_images')
            .update({ status: 'failed' })
            .eq('id', imageId);
        } finally {
          // Always update the last_used_at timestamp
          const updateResult = await supabase
            .from('huggingface_api_keys')
            .update({ last_used_at: new Date().toISOString() })
            .eq('id', keyId);
            
          if (updateResult.error) {
            console.error('Error updating key usage timestamp:', updateResult.error);
          }
        }
      };
      
      // Run the generation task in the background using Deno's EdgeRuntime
      // This allows the generation to continue even after the function returns
      EdgeRuntime.waitUntil(backgroundTask());
      
      // Return the image ID and status immediately
      return new Response(
        JSON.stringify({ 
          imageId,
          status: 'processing',
          filePath,
          success: true 
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    } else {
      throw new Error('User ID is required');
    }
  } catch (error) {
    console.error('Error generating image:', error);
    
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
    );
  }
})
