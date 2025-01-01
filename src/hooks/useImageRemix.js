import { useModelConfigs } from '@/hooks/useModelConfigs';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export const useImageRemix = (session, onRemix, onClose) => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleRemix = (image) => {
    if (!session) {
      toast.error('Please sign in to remix images');
      return;
    }

    if (onRemix && typeof onRemix === 'function') {
      onRemix(image);
    }
    
    if (onClose && typeof onClose === 'function') {
      onClose();
    }

    // Navigate with remix parameter before the hash
    const hash = isMobile ? '#imagegenerate' : '#myimages';
    navigate(`/?remix=${image.id}${hash}`, { replace: true });
  };

  return { handleRemix };
};