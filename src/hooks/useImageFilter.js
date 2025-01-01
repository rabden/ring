import { useMemo } from 'react';

const NSFW_MODELS = ['nsfwMaster', 'animeNsfw'];

export const useImageFilter = () => {
  const filterImages = useMemo(() => (images, {
    userId,
    activeView,
    nsfwEnabled,
    modelConfigs,
    activeFilters,
    searchQuery,
    showPrivate,
    showFollowing,
    showTop,
    following = []
  }) => {
    let filteredData = images.filter(img => {
      const isNsfw = NSFW_MODELS.includes(img.model);
      
      // Filter private images
      if (activeView === 'inspiration') {
        // Never show private images in inspiration
        if (img.is_private) return false;
        if (img.user_id === userId) return false;
        
        // Show only NSFW content when enabled
        if (nsfwEnabled) {
          if (!isNsfw) return false;
        } else {
          if (isNsfw) return false;
        }

        // Apply following filter
        if (showFollowing && !showTop) {
          if (!following.includes(img.user_id)) return false;
        }
        // Apply top filter
        else if (showTop && !showFollowing) {
          if (!img.is_hot && !img.is_trending) return false;
        }
        // Apply both filters
        else if (showTop && showFollowing) {
          if (!following.includes(img.user_id) && (!img.is_hot && !img.is_trending)) return false;
        }
        
        // Apply style and model filters
        if (activeFilters.style && img.style !== activeFilters.style) return false;
        if (activeFilters.model && img.model !== activeFilters.model) return false;

        // Filter by search query
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const prompt = img.prompt?.toLowerCase() || '';
          if (!prompt.includes(query)) return false;
        }

        return true;
      }
      
      // My Images view
      if (activeView === 'myImages') {
        if (img.user_id !== userId) return false;
        
        // Filter by privacy setting
        if (showPrivate) {
          if (!img.is_private) return false;
        } else {
          if (img.is_private) return false;
        }

        // Show only NSFW content when enabled
        if (nsfwEnabled) {
          if (!isNsfw) return false;
        } else {
          if (isNsfw) return false;
        }

        // Apply style and model filters
        if (activeFilters.style && img.style !== activeFilters.style) return false;
        if (activeFilters.model && img.model !== activeFilters.model) return false;

        // Filter by search query
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const prompt = img.prompt?.toLowerCase() || '';
          if (!prompt.includes(query)) return false;
        }

        return true;
      }

      return true;
    });

    // Sort all images by latest first
    filteredData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return filteredData;
  }, []);

  return { filterImages };
};