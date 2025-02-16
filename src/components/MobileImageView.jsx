import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from '@/integrations/supabase/supabase';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Trash2, RefreshCw, ArrowLeft, Copy, Share2, Check, Wand2 } from "lucide-react";
import { useModelConfigs } from '@/hooks/useModelConfigs';
import { useSupabaseAuth } from '@/integrations/supabase/auth';
import { useLikes } from '@/hooks/useLikes';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ImagePromptSection from './image-view/ImagePromptSection';
import ImageDetailsSection from './image-view/ImageDetailsSection';
import { handleImageDiscard } from '@/utils/discardUtils';
import { useImageRemix } from '@/hooks/useImageRemix';
import HeartAnimation from './animations/HeartAnimation';
import ImageOwnerHeader from './image-view/ImageOwnerHeader';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from 'framer-motion';

const MobileImageView = ({ 
  image, 
  isOpen, 
  onClose,
  onDownload,
  onDiscard,
  onRemix,
  isOwner,
  isPro = false
}) => {
  const { session } = useSupabaseAuth();
  const { data: modelConfigs } = useModelConfigs();
  const [copyIcon, setCopyIcon] = useState('copy');
  const [shareIcon, setShareIcon] = useState('share');
  const [isAnimating, setIsAnimating] = useState(false);
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();
  const { handleRemix } = useImageRemix(session, onRemix, onClose, isPro);
  const queryClient = useQueryClient();
  const { userLikes, toggleLike } = useLikes(session?.user?.id);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const imageRef = useRef(null);
  const [targetDimensions, setTargetDimensions] = useState(null);
  const [imagePosition, setImagePosition] = useState(null);
  const containerRef = useRef(null);

  const getImageUrl = () => {
    if (!image?.storage_path) return null;
    try {
      const { data } = supabase.storage.from('user-images').getPublicUrl(image.storage_path);
      return data?.publicUrl;
    } catch (error) {
      console.error('Error getting image URL:', error);
      return null;
    }
  };

  const imageUrl = getImageUrl();

  const { data: owner } = useQuery({
    queryKey: ['user', image?.user_id],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', image.user_id)
        .single();
      return data;
    },
    enabled: !!image?.user_id
  });

  const { data: likeCount = 0 } = useQuery({
    queryKey: ['likes', image?.id],
    queryFn: async () => {
      const { count } = await supabase
        .from('user_image_likes')
        .select('*', { count: 'exact' })
        .eq('image_id', image.id);
      return count;
    },
    enabled: !!image?.id
  });

  const handleCopyPrompt = async () => {
    await navigator.clipboard.writeText(image.user_prompt || image.prompt);
    setCopyIcon('check');
    setTimeout(() => setCopyIcon('copy'), 1500);
  };

  const handleShare = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/image/${image.id}`);
    setShareIcon('check');
    setTimeout(() => setShareIcon('share'), 1500);
  };

  const handleDiscardImage = async () => {
    try {
      await handleImageDiscard(image, queryClient);
      onClose();
      if (onDiscard) {
        onDiscard(image.id);
      }
    } catch (error) {
      console.error('Error in handleDiscard:', error);
    }
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
    if (!userLikes?.includes(image.id)) {
      handleLike();
      toggleLike(image.id);
    }
  };

  const handleRemixClick = () => {
    if (!session) {
      toast.error('Please sign in to remix images');
      return;
    }
    navigate(`/?remix=${image.id}#imagegenerate`, { replace: true });
  };

  const calculateImageTransform = () => {
    if (!imageRef.current || !containerRef.current) return null;
  
    const img = imageRef.current;
    const rect = img.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    let scale, targetX, targetY;
  
    if (rect.width > rect.height) {
      // For landscape images: fit horizontally
      scale = viewportWidth / rect.width;
      targetX = 0;
      targetY = (viewportHeight - rect.height * scale) / 2;
    } else {
      // For non-landscape images: fit entirely in the viewport
      const scaleX = viewportWidth / rect.width;
      const scaleY = viewportHeight / rect.height;
      scale = Math.min(scaleX, scaleY);
      targetX = (viewportWidth - rect.width * scale) / 2;
      targetY = (viewportHeight - rect.height * scale) / 2;
    }
  
    return {
      originX: rect.left,
      originY: rect.top,
      originWidth: rect.width,
      originHeight: rect.height,
      scale,
      targetX,
      targetY
    };
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      const transform = calculateImageTransform();
      setImagePosition(transform);
    } else {
      setImagePosition(null);
    }
    setIsFullscreen(!isFullscreen);
  };

  const detailItems = [
    { label: 'Model', value: modelConfigs?.[image.model]?.name || image.model },
    { label: 'Size', value: `${image.width}x${image.height}` },
    { label: 'Quality', value: image.quality },
    { label: 'Seed', value: image.seed },
    { label: 'Aspect Ratio', value: image.aspect_ratio },
    { label: 'Created', value: format(new Date(image.created_at), 'MMM d, yyyy h:mm a') }
  ];

  return (
    <div className={cn(
      "min-h-screen",
      "bg-background/95 backdrop-blur-[2px]",
      "transition-all duration-300"
    )}>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onClose} 
        className={cn(
          "fixed top-4 left-4 z-50",
          "h-8 w-8 p-0 rounded-lg",
          "bg-background/80 backdrop-blur-[2px]",
          "hover:bg-background/90",
          "transition-all duration-200"
        )}
      >
        <ArrowLeft className="h-5 w-5 text-foreground/70" />
      </Button>

      <ScrollArea 
        ref={containerRef}
        className={cn(
        isMobile ? "h-[100dvh]" : "h-screen",
        isFullscreen ? "overflow-hidden" : ""
      )}>
        <div className="space-y-6 pb-6">
          {image && (
            <motion.div
              className={cn(
                "relative",
                isFullscreen ? "fixed inset-0 z-50 bg-black/90" : "relative",
                "transition-none" // Remove default transitions
              )}
              onClick={toggleFullscreen}
            >
              <motion.img
                ref={imageRef}
                src={supabase.storage.from('user-images').getPublicUrl(image.storage_path).data.publicUrl}
                alt={image.prompt || 'Generated image'}
                initial={false}
                animate={
                  isFullscreen && imagePosition
                    ? {
                        position: 'fixed',
                        top: imagePosition.targetY,
                        left: imagePosition.targetX,
                        width: imagePosition.originWidth,
                        height: imagePosition.originHeight,
                        scale: imagePosition.scale,
                        transition: {
                          duration: 0.3,
                          ease: [0.4, 0, 0.2, 1] // Custom ease for smooth animation
                        }
                      }
                    : {
                        position: 'relative',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: 'auto',
                        scale: 1,
                        transition: {
                          duration: 0.3,
                          ease: [0.4, 0, 0.2, 1]
                        }
                      }
                }
                className={cn(
                  "origin-top-left", // Important for scale animation
                  "object-contain",
                  isFullscreen ? "cursor-zoom-out" : "cursor-zoom-in"
                )}
                loading="eager"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  if (!isFullscreen) {
                    handleDoubleClick(e);
                  }
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <HeartAnimation isAnimating={isAnimating} />
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {!isFullscreen && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="px-3 space-y-4"
              >
                {session && (
                  <>
                    <ImageOwnerHeader 
                      owner={owner}
                      image={image}
                      isOwner={isOwner}
                      userLikes={userLikes}
                      toggleLike={toggleLike}
                      likeCount={likeCount}
                      onLike={handleLike}
                    />
                    
                    <div className="flex gap-1.5">
                      {isOwner && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={handleDiscardImage}
                          className={cn(
                            "flex-1 h-9 rounded-lg text-xs",
                            "bg-destructive/5 hover:bg-destructive/10",
                            "text-destructive/90 hover:text-destructive",
                            "transition-all duration-200"
                          )}
                        >
                          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                          <span>Discard</span>
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={onDownload}
                        className={cn(
                          "flex-1 h-9 rounded-lg text-xs",
                          "bg-muted/5 hover:bg-muted/50",
                          "transition-all duration-200"
                        )}
                      >
                        <Download className="mr-1.5 h-3.5 w-3.5 text-foreground/70" />
                        <span>Download</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={handleRemixClick}
                        className={cn(
                          "flex-1 h-9 rounded-lg text-xs",
                          "bg-muted/5 hover:bg-muted/50",
                          "transition-all duration-200"
                        )}
                      >
                        <RefreshCw className="mr-1.5 h-3.5 w-3.5 text-foreground/70" />
                        <span>Remix</span>
                      </Button>
                    </div>
                  </>
                )}

                <ImagePromptSection 
                  prompt={image.user_prompt || image.prompt}
                  negative_prompt={image.negative_prompt}
                  copyIcon={copyIcon}
                  shareIcon={shareIcon}
                  onCopyPrompt={handleCopyPrompt}
                  onShare={handleShare}
                />

                <ImageDetailsSection detailItems={detailItems} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  );
};

export default MobileImageView;