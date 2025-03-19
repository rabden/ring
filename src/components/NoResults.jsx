
import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { supabase } from '@/integrations/supabase/supabase';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';
import { useImagePreloader } from '@/hooks/useImagePreloader';

const NoResults = () => {
  const [showTopImages, setShowTopImages] = useState(false);
  const [topImages, setTopImages] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [isPreloadComplete, setIsPreloadComplete] = useState(false);

  // First load the top images
  useEffect(() => {
    fetchTopAllTimeImages();
  }, []);

  // Use the image preloader hook
  const { isPreloading } = useImagePreloader(imageUrls);
  
  // Update preload status when images finish loading
  useEffect(() => {
    if (!isPreloading && imageUrls.length > 0) {
      setIsPreloadComplete(true);
    }
  }, [isPreloading, imageUrls]);

  // Setup UI alternating loop
  useEffect(() => {
    if (topImages.length === 0) return;
    
    // Start with Nothing Found UI
    setShowTopImages(false);
    
    // Setup the alternating loop
    const alternateUIs = () => {
      setShowTopImages(prev => !prev);
    };
    
    // Run the loop every 10 seconds
    const interval = setInterval(alternateUIs, 10000);
    
    return () => clearInterval(interval);
  }, [topImages.length]);

  const fetchTopAllTimeImages = async () => {
    try {
      // Fetch all-time top images directly
      let { data: allTimeData, error: allTimeError } = await supabase
        .from('user_images')
        .select('*')
        .gt('like_count', 0)
        .eq('is_private', false)
        .order('like_count', { ascending: false })
        .limit(4);

      if (allTimeData && allTimeData.length > 0) {
        const processedImages = allTimeData.map(image => ({
          ...image,
          image_url: supabase.storage
            .from('user-images')
            .getPublicUrl(image.storage_path).data.publicUrl
        }));
        
        setTopImages(processedImages);
        setImageUrls(processedImages.map(img => img.image_url));
      }
    } catch (error) {
      console.error("Error fetching top images:", error);
    }
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center mx-auto",
      "transition-all duration-500",
      "mt-12"
    )}>
      <div className={cn(
        "w-full transition-opacity duration-500 ease-in-out absolute mx-auto",
        showTopImages ? "opacity-0 pointer-events-none" : "opacity-100",
        "flex flex-col items-center justify-center" // Center content
      )}>
        <DotLottieReact
          src="https://lottie.host/578388ec-9280-43b8-b22a-6adefde2f212/E8yaWCks1y.lottie"
          loop
          autoplay
          className="w-full max-w-[700px] mx-auto overflow-hidden" // Centered with mx-auto
        />

        <h2 className="text-xl font-semibold mb-2 text-center">Nothing Found</h2>
        <p className="text-sm text-muted-foreground/70 text-center">
          Explore something else or create something new
        </p>
      </div>

      <div className={cn(
        "w-full transition-opacity duration-500 ease-in-out",
        showTopImages ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <h2 className="text-xl font-semibold mb-6 text-center">Discover Top Images</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1 w-full max-w-3xl mb-6 p-1 mx-auto">
          {topImages.map((image) => (
            <Link to={`/image/${image.id}`} key={image.id} className="block overflow-hidden rounded-lg aspect-square">
              <img 
                src={image.image_url} 
                alt={image.prompt} 
                className="w-full h-full object-cover transition-transform duration-300"
              />
            </Link>
          ))}
        </div>
        
        <div className="flex justify-center">
          <Button asChild variant="default" className="mb-4 mt-2 group">
            <Link to="/inspiration#top-all" className="flex items-center gap-1">
              View More in Inspiration 
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NoResults;
