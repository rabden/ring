import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import ImageStatusIndicators from './ImageStatusIndicators';
import { useModelConfigs } from '@/hooks/useModelConfigs';
import { useQuery } from '@tanstack/react-query';
import { downloadImage } from '@/utils/downloadUtils';
import ImageCardActions from './ImageCardActions';
import { supabase } from '@/integrations/supabase/supabase';
import ImageDetailsDialog from './ImageDetailsDialog';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { handleImageDiscard } from '@/utils/discardUtils';
import ImageCardMedia from './image-card/ImageCardMedia';
import ImageCardBadges from './image-card/ImageCardBadges';
import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";
import HeartAnimation from './animations/HeartAnimation';

const ImageCard = ({ 
  image, 
  onDiscard = () => {}, 
  userId,
  isMobile,
  isLiked,
  onToggleLike = () => {},
}) => {
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const { data: modelConfigs } = useModelConfigs();
  const isMobileDevice = useMediaQuery('(max-width: 768px)');
  const navigate = useNavigate();

  const { data: likeCount = 0 } = useQuery({
    queryKey: ['imageLikes', image.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('user_image_likes')
        .select('*', { count: 'exact' })
        .eq('image_id', image.id);
      
      if (error) throw error;
      return count || 0;
    },
  });

  const handleImageClick = (e) => {
    e.preventDefault();
    navigate(`/image/${image.id}`);
  };

  const handleDownload = async () => {
    const imageUrl = supabase.storage.from('user-images').getPublicUrl(image.storage_path).data.publicUrl;
    await downloadImage(imageUrl, image.prompt);
  };

  const handleLike = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
    }, 800);
  };

  const handleDoubleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLiked) {
      handleLike();
      onToggleLike(image.id);
    }
  };

  const handleDiscard = async () => {
    try {
      setIsDeleted(true);
      await handleImageDiscard(image);
      onDiscard(image.id);
    } catch (error) {
      console.error('Error in handleDiscard:', error);
      setIsDeleted(false);
    }
  };

  if (isDeleted) return null;

  const isNsfw = modelConfigs?.[image.model]?.category === "NSFW";
  const modelName = modelConfigs?.[image.model]?.name || image.model;

  return (
    <>
      <div className="mb-2 group">
        <Card className={cn(
          "overflow-hidden rounded-2xl bg-card/95",
          "transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]",
          "relative"
        )}>
          <CardContent className="p-0 relative">
            <ImageStatusIndicators 
              isTrending={image.is_trending} 
              isHot={image.is_hot} 
            />
            <ImageCardMedia
              image={image}
              onImageClick={handleImageClick}
              onDoubleClick={handleDoubleClick}
            />
            <ImageCardBadges
              modelName={modelName}
              isNsfw={isNsfw}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <HeartAnimation isAnimating={isAnimating} />
            </div>
          </CardContent>
        </Card>
        <div className="mt-0.5 flex items-center justify-between gap-1">
          <p className={cn(
            "text-sm truncate w-[70%]",
            "text-muted-foreground/70 group-hover:text-muted-foreground/90",
            "transition-colors duration-200"
          )}>
            {image.prompt}
          </p>
          <ImageCardActions
            image={image}
            isMobile={isMobile}
            isLiked={isLiked}
            likeCount={likeCount}
            onToggleLike={(id) => {
              if (!isLiked) handleLike();
              onToggleLike(id);
            }}
            onViewDetails={() => setDetailsDialogOpen(true)}
            onDownload={handleDownload}
            onDiscard={handleDiscard}
            userId={userId}
          />
        </div>
      </div>

      <ImageDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        image={image}
      />
    </>
  );
};

export default ImageCard;