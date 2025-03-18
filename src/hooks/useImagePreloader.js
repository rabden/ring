
import { useState, useEffect } from 'react';

/**
 * A hook that preloads an array of images and tracks their loading state
 * 
 * @param {Array<string>} imageUrls - Array of image URLs to preload
 * @returns {Object} Object containing loading states for images
 */
export const useImagePreloader = (imageUrls) => {
  const [loadedImages, setLoadedImages] = useState({});
  const [isPreloading, setIsPreloading] = useState(true);
  
  useEffect(() => {
    let mounted = true;
    
    const preloadImages = async () => {
      try {
        const imagePromises = imageUrls.map((src, index) => {
          return new Promise((resolve) => {
            const img = new Image();
            img.src = src;
            img.onload = () => {
              if (mounted) {
                setLoadedImages(prev => ({
                  ...prev,
                  [index]: true
                }));
              }
              resolve();
            };
            img.onerror = () => {
              console.error(`Failed to load image: ${src}`);
              resolve();
            };
          });
        });
        
        // Wait for all images to load
        await Promise.all(imagePromises);
        
        if (mounted) {
          setIsPreloading(false);
        }
      } catch (error) {
        console.error('Error preloading images:', error);
        if (mounted) {
          setIsPreloading(false);
        }
      }
    };
    
    preloadImages();
    
    return () => {
      mounted = false;
    };
  }, [imageUrls]);
  
  return {
    loadedImages,
    isPreloading,
    isImageLoaded: (index) => !!loadedImages[index]
  };
};
