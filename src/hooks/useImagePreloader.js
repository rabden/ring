
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
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    let mounted = true;
    
    // Reset states when imageUrls change
    if (imageUrls.length > 0) {
      setIsPreloading(true);
      setProgress(0);
    } else {
      setIsPreloading(false);
      return;
    }
    
    const preloadImages = async () => {
      try {
        let loadedCount = 0;
        const totalImages = imageUrls.length;
        
        const imagePromises = imageUrls.map((src, index) => {
          return new Promise((resolve) => {
            const img = new Image();
            img.src = src;
            img.onload = () => {
              if (mounted) {
                loadedCount++;
                setProgress(Math.round((loadedCount / totalImages) * 100));
                setLoadedImages(prev => ({
                  ...prev,
                  [index]: true
                }));
              }
              resolve();
            };
            img.onerror = () => {
              console.error(`Failed to load image: ${src}`);
              if (mounted) {
                loadedCount++;
                setProgress(Math.round((loadedCount / totalImages) * 100));
              }
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
    
    if (imageUrls.length > 0) {
      preloadImages();
    }
    
    return () => {
      mounted = false;
    };
  }, [imageUrls]);
  
  return {
    loadedImages,
    isPreloading,
    progress,
    isImageLoaded: (index) => !!loadedImages[index],
    areAllImagesLoaded: Object.keys(loadedImages).length === imageUrls.length
  };
};
