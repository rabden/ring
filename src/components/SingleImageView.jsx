
import React, { useState } from 'react';
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
import ImageGallery from '@/components/ImageGallery';

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

  // Handler for clicking on other images
  const handleOtherImageClick = (clickedImage) => {
    // If we're already on the clicked image's page, just return
    if (clickedImage.id === imageId) return;
    
    // Navigate to the new image's page
    navigate(`/image/${clickedImage.id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 bg-background">
        <Skeleton className="w-full h-[60vh] bg-muted/5 animate-pulse" />
      </div>
    );
  }

  if (!image) {
    return (
      <div className="min-h-screen p-4 bg-background">
        <div className="flex items-center justify-center h-[60vh] bg-muted/5 border border-border/80 text-sm text-muted-foreground/70">
          Image not found
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* For desktop view, we use a scrollable approach */}
      {!isMobile ? (
        <div className="min-h-screen">
          {/* Main image section */}
          <div className="py-16 bg-background/80 backdrop-blur-sm">
            <div className="container mx-auto">
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
            </div>
          </div>
          
          {/* More images section */}
          <div className="w-full bg-background py-12">
            <div className="container mx-auto px-4 py-8">
              <h2 className="text-xl font-medium mb-6 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent flex items-center">
                More by this creator
              </h2>

              <div className="mt-4">
                <ImageGallery
                  userId={session?.user?.id}
                  profileUserId={image?.user_id}
                  activeView="myImages"
                  nsfwEnabled={false}
                  showPrivate={false}
                  onImageClick={handleOtherImageClick}
                  onDiscard={() => {}}
                  onRemix={() => {}}
                  onDownload={() => {}}
                  onViewDetails={handleOtherImageClick}
                  excludeImageId={imageId}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* For mobile view, we use a scrollable approach */
        <div>
          <MobileImageView
            image={image}
            onClose={() => navigate(-1)}
            onDownload={handleDownload}
            isOwner={image.user_id === session?.user?.id}
            setActiveTab={() => {}}
            setStyle={() => {}}
            showFullImage={true}
          />
          
          {/* More images section for mobile */}
          <div className="w-full bg-background pt-4">
            <div className="container mx-auto px-4 py-4">
              <h2 className="text-xl font-medium mb-4 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent flex items-center">
                More by this creator
              </h2>

              <div className="mt-4">
                <ImageGallery
                  userId={session?.user?.id}
                  profileUserId={image?.user_id}
                  activeView="myImages"
                  nsfwEnabled={false}
                  showPrivate={false}
                  onImageClick={handleOtherImageClick}
                  onDiscard={() => {}}
                  onRemix={() => {}}
                  onDownload={() => {}}
                  onViewDetails={handleOtherImageClick}
                  excludeImageId={imageId}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleImageView;
