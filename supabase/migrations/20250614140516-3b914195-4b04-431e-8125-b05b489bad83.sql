
-- Enable Row Level Security on huggingface_api_keys table
ALTER TABLE public.huggingface_api_keys ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to active API keys
-- This allows the application to read API keys for image generation
CREATE POLICY "Public can read active API keys" 
ON public.huggingface_api_keys 
FOR SELECT 
USING (is_active = true);

-- Create policy to allow only admins to insert API keys
CREATE POLICY "Only admins can insert API keys" 
ON public.huggingface_api_keys 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Create policy to allow only admins to update API keys
CREATE POLICY "Only admins can update API keys" 
ON public.huggingface_api_keys 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Create policy to allow only admins to delete API keys
CREATE POLICY "Only admins can delete API keys" 
ON public.huggingface_api_keys 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);
