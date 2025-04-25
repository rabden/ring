
import { useMemo } from 'react';

export const useImageFilter = () => {
  const filterImages = useMemo(() => (images, {
    userId,
    activeView,
    modelConfigs,
    activeFilters,
    searchQuery,
    showPrivate,
    showFollowing,
    showTop,
    following = []
  }) => {
    let filteredData = images.filter(img => {
      if (activeView === 'inspiration') {
        if (img.is_private) return false;
        if (img.user_id === userId) return false;
        
        if (showFollowing && !showTop) {
          if (!following.includes(img.user_id)) return false;
        }
        else if (showTop && !showFollowing) {
          if (!img.is_hot && !img.is_trending) return false;
        }
        else if (showTop && showFollowing) {
          if (!following.includes(img.user_id) && (!img.is_hot && !img.is_trending)) return false;
        }
        
        if (activeFilters.style && img.style !== activeFilters.style) return false;
        if (activeFilters.model && img.model !== activeFilters.model) return false;

        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const prompt = img.prompt?.toLowerCase() || '';
          if (!prompt.includes(query)) return false;
        }

        return true;
      }
      
      if (activeView === 'myImages') {
        if (img.user_id !== userId) return false;
        
        if (showPrivate) {
          if (!img.is_private) return false;
        } else {
          if (img.is_private) return false;
        }

        if (activeFilters.style && img.style !== activeFilters.style) return false;
        if (activeFilters.model && img.model !== activeFilters.model) return false;

        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const prompt = img.prompt?.toLowerCase() || '';
          if (!prompt.includes(query)) return false;
        }

        return true;
      }

      return true;
    });

    filteredData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return filteredData;
  }, []);

  return { filterImages };
};
