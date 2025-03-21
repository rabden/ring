
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { startOfWeek, startOfMonth, parseISO } from 'date-fns';
import { supabase } from '@/integrations/supabase/supabase';

export const useTopImagesRoute = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hasTopThisWeek, setHasTopThisWeek] = useState(true);
  const [hasTopThisMonth, setHasTopThisMonth] = useState(true);
  const [hasTopAllTime, setHasTopAllTime] = useState(true);

  useEffect(() => {
    const checkTopImages = async () => {
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 }).toISOString();
      const monthStart = startOfMonth(now).toISOString();

      // Check this week's top images
      const { data: weekData } = await supabase
        .from('user_images')
        .select('id')
        .gte('created_at', weekStart)
        .gt('like_count', 0)
        .limit(1);

      setHasTopThisWeek(weekData && weekData.length > 0);

      // Check this month's top images
      const { data: monthData } = await supabase
        .from('user_images')
        .select('id')
        .gte('created_at', monthStart)
        .gt('like_count', 0)
        .limit(1);

      setHasTopThisMonth(monthData && monthData.length > 0);

      // Check all time top images
      const { data: allTimeData } = await supabase
        .from('user_images')
        .select('id')
        .gt('like_count', 0)
        .limit(1);

      setHasTopAllTime(allTimeData && allTimeData.length > 0);
    };

    checkTopImages();
  }, []);

  // Handle route changes based on available top images
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    
    if (hash === 'top' || !hash) {
      // Preserve search parameters
      const searchParams = location.search;
      
      // Set default route based on available top images
      if (hasTopThisWeek) {
        navigate(`/inspiration#top-week${searchParams}`, { replace: true });
      } else if (hasTopThisMonth) {
        navigate(`/inspiration#top-month${searchParams}`, { replace: true });
      } else if (hasTopAllTime) {
        navigate(`/inspiration#top-all${searchParams}`, { replace: true });
      }
    }
  }, [location.hash, hasTopThisWeek, hasTopThisMonth, hasTopAllTime, navigate, location.search]);

  return {
    hasTopThisWeek,
    hasTopThisMonth,
    hasTopAllTime
  };
};
