-- Add a generated column for text search weights
ALTER TABLE public.user_images
ADD COLUMN IF NOT EXISTS prompt_weights tsvector
GENERATED ALWAYS AS (to_tsvector('english', prompt)) STORED;

-- Create an index on the prompt_weights column
CREATE INDEX IF NOT EXISTS idx_user_images_prompt_weights ON public.user_images USING GIN (prompt_weights);

-- Create a function to calculate similarity
CREATE OR REPLACE FUNCTION similarity(query text, document text)
RETURNS float AS $$
BEGIN
  RETURN ts_rank(to_tsvector('english', document), plainto_tsquery('english', query));
END;
$$ LANGUAGE plpgsql IMMUTABLE;