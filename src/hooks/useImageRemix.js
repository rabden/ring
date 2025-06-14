
import { useCallback } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export const useImageRemix = (session, onRemix, onClose) => {
  const navigate = useNavigate();
  const { setIsRemixMode } = useUserPreferences();
  const isMobileDevice = useMediaQuery('(max-width: 768px)');

  const handleRemix = useCallback((image) => {
    if (!session) {
      toast.error('Please sign in to remix images');
      return;
    }

    // Set remix mode to true
    setIsRemixMode(true);

    if (onRemix && typeof onRemix === 'function') {
      onRemix(image);
    }
    
    if (onClose && typeof onClose === 'function') {
      onClose();
    }

    // Use query parameter with hash, similar to other remix buttons
    const hash = isMobileDevice ? '#imagegenerate' : '#myimages';
    navigate(`/?remix=${image.id}${hash}`, { replace: true });
  }, [session, onRemix, onClose, navigate, setIsRemixMode, isMobileDevice]);

  return { handleRemix };
};
