import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/supabase';
import { useEffect } from 'react';

const ITEMS_PER_PAGE = 20;
const NSFW_MODELS = ['nsfwMaster', 'animeNsfw'];

export const useGalleryImages = ({
  userId,
  activeView,
  nsfwEnabled,
  showPrivate,
  activeFilters = {},
  searchQuery = '',
  modelConfigs = {},
  showFollowing = false,
  showTop = false,
  following = []
}) => {
  const queryClient = useQueryClient();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['galleryImages', userId, activeView, nsfwEnabled, showPrivate, activeFilters, searchQuery, showFollowing, showTop, following],
    queryFn: async ({ pageParam = { page: 0 } }) => {
      if (!userId) return { data: [], nextPage: null };

      let baseQuery = supabase
        .from('user_images')
        .select('*', { count: 'exact' });

      // Handle MyImages view
      if (activeView === 'myImages') {
        // Filter by user's images
        baseQuery = baseQuery.eq('user_id', userId);
        
        // Filter by privacy setting
        if (showPrivate !== undefined) {
          baseQuery = baseQuery.eq('is_private', showPrivate);
        }

        // Apply NSFW filter
        if (nsfwEnabled) {
          baseQuery = baseQuery.in('model', NSFW_MODELS);
        } else {
          baseQuery = baseQuery.not('model', 'in', '(' + NSFW_MODELS.join(',') + ')');
        }

        // Apply style and model filters
        if (activeFilters.style) {
          baseQuery = baseQuery.eq('style', activeFilters.style);
        }
        if (activeFilters.model) {
          baseQuery = baseQuery.eq('model', activeFilters.model);
        }

        // Apply search filter
        if (searchQuery && searchQuery.trim()) {
          baseQuery = baseQuery.ilike('prompt', `%${searchQuery.trim()}%`);
        }

        // Apply pagination
        const start = pageParam.page * ITEMS_PER_PAGE;
        const { data: result, error, count } = await baseQuery
          .order('created_at', { ascending: false })
          .range(start, start + ITEMS_PER_PAGE - 1);

        if (error) throw error;

        return {
          data: result?.map(image => ({
            ...image,
            image_url: supabase.storage
              .from('user-images')
              .getPublicUrl(image.storage_path).data.publicUrl
          })) || [],
          nextPage: (result?.length === ITEMS_PER_PAGE && count > start + ITEMS_PER_PAGE) 
            ? { page: pageParam.page + 1 } 
            : undefined
        };
      }

      // Handle Inspiration view
      baseQuery = baseQuery
        .neq('user_id', userId)
        .eq('is_private', false);

      // Apply NSFW filter
      if (nsfwEnabled) {
        baseQuery = baseQuery.in('model', NSFW_MODELS);
      } else {
        baseQuery = baseQuery.not('model', 'in', '(' + NSFW_MODELS.join(',') + ')');
      }

      // Handle following and top filters
      if (showFollowing && !showTop && following?.length > 0) {
        baseQuery = baseQuery.in('user_id', following);
      }
      else if (showTop && !showFollowing) {
        baseQuery = baseQuery.or('is_hot.eq.true,is_trending.eq.true');
      }
      else if (showTop && showFollowing && following?.length > 0) {
        baseQuery = baseQuery.or(`user_id.in.(${following.join(',')}),is_hot.eq.true,is_trending.eq.true`);
      }
      // If following is selected but following list is empty, return empty result
      else if (showFollowing && following?.length === 0) {
        // Return empty result without making database query
        return {
          data: [],
          nextPage: undefined
        };
      }

      // Apply style and model filters
      if (activeFilters.style) {
        baseQuery = baseQuery.eq('style', activeFilters.style);
      }
      if (activeFilters.model) {
        baseQuery = baseQuery.eq('model', activeFilters.model);
      }

      // Apply search filter
      if (searchQuery) {
        baseQuery = baseQuery.ilike('prompt', `%${searchQuery}%`);
      }

      // Apply pagination and sort by latest first
      const start = pageParam.page * ITEMS_PER_PAGE;
      const { data: result, error, count } = await baseQuery
        .order('created_at', { ascending: false })
        .range(start, start + ITEMS_PER_PAGE - 1);
      
      if (error) throw error;
      if (!result) return { data: [], nextPage: null };

      return {
        data: result.map(image => ({
          ...image,
          image_url: supabase.storage
            .from('user-images')
            .getPublicUrl(image.storage_path).data.publicUrl
        })),
        nextPage: (result.length === ITEMS_PER_PAGE && count > start + ITEMS_PER_PAGE) 
          ? { page: pageParam.page + 1 } 
          : undefined
      };
    },
    getNextPageParam: (lastPage) => lastPage?.nextPage,
    initialPageParam: { page: 0 }
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!userId) return;

    // Create channel for real-time updates
    const channel = supabase
      .channel('gallery-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_images',
          filter: activeView === 'myImages' 
            ? `user_id=eq.${userId}` 
            : `user_id=neq.${userId}`
        },
        () => {
          // Invalidate the query to trigger a refetch
          queryClient.invalidateQueries({
            queryKey: ['galleryImages', userId, activeView]
          });
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, activeView, queryClient]);

  const images = data?.pages?.flatMap(page => page.data) || [];

  return { 
    images, 
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  };
};