import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from '@/integrations/supabase/supabase';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Trash2, RefreshCw, ArrowLeft, Copy, Share2, Check, Wand2, RotateCw, Shield } from "lucide-react";
import { useModelConfigs } from '@/hooks/useModelConfigs';
import { useSupabaseAuth } from '@/integrations/supabase/auth';
import { useLikes } from '@/hooks/useLikes';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ImagePromptSection from './image-view/ImagePromptSection';
import ImageDetailsSection from './image-view/ImageDetailsSection';
import { handleImageDiscard } from '@/utils/discardUtils';
import HeartAnimation from './animations/HeartAnimation';
import ImageOwnerHeader from './image-view/ImageOwnerHeader';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from 'framer-motion';
import AdminDiscardDialog from './admin/AdminDiscardDialog';
import { useSimpleRemix } from '@/hooks/useSimpleRemix';

const MobileImageView = ({ 
  image, 
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
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { userLikes, toggleLike } = useLikes(session?.user?.id);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRotated, setIsRotated] = useState(false);
  const [imageStyle, setImageStyle] = useState({});
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const { remix } = useSimpleRemix();

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single();
      return data;
    },
    enabled: !!session?.user?.id
  });

  const isAdmin = userProfile?.is_admin || false;
  const showAdminDelete = isAdmin && !isOwner;

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

  const likeCount = image?.like_count || 0;

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
      if (isAdmin && !isOwner) {
        setIsAdminDialogOpen(true);
      } else {
        await handleImageDiscard(image, queryClient);
        onClose();
        if (onDiscard) {
          onDiscard(image.id);
        }
      }
    } catch (error) {
      console.error('Error in handleDiscard:', error);
    }
  };

  const handleAdminDiscard = async (reason) => {
    try {
      await handleImageDiscard(image, queryClient, true, reason);
      onClose();
      if (onDiscard) {
        onDiscard(image.id);
      }
    } catch (error) {
      console.error('Error in handleAdminDiscard:', error);
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
    
    if (image) {
      remix(image);
    }
  };

  const isLandscape = image?.width > image?.height;

  const handleImageClick = () => {
    if (!isFullscreen) {
      setIsRotated(false);
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleRotate = (e) => {
    e.stopPropagation();
    setIsRotated(!isRotated);
  };

  useEffect(() => {
    if (isFullscreen && imageRef.current) {
      const img = imageRef.current;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const isLandscape = image.width > image.height;

      if (isLandscape) {
        const aspectRatio = image.width / image.height;
        const rotatedAspectRatio = 1 / aspectRatio;
        
        let width = viewportHeight;
        let height = viewportHeight * rotatedAspectRatio;
        
        if (height > viewportWidth) {
          const scale = viewportWidth / height;
          width *= scale;
          height *= scale;
        }

        setImageStyle({
          transform: 'rotate(90deg)',
          width: `${height}px`,
          height: `${width}px`,
        });
      } else {
        const aspectRatio = image.width / image.height;
        let width = viewportWidth;
        let height = viewportWidth / aspectRatio;
        
        if (height > viewportHeight) {
          height = viewportHeight;
          width = height * aspectRatio;
        }

        setImageStyle({
          width: `${width}px`,
          height: `${height}px`,
          transform: 'none'
        });
      }
    } else {
      setImageStyle({});
    }
  }, [isFullscreen, image.width, image.height]);

  const detailItems = [
    { label: 'Model', value: modelConfigs?.[image.model]?.name || image.model },
    { label: 'Size', value: `${image.width}x${image.height}` },
    { label: 'Quality', value: image.quality },
    { label: 'Seed', value: image.seed },
    { label: 'Aspect Ratio', value: image.aspect_ratio },
    { label: 'Created', value: format(new Date(image.created_at), 'MMM d, yyyy h:mm a') }
  ];

  return (
    <>
      <div className={cn(
        "min-h-screen",
        "bg-background/95 backdrop-blur-[2px]",
        "transition-all duration-300"
      )}>
        {!isFullscreen && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className={cn(
              "fixed top-4 left-4 z-[60]",
              "h-8 w-8 p-0 rounded-lg",
              "bg-background/80 backdrop-blur-[2px]",
              "hover:bg-background/90",
              "transition-all duration-200"
            )}
          >
            <ArrowLeft className="h-5 w-5 text-foreground/70" />
          </Button>
        )}

        <ScrollArea 
          ref={containerRef}
          className={cn(
            isMobile ? "h-[100dvh]" : "h-screen",
            isFullscreen ? "overflow-hidden" : ""
          )}
        >
          <div className={cn(
            !isFullscreen && ["space-y-6 pb-6"]
          )}>
            {image && (
              <div 
                className={cn(
                  "relative",
                  isFullscreen && "fixed inset-0 z-50 bg-black/95",
                  "transition-all duration-300",
                  isFullscreen && "m-0 p-0"
                )}
                onClick={handleImageClick}
              >
                {isFullscreen && isLandscape && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRotate}
                    className={cn(
                      "absolute top-4 right-4 z-[70]",
                      "h-8 w-8 p-0 rounded-lg",
                      "bg-background/80 backdrop-blur-[2px]",
                      "hover:bg-background/90",
                      "transition-all duration-200"
                    )}
                  >
                    <RotateCw className={cn(
                      "h-4 w-4 text-foreground/70",
                      "transition-transform duration-300",
                      isRotated && "rotate-90"
                    )} />
                  </Button>
                )}

                <div className={cn(
                  "w-full h-full flex items-center justify-center",
                  isFullscreen && "min-h-screen",
                  isFullscreen && "m-0 p-0"
                )}>
                  <img
                    ref={imageRef}
                    src={supabase.storage.from('user-images').getPublicUrl(image.storage_path).data.publicUrl}
                    alt={image.prompt || 'Generated image'}
                    className={cn(
                      "object-contain transition-all duration-300",
                      !isFullscreen && "w-full h-auto",
                      isFullscreen && !isRotated && "max-h-[100vh] max-w-[100vw]",
                      isFullscreen && isRotated && isLandscape && [
                        "rotate-90",
                        "max-h-[100vw]",
                        "max-w-[100vh]",
                      ],
                      isFullscreen ? "cursor-zoom-out" : "cursor-zoom-in",
                      isFullscreen && "m-0 p-0"
                    )}
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
                </div>
              </div>
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
                        {(isOwner || showAdminDelete) && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={handleDiscardImage}
                            className={cn(
                              "flex-1 h-9 rounded-lg text-xs",
                              "bg-destructive/0 hover:bg-destructive/50",
                              "text-destructive/90 hover:text-destructive",
                              "transition-all duration-200"
                            )}
                          >
                            {showAdminDelete ? (
                              <>
                                <Shield className="mr-1.5 h-3.5 w-3.5" />
                                <span>Admin Delete</span>
                              </>
                            ) : (
                              <>
                                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                <span>Discard</span>
                              </>
                            )}
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={onDownload}
                          className={cn(
                            "flex-1 h-9 rounded-lg text-xs",
                            "bg-muted/0 hover:bg-accent/30",
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
                            "bg-muted/0 hover:bg-accent/30",
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

      <AdminDiscardDialog
        open={isAdminDialogOpen}
        onOpenChange={setIsAdminDialogOpen}
        onConfirm={handleAdminDiscard}
        imageOwnerName={owner?.display_name}
      />
    </>
  );
};

export default MobileImageView;
