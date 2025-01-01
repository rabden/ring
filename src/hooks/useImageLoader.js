import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/supabase';

export const useImageLoader = (imageRef, image) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [imageSrc, setImageSrc] = useState('');

  useEffect(() => {
    const checkVisibility = () => {
      if (!imageRef.current) return;

      const rect = imageRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const verticalMargin = windowHeight;
      
      const isVisible = (
        rect.top <= windowHeight + verticalMargin &&
        rect.bottom >= -verticalMargin
      );

      if (isVisible && !shouldLoad) {
        setShouldLoad(true);
        setImageSrc(supabase.storage.from('user-images').getPublicUrl(image.storage_path).data.publicUrl);
      } else if (!isVisible && shouldLoad) {
        setShouldLoad(false);
        setImageLoaded(false);
        setImageSrc('');
      }
    };

    checkVisibility();
    window.addEventListener('scroll', checkVisibility, { passive: true });
    window.addEventListener('resize', checkVisibility);

    return () => {
      window.removeEventListener('scroll', checkVisibility);
      window.removeEventListener('resize', checkVisibility);
    };
  }, [shouldLoad, image.storage_path]);

  return { imageLoaded, shouldLoad, imageSrc, setImageLoaded };
};