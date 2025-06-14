
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const useSimpleRemix = () => {
  const navigate = useNavigate();
  
  const remix = useCallback((image) => {
    if (!image) {
      toast.error('Image data not available');
      return;
    }

    // Store remix data in session storage for temporary transfer
    sessionStorage.setItem('remixData', JSON.stringify({
      prompt: image.user_prompt || image.prompt,
      model: image.model,
      width: image.width,
      height: image.height,
      seed: image.seed,
      quality: image.quality,
      aspect_ratio: image.aspect_ratio,
      negative_prompt: image.negative_prompt
    }));
    
    // Navigate to generator with appropriate hash for mobile/desktop
    const isMobile = window.innerWidth <= 768;
    const hash = isMobile ? '#imagegenerate' : '#myimages';
    navigate(`/${hash}`);
  }, [navigate]);
  
  return { remix };
};
