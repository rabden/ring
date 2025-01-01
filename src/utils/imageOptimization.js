import { supabase } from '@/integrations/supabase/supabase';

export const getOptimizedImageUrl = (storagePath, options = {}) => {
  try {
    const {
      width = 'auto',
      quality = 75,
      format = 'webp'
    } = options;

    // Get base URL first
    const baseUrl = supabase.storage.from('user-images').getPublicUrl(storagePath).data.publicUrl;
    
    // If any of the optimization parameters fail, return the base URL
    if (!baseUrl) {
      console.error('Failed to get base URL for image:', storagePath);
      return '';
    }

    // Don't try to transform if no width specified
    if (width === 'auto') {
      return baseUrl;
    }

    try {
      // Add Supabase image transformation parameters
      const transformUrl = new URL(baseUrl);
      transformUrl.searchParams.set('width', width);
      transformUrl.searchParams.set('quality', quality);
      transformUrl.searchParams.set('format', format);
      return transformUrl.toString();
    } catch (error) {
      console.error('Error transforming image URL:', error);
      return baseUrl; // Fallback to original URL
    }
  } catch (error) {
    console.error('Error in getOptimizedImageUrl:', error);
    return ''; // Return empty string if everything fails
  }
};

export const generateBlurHash = async (imageUrl) => {
  try {
    if (!imageUrl) return null;
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error('Failed to fetch image for blur hash');
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error generating blur hash:', error);
    return null;
  }
};

export const getResponsiveImageUrl = (storagePath) => {
  if (!storagePath) return null;
  
  return {
    small: getOptimizedImageUrl(storagePath, { width: 640, quality: 70 }),
    medium: getOptimizedImageUrl(storagePath, { width: 1024, quality: 75 }),
    large: getOptimizedImageUrl(storagePath, { width: 1920, quality: 80 }),
    original: getOptimizedImageUrl(storagePath, { quality: 85 })
  };
};