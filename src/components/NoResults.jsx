
import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { supabase } from '@/integrations/supabase/supabase';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';
import { startOfWeek, startOfMonth } from 'date-fns';

const NoResults = () => {
  const [showTopImages, setShowTopImages] = useState(false);
  const [topImages, setTopImages] = useState([]);
  const [topSource, setTopSource] = useState('');

  useEffect(() => {
    // Show top images after 5 seconds (reduced from 10s)
    const timer = setTimeout(() => {
      setShowTopImages(true);
      fetchTopImages();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const fetchTopImages = async () => {
    try {
      // Try to fetch week's top images first
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 }).toISOString();
      
      let { data: weekData, error: weekError } = await supabase
        .from('user_images')
        .select('*')
        .gte('created_at', weekStart)
        .gt('like_count', 0)
        .eq('is_private', false)
        .order('like_count', { ascending: false })
        .limit(4);

      // Process weekData if it exists and has enough images
      if (weekData && weekData.length >= 4) {
        setTopImages(weekData.map(image => ({
          ...image,
          image_url: supabase.storage
            .from('user-images')
            .getPublicUrl(image.storage_path).data.publicUrl
        })));
        setTopSource('top-week');
        return;
      }

      // If not enough weekly images, try monthly
      const monthStart = startOfMonth(now).toISOString();
      let { data: monthData, error: monthError } = await supabase
        .from('user_images')
        .select('*')
        .gte('created_at', monthStart)
        .gt('like_count', 0)
        .eq('is_private', false)
        .order('like_count', { ascending: false })
        .limit(4);

      if (monthData && monthData.length >= 4) {
        setTopImages(monthData.map(image => ({
          ...image,
          image_url: supabase.storage
            .from('user-images')
            .getPublicUrl(image.storage_path).data.publicUrl
        })));
        setTopSource('top-month');
        return;
      }

      // If still not enough, use all-time
      let { data: allTimeData, error: allTimeError } = await supabase
        .from('user_images')
        .select('*')
        .gt('like_count', 0)
        .eq('is_private', false)
        .order('like_count', { ascending: false })
        .limit(4);

      if (allTimeData && allTimeData.length > 0) {
        setTopImages(allTimeData.map(image => ({
          ...image,
          image_url: supabase.storage
            .from('user-images')
            .getPublicUrl(image.storage_path).data.publicUrl
        })));
        setTopSource('top-all');
      }
    } catch (error) {
      console.error("Error fetching top images:", error);
    }
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center mx-auto",
      "transition-all duration-300",
      "mt-12 md:mt-0"
    )}>
      {!showTopImages ? (
        <>
          <div className="w-full">
            <DotLottieReact
              src="https://lottie.host/578388ec-9280-43b8-b22a-6adefde2f212/E8yaWCks1y.lottie"
              loop
              autoplay
              className="w-full rounded-lg overflow-hidden"
            />
          </div>

          <h2 className="text-xl font-semibold mb-2">Nothing Found</h2>
          <p className="text-sm text-muted-foreground/70 text-center">
            Explore something else or create something new
          </p>
        </>
      ) : (
        <>
          <h2 className="text-xl font-semibold mb-6">Discover Top Images</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-3xl mb-6">
            {topImages.map((image) => (
              <Link to={`/image/${image.id}`} key={image.id} className="block overflow-hidden rounded-lg transition-transform hover:scale-105">
                <img 
                  src={image.image_url} 
                  alt={image.prompt} 
                  className="w-full h-full object-cover"
                />
              </Link>
            ))}
          </div>
          
          <Button asChild variant="default" className="mb-4 mt-2 group">
            <Link to={`/inspiration#${topSource}`} className="flex items-center gap-1">
              View More in Inspiration 
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </Button>
        </>
      )}
    </div>
  );
};

export default NoResults;
