import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/supabase';
import { Button } from "@/components/ui/button";
import { Download, Trash2, RefreshCw, ArrowLeft, ChevronsRight, ChevronsLeft, Shield } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import AdminDiscardDialog from './admin/AdminDiscardDialog';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { remixImage } from '@/utils/remixUtils';

const FullScreenImageView = ({ 
  image, 
  isOpen, 
  onClose,
  onDownload,
  onDiscard,
  onRemix,
  setStyle,
  setActiveTab
}) => {
  const { session } = useSupabaseAuth();
  const navigate = useNavigate();
  const { isAdmin } = useIsAdmin();
  
  const { data: modelConfigs } = useModelConfigs();
  const [copyIcon, setCopyIcon] = useState('copy');
  const [shareIcon, setShareIcon] = useState('share');
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const { userLikes, toggleLike } = useLikes(session?.user?.id);
  const queryClient = useQueryClient();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [showSidebarButton, setShowSidebarButton] = useState(false);

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

  const isOwner = image?.user_id === session?.user?.id;
  const showAdminDelete = isAdmin && !isOwner;

  const { data: owner } = useQuery({
    queryKey: ['user', image?.user_id],
    queryFn: async () => {
      if (!image?.user_id) return null;
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

  const handleDiscard = async () => {
    try {
      if (isAdmin && !isOwner) {
        setIsAdminDialogOpen(true);
      } else {
        await handleImageDiscard(image, queryClient);
        onClose();
      }
    } catch (error) {
      console.error('Error in handleDiscard:', error);
    }
  };

  const handleAdminDiscard = async (reason) => {
    try {
      await handleImageDiscard(image, queryClient, true, reason);
      onClose();
    } catch (error) {
      console.error('Error in handleAdminDiscard:', error);
    }
  };

  const handleRemixClick = () => {
    remixImage(image, navigate, session);
    onClose();
  };

  const detailItems = image ? [
    { label: "Model", value: modelConfigs?.[image.model]?.name || image.model },
    { label: "Seed", value: image.seed },
    { label: "Size", value: `${image.width}x${image.height}` },
    { label: "Aspect Ratio", value: image.aspect_ratio || "1:1" },
    { label: "Quality", value: image.quality },
    { label: "Created", value: format(new Date(image.created_at), 'MMM d, yyyy h:mm a') }
  ] : [];

  const handleLike = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
    }, 800);
  };

  const handleDoubleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userLikes?.includes(image?.id)) {
      handleLike();
      toggleLike(image?.id);
    }
  };

  useEffect(() => {
    let timeout;
    const handleMouseMove = (e) => {
      const screenWidth = window.innerWidth;
      const threshold = screenWidth - 350; // Show when cursor is within 100px of right edge
      
      if (e.clientX >= threshold) {
        setShowSidebarButton(true);
      } else {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          setShowSidebarButton(false);
        }, 300);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!image || !isOpen) return null;

  return (
    <>
      <div className={cn(
        "fixed inset-0 z-50",
        "bg-card/10 backdrop-blur-[2px]",
        "flex flex-col",
        "transition-opacity duration-300",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <div className={cn(
          "absolute left-8 top-8 z-50",
          "transition-all duration-300 transform",
          isSidebarOpen 
            ? "translate-x-0 opacity-100" 
            : "-translate-x-12 opacity-0 pointer-events-none"
        )}>
          <Button 
            variant="ghost" 
            onClick={onClose}
            className={cn(
              "group flex items-center gap-2 hover:gap-3",
              "transition-all duration-300 bg-accent/50 backdrop-blur-[15px] hover:bg-accent",
            )}
          >
            <ArrowLeft className="h-5 w-6 text-foreground" />
            <span className="hidden md:inline text-lg bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">Back</span>
          </Button>
        </div>
        
        <div className="flex h-full">
          <div className={cn(
            "flex-1 relative flex items-center justify-center",
            isSidebarOpen ? "p-3" : "p-0",
            "transition-all duration-300"
          )}>
            <img
              src={supabase.storage.from('user-images').getPublicUrl(image.storage_path).data.publicUrl}
              alt={image.prompt}
              className={cn(
                "max-w-full max-h-[calc(100vh-2rem)]",
                isSidebarOpen ? "" : "max-h-screen",
                "object-contain",
                "transition-all duration-300"
              )}
              onDoubleClick={handleDoubleClick}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <HeartAnimation isAnimating={isAnimating} />
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 z-10",
              "h-10 w-5 rounded-xl",
              "bg-background backdrop-blur-[2px]",
              "border-2 border-accent-40",
              "hover:bg-accent hover:border-card",
              "transition-all duration-100",
              isSidebarOpen ? "right-[370px]" : "right-2",
              !isSidebarOpen && !showSidebarButton && "opacity-0 pointer-events-none"
            )}
          >
            {isSidebarOpen ? (
              <ChevronsRight className="h-5 w-5" />
            ) : (
              <ChevronsLeft className="h-5 w-5" />
            )}
          </Button>

          <div 
            className={cn(
              "relative transition-all duration-300 ease-in-out transform",
              isSidebarOpen ? "w-[380px]" : "w-0 opacity-0"
            )}
          >
            <div className={cn(
              "h-[calc(100vh-24px)] rounded-lg mr-3 mt-3",
              "border border-border-20 bg-card/30",
              "backdrop-blur-[2px]",
              "shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
            )}>
              <ScrollArea className="h-full">
                <div className="p-3 space-y-4">
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
                            onClick={handleDiscard} 
                            variant="ghost" 
                            size="sm"
                            className={cn(
                              "flex-1 h-9 rounded-md text-xs",
                              "bg-muted/5 hover:bg-destructive/20",
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
                          onClick={() => onDownload(image.url, image.prompt)} 
                          variant="ghost" 
                          size="sm"
                          className={cn(
                            "flex-1 h-9 rounded-lg text-xs",
                            "bg-muted/5 hover:bg-muted/90",
                            "transition-all duration-200"
                          )}
                        >
                          <Download className="mr-1.5 h-3.5 w-3.5 text-foreground/70" />
                          <span>Download</span>
                        </Button>
                        <Button 
                          onClick={handleRemixClick} 
                          variant="ghost" 
                          size="sm"
                          className={cn(
                            "flex-1 h-9 rounded-lg text-xs",
                            "bg-muted/5 hover:bg-muted/90",
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
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
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

export default FullScreenImageView;
