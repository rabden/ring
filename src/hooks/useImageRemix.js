
import { useCallback } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';

export const useImageRemix = (session, onRemix, onClose) => {
  const navigate = useNavigate();
  const { setIsRemixMode } = useUserPreferences();

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

    // Use query parameter instead of hash to avoid infinite loop with useEffect reactions
    navigate(`/?remix=${image.id}`, { replace: true });
  }, [session, onRemix, onClose, navigate, setIsRemixMode]);

  return { handleRemix };
};
