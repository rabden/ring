
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

// Initialize Supabase client - these will be environment variables in Vercel
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Configure the models mapping - these mimic the modelConfigs from the frontend
const modelConfigs = {
  fluxDev: {
    huggingfaceId: 'black-forest-labs/FLUX.1-dev',
    name: 'FLUX.1 Developer',
    use_negative_prompt: true
  },
  stabilityXL: {
    huggingfaceId: 'stabilityai/stable-diffusion-xl-base-1.0',
    name: 'Stability XL',
    use_negative_prompt: true
  },
  // Add other models as needed
};

// Mapping for quality settings
const qualitySteps = {
  'HD': 4,
  'HD+': 12,
  '4K': 25
};

// Helper function to create image storage filename
const createStorageFilename = (userId, queueId) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `${userId}/${timestamp}-${queueId.slice(0, 8)}.png`;
};

// Helper function to fetch an image and store it in Supabase storage
async function storeImageInSupabase(imageUrl, userId, queueId, isPrivate) {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    const imageBuffer = await response.buffer();
    const filename = createStorageFilename(userId, queueId);
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('user-images')
      .upload(filename, imageBuffer, {
        contentType: 'image/png',
        upsert: true,
        cacheControl: '3600'
      });
      
    if (uploadError) {
      throw new Error(`Storage upload error: ${uploadError.message}`);
    }
    
    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from('user-images')
      .getPublicUrl(filename);
      
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error storing image:', error);
    throw error;
  }
}

// Helper function to call Hugging Face API to generate an image
async function generateImageWithHuggingFace(queueItem) {
  const modelConfig = modelConfigs[queueItem.model] || modelConfigs.fluxDev;
  const huggingFaceModel = modelConfig.huggingfaceId;
  const steps = qualitySteps[queueItem.quality] || 4;
  
  // Get HF API key from Supabase
  const { data: apiKeyData, error: apiKeyError } = await supabase.rpc('get_random_huggingface_api_key');
  if (apiKeyError || !apiKeyData) {
    throw new Error(`Failed to get API key: ${apiKeyError?.message || 'No API keys available'}`);
  }
  
  const apiKey = apiKeyData;
  
  // Prepare request to Hugging Face
  const url = `https://api-inference.huggingface.co/models/${huggingFaceModel}`;
  const payload = {
    inputs: queueItem.prompt,
    parameters: {
      width: queueItem.width,
      height: queueItem.height,
      num_inference_steps: steps,
      guidance_scale: 7.5,
      seed: queueItem.seed
    }
  };
  
  // Add negative prompt if supported by the model and provided
  if (modelConfig.use_negative_prompt && queueItem.negative_prompt) {
    payload.parameters.negative_prompt = queueItem.negative_prompt;
  }
  
  // Send request to Hugging Face
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Hugging Face API error (${response.status}): ${errorText}`);
  }
  
  // Get the image as a buffer
  const imageBuffer = await response.buffer();
  
  // Create a data URL to pass to storeImageInSupabase
  // For this worker, we'll temporarily upload to some public image hosting
  // In a real application, you'd handle this differently
  
  // Upload to Supabase directly instead of creating a data URL
  const filename = createStorageFilename(queueItem.user_id, queueItem.id);
  
  // Upload to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('user-images')
    .upload(filename, imageBuffer, {
      contentType: 'image/png',
      upsert: true,
      cacheControl: '3600'
    });
    
  if (uploadError) {
    throw new Error(`Storage upload error: ${uploadError.message}`);
  }
  
  // Get the public URL
  const { data: publicUrlData } = supabase.storage
    .from('user-images')
    .getPublicUrl(filename);
    
  return publicUrlData.publicUrl;
}

// Main worker function
async function processNextQueueItem() {
  // Get the next pending item with the highest priority
  const { data: queueItems, error: queueError } = await supabase
    .from('image_generation_queue')
    .select('*')
    .eq('status', 'pending')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(1);
    
  if (queueError) {
    console.error('Error fetching queue:', queueError);
    return;
  }
  
  if (!queueItems || queueItems.length === 0) {
    console.log('No pending items in the queue');
    return;
  }
  
  const queueItem = queueItems[0];
  
  // Update status to processing
  const { error: updateError } = await supabase
    .from('image_generation_queue')
    .update({ status: 'processing' })
    .eq('id', queueItem.id);
    
  if (updateError) {
    console.error('Error updating queue status:', updateError);
    return;
  }
  
  try {
    // Generate the image
    const imageUrl = await generateImageWithHuggingFace(queueItem);
    
    // Create user_images entry
    const { data: userImage, error: userImageError } = await supabase
      .from('user_images')
      .insert({
        user_id: queueItem.user_id,
        storage_path: imageUrl,
        prompt: queueItem.prompt,
        model: queueItem.model,
        seed: queueItem.seed,
        width: queueItem.width,
        height: queueItem.height,
        quality: queueItem.quality,
        aspect_ratio: queueItem.aspect_ratio,
        negative_prompt: queueItem.negative_prompt,
        is_private: queueItem.is_private
      })
      .select()
      .single();
      
    if (userImageError) {
      throw new Error(`Error creating user image: ${userImageError.message}`);
    }
    
    // Create results entry
    const { data: resultData, error: resultError } = await supabase
      .from('image_generation_results')
      .insert({
        queue_id: queueItem.id,
        image_url: imageUrl,
        user_image_id: userImage.id
      });
      
    if (resultError) {
      throw new Error(`Error creating result: ${resultError.message}`);
    }
    
    // Update queue status to completed
    await supabase
      .from('image_generation_queue')
      .update({ status: 'completed' })
      .eq('id', queueItem.id);
      
    console.log(`Successfully processed queue item ${queueItem.id}`);
  } catch (error) {
    console.error(`Error processing queue item ${queueItem.id}:`, error);
    
    // Update queue status to failed
    await supabase
      .from('image_generation_queue')
      .update({ 
        status: 'failed',
        error_message: error.message,
        retries: queueItem.retries + 1
      })
      .eq('id', queueItem.id);
  }
}

// API handler for Vercel serverless function
export default async function handler(req, res) {
  // This endpoint will be triggered by Vercel Cron
  if (req.method === 'POST') {
    try {
      await processNextQueueItem();
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Worker error:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    // For direct invocation (testing)
    if (req.method === 'GET') {
      try {
        await processNextQueueItem();
        res.status(200).json({ success: true });
      } catch (error) {
        console.error('Worker error:', error);
        res.status(500).json({ error: error.message });
      }
    } else {
      res.setHeader('Allow', ['POST', 'GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  }
}
