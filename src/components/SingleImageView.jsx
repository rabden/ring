import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/supabase';
import { Skeleton } from "@/components/ui/skeleton";
import { useSupabaseAuth } from '@/integrations/supabase/auth';
import { downloadImage } from '@/utils/downloadUtils';
import MobileImageView from '@/components/MobileImageView';
import FullScreenImageView from '@/components/FullScreenImageView';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from "@/lib/utils";

const SingleImageView = () => {
  const { imageId } = useParams();
  const navigate = useNavigate();
  const { session } = useSupabaseAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const { data: image, isLoading } = useQuery({
    queryKey: ['singleImage', imageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_images')
        .select('*')
        .eq('id', imageId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const handleDownload = async () => {
    if (!image) return;
    const imageUrl = supabase.storage.from('user-images').getPublicUrl(image.storage_path).data.publicUrl;
    await downloadImage(imageUrl, image.prompt);
  };

  if (isLoading) {
    return (
      <div className={cn(
        "min-h-screen p-4",
        "bg-background backdrop-blur-[2px]",
        "transition-all duration-300"
      )}>
        <Skeleton className={cn(
          "w-full h-[60vh]",
          "bg-muted/5",
          "animate-pulse"
        )} />
      </div>
    );
  }

  if (!image) {
    return (
      <div className={cn(
        "min-h-screen p-4",
        "bg-background backdrop-blur-[2px]",
        "transition-all duration-300"
      )}>
        <div className={cn(
          "flex items-center justify-center",
          "h-[60vh]",
          "bg-muted/5 border border-border/80",
          "text-sm text-muted-foreground/70"
        )}>
          Image not found
        </div>
      </div>
    );
  }

  return isMobile ? (
    <MobileImageView
      image={image}
      onClose={() => navigate(-1)}
      onDownload={handleDownload}
      isOwner={image.user_id === session?.user?.id}
      setActiveTab={() => {}}
      setStyle={() => {}}
      showFullImage={true}
    />
  ) : (
    <FullScreenImageView
      image={image}
      isOpen={true}
      onClose={() => navigate(-1)}
      onDownload={handleDownload}
      onDiscard={() => {}}
      isOwner={image.user_id === session?.user?.id}
      setStyle={() => {}}
      setActiveTab={() => {}}
    />
  );
};

export default SingleImageView;