
-- Function to improve a prompt using Hugging Face API
CREATE OR REPLACE FUNCTION improve_prompt(original_prompt TEXT, model_example TEXT DEFAULT 'a photo of a cat, high quality, detailed')
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  api_key TEXT;
  api_url TEXT := 'https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-3B-Instruct';
  response JSONB;
  improved_prompt TEXT;
BEGIN
  -- Get an API key
  SELECT hf.api_key INTO api_key
  FROM huggingface_api_keys hf
  WHERE hf.is_active = true
  ORDER BY hf.last_used_at ASC
  LIMIT 1;

  IF api_key IS NULL THEN
    RAISE EXCEPTION 'No active API key available';
  END IF;

  -- Update the last_used_at timestamp
  UPDATE huggingface_api_keys
  SET last_used_at = NOW()
  WHERE api_key = api_key;

  -- Call Hugging Face API
  SELECT
    content INTO response
  FROM
    http((
      'POST',
      api_url,
      ARRAY[
        http_header('Authorization', 'Bearer ' || api_key),
        http_header('Content-Type', 'application/json')
      ],
      'application/json',
      jsonb_build_object(
        'inputs', jsonb_build_object(
          'messages', jsonb_build_array(
            jsonb_build_object(
              'role', 'system',
              'content', 'You are an expert AI image prompt engineer. Your task is to enhance the given prompt for high-quality image generation. Preserve the core idea and artistic vision, enrich brief prompts with details, and remove any extraneous noise. Keep the final prompt concise, between 20 to 80 words, and follow these guidelines: ' || model_example || '. Output only the improved prompt.'
            ),
            jsonb_build_object(
              'role', 'user',
              'content', original_prompt
            )
          ),
          'parameters', jsonb_build_object(
            'temperature', 0.5,
            'max_tokens', 1000,
            'top_p', 0.7
          )
        )
      )::TEXT
    ));

  -- Extract the response
  improved_prompt := response#>>'{0,generated_text}';
  
  -- Return original if no improvement
  IF improved_prompt IS NULL OR improved_prompt = '' THEN
    RETURN original_prompt;
  END IF;
  
  RETURN improved_prompt;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but return the original prompt
    RAISE WARNING 'Error improving prompt: %', SQLERRM;
    RETURN original_prompt;
END;
$$;

-- Grant execute permissions to the current role
GRANT EXECUTE ON FUNCTION improve_prompt TO authenticated;
GRANT EXECUTE ON FUNCTION improve_prompt TO anon;
GRANT EXECUTE ON FUNCTION improve_prompt TO service_role;
