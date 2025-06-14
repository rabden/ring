
import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/supabase';
import { useEffect, useState, useMemo } from 'react';
import { startOfMonth, startOfWeek } from 'date-fns';
import { getNsfwModelKeys } from '@/utils/modelUtils';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { useQueryClient } from '@tanstack/react-query';

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
  showLatest = false,
  following = []
}) => {
  const queryClient = useQueryClient();
  const [itemsPerPage, setItemsPerPage] = useState(window.innerWidth <= 768 ? 50 : 200);
  const NSFW_MODELS = getNsfwModelKeys();

  // Create stable query key for this specific configuration
  const queryKey = useMemo(() => [
    'galleryImages', 
    userId, 
    activeView, 
    nsfwEnabled, 
    showPrivate, 
    activeFilters, 
    searchQuery, 
    showFollowing, 
    showTop, 
    following, 
    itemsPerPage
  ], [userId, activeView, nsfwEnabled, showPrivate, activeFilters, searchQuery, showFollowing, showTop, following, itemsPerPage]);

  // Set up realtime subscription with centralized manager
  const callback = (payload) => {
    console.log('Gallery realtime update:', payload);
    queryClient.invalidateQueries({
      queryKey: ['galleryImages']
    });
  };

  const filter = activeView === 'myImages' 
    ? userId ? `user_id=eq.${userId}` : null
    : userId ? `user_id=neq.${userId}` : null;

  useRealtimeSubscription(
    'user_images',
    filter,
    callback,
    {
      queryKeys: [['galleryImages']]
    }
  );

  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(window.innerWidth <= 768 ? 50 : 200);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey,
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
        const start = pageParam.page * itemsPerPage;
        const { data: result, error, count } = await baseQuery
          .order('created_at', { ascending: false })
          .range(start, start + itemsPerPage - 1);

        if (error) throw error;

        return {
          data: result?.map(image => ({
            ...image,
            image_url: supabase.storage
              .from('user-images')
              .getPublicUrl(image.storage_path).data.publicUrl
          })) || [],
          nextPage: (result?.length === itemsPerPage && count > start + itemsPerPage) 
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

      // Handle following filter
      if (showFollowing && following?.length > 0) {
        baseQuery = baseQuery.in('user_id', following);
      }
      // If following is selected but following list is empty, return empty result
      else if (showFollowing && following?.length === 0) {
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

      // Apply pagination
      const start = pageParam.page * itemsPerPage;
      
      // Handle Top view with period filtering
      if (showTop) {
        // Apply period filters
        if (activeFilters.period === 'month') {
          const startOfThisMonth = startOfMonth(new Date()).toISOString();
          baseQuery = baseQuery.gte('created_at', startOfThisMonth);
        } else if (activeFilters.period === 'week') {
          const startOfThisWeek = startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString(); // Week starts on Monday
          baseQuery = baseQuery.gte('created_at', startOfThisWeek);
        }
        // For 'all', no date filter is needed
        
        // Order by likes for Top view
        baseQuery = baseQuery
          .order('like_count', { ascending: false, nullsLast: true })
          .order('created_at', { ascending: false });
      } else {
        // For other views: Sort by date only
        baseQuery = baseQuery.order('created_at', { ascending: false });
      }
      
      const { data: result, error, count } = await baseQuery
        .range(start, start + itemsPerPage - 1);
      
      if (error) throw error;
      if (!result) return { data: [], nextPage: null };

      return {
        data: result.map(image => ({
          ...image,
          image_url: supabase.storage
            .from('user-images')
            .getPublicUrl(image.storage_path).data.publicUrl
        })),
        nextPage: (result.length === itemsPerPage && count > start + itemsPerPage) 
          ? { page: pageParam.page + 1 } 
          : undefined
      };
    },
    getNextPageParam: (lastPage) => lastPage?.nextPage,
    initialPageParam: { page: 0 }
  });

  const images = data?.pages?.flatMap(page => page.data) || [];

  return { 
    images, 
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  };
};
