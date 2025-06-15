
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { MoreVertical, Download, Trash2, Wand2, Info, Shield } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import LikeButton from './LikeButton';
import { useSupabaseAuth } from '@/integrations/supabase/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from "@/lib/utils";
import ImagePromptSection from './image-view/ImagePromptSection';
import ImageDetailsSection from './image-view/ImageDetailsSection';
import AdminDiscardDialog from './admin/AdminDiscardDialog';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/supabase';
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from 'date-fns';
import { useModelConfigs } from '@/hooks/useModelConfigs';
import { remixImage } from '@/utils/remixUtils';

const ImageCardActions = ({ 
  image, 
  isMobile, 
  isLiked, 
  likeCount = 0, 
  onToggleLike = () => {},
  onViewDetails = () => {},
  onDownload = () => {},
  onDiscard = () => {},
  onAdminDiscard = () => {},
  userId,
  isAdmin = false
}) => {
  const { session } = useSupabaseAuth();
  const navigate = useNavigate();
  const isMobileDevice = useMediaQuery('(max-width: 768px)');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [copyIcon, setCopyIcon] = useState('copy');
  const [shareIcon, setShareIcon] = useState('share');
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const { data: modelConfigs } = useModelConfigs();

  const isOwner = image?.user_id === userId;
  const showAdminDelete = isAdmin && !isOwner;

  const { data: ownerProfile } = useQuery({
    queryKey: ['user', image?.user_id],
    queryFn: async () => {
      if (!image?.user_id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', image.user_id)
        .single();
      return data;
    },
    enabled: !!image?.user_id
  });

  const handleViewDetails = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isMobileDevice) {
      setIsDrawerOpen(true);
    } else {
      onViewDetails(image);
    }
  };

  const handleDiscard = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!image?.id) return;
    
    if (isAdmin && image.user_id !== userId) {
      setIsAdminDialogOpen(true);
    } else {
      onDiscard(image);
    }
    
    setIsDrawerOpen(false);
  };

  const handleAdminDiscard = (reason) => {
    setIsAdminDialogOpen(false);
    if (onAdminDiscard) {
      onAdminDiscard(image, reason);
    }
  };

  const handleDownload = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDownload(image);
    setIsDrawerOpen(false);
  };

  const handleRemixClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    remixImage(image, navigate, session);
    setIsDrawerOpen(false);
  };

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
      <div className="flex items-center gap-1 px-1" onClick={e => e.stopPropagation()}>
        {session && (
          <div className="flex items-center gap-2">
            <LikeButton 
              isLiked={isLiked} 
              onToggle={() => onToggleLike(image.id)}
            />
            <span className={cn(
              "text-xs text-muted-foreground/60 group-hover:text-muted-foreground/80",
              "transition-colors duration-200"
            )}>
              {likeCount}
            </span>
          </div>
        )}

        {isMobileDevice ? (
          <>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleViewDetails}
              className={cn(
                "h-7 w-7 p-0 rounded-lg",
                "bg-muted/5 hover:bg-muted/10",
                "transition-all duration-200"
              )}
            >
              <MoreVertical className="h-4 w-4 text-foreground/70" />
            </Button>

            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
              <DrawerContent className="focus:outline-none">
                <DrawerHeader className="px-2 py-2">
                  <DrawerTitle className="text-base font-medium text-foreground/90">Image Details</DrawerTitle>
                </DrawerHeader>
                <ScrollArea className="max-h-[85vh] overflow-y-auto px-2 py-2">
                  <div className="space-y-6">
                    <div className="flex gap-1 mt-2">
                      {(isOwner || showAdminDelete) && (
                        <Button 
                          onClick={handleDiscard}
                          variant="ghost" 
                          size="sm"
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
                        onClick={handleDownload}
                        variant="ghost" 
                        size="sm"
                        className={cn(
                          "flex-1 h-9 rounded-lg text-xs",
                          "bg-muted/5 hover:bg-accent/30",
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
                          "bg-muted/5 hover:bg-accent/30",
                          "transition-all duration-200"
                        )}
                      >
                        <Wand2 className="mr-1.5 h-3.5 w-3.5 text-foreground/70" />
                        <span>Remix</span>
                      </Button>
                    </div>

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
              </DrawerContent>
            </Drawer>
          </>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className={cn(
                  "h-7 w-7 p-0 rounded-lg",
                  "bg-muted/5 hover:bg-muted/10",
                  "transition-all duration-200"
                )}
              >
                <MoreVertical className="h-4 w-4 text-foreground/70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end"
              className={cn(
                "w-52 p-2 m-2",
                "border-border/80 bg-card",
                "animate-in fade-in-0 zoom-in-95 duration-200"
              )}
            >
              <DropdownMenuItem 
                onClick={handleDownload}
                className={cn(
                  "flex items-center gap-3 py-2 px-3 rounded-lg",
                  "cursor-pointer transition-colors duration-200",
                  "hover:bg-accent/30 focus:bg-background/50",
                  "group"
                )}
              >
                <Download className="h-4 w-4 text-muted-foreground/70 group-hover:text-foreground/90 transition-colors duration-200" />
                <span className="text-sm font-medium text-foreground/90">Download</span>
              </DropdownMenuItem>

              {session && (
                <>
                  <DropdownMenuSeparator className="my-2 bg-border/80" />
                  
                  {image.user_id === userId && (
                    <DropdownMenuItem 
                      onClick={handleDiscard}
                      className={cn(
                        "flex items-center gap-3 py-2 px-3 rounded-lg mb-2",
                        "cursor-pointer transition-colors duration-200",
                        "hover:bg-destructive/50 focus:bg-destructive/10",
                        "text-destructive/90 hover:text-destructive",
                        "group"
                      )}
                    >
                      <Trash2 className="h-4 w-4 transition-colors duration-200 text-destructive" />
                      <span className="text-sm font-medium text-destructive">Discard</span>
                    </DropdownMenuItem>
                  )}
                  
                  {showAdminDelete && (
                    <DropdownMenuItem 
                      onClick={handleDiscard}
                      className={cn(
                        "flex items-center gap-3 py-2 px-3 rounded-lg mb-2",
                        "cursor-pointer transition-colors duration-200",
                        "hover:bg-destructive/50 focus:bg-destructive/10",
                        "text-destructive/90 hover:text-destructive",
                        "group"
                      )}
                    >
                      <Shield className="h-4 w-4 transition-colors duration-200 text-destructive" />
                      <span className="text-sm font-medium text-destructive">Admin Delete</span>
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuItem 
                    onClick={handleRemixClick}
                    className={cn(
                      "flex items-center gap-3 py-2 px-3 rounded-lg",
                      "cursor-pointer transition-colors duration-200",
                      "hover:bg-accent/30 focus:bg-background/50",
                      "group"
                    )}
                  >
                    <Wand2 className="h-4 w-4 text-muted-foreground/70 group-hover:text-foreground/90 transition-colors duration-200" />
                    <span className="text-sm font-medium text-foreground/90">Remix</span>
                  </DropdownMenuItem>
                </>
              )}

              <DropdownMenuSeparator className="my-2 bg-border/80" />
              <DropdownMenuItem 
                onClick={handleViewDetails}
                className={cn(
                  "flex items-center gap-3 py-2 px-3 rounded-lg",
                  "cursor-pointer transition-colors duration-200",
                  "hover:bg-accent/30 focus:bg-background/50",
                  "group"
                )}
              >
                <Info className="h-4 w-4 text-muted-foreground/70 group-hover:text-foreground/90 transition-colors duration-200" />
                <span className="text-sm font-medium text-foreground/90">View Details</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <AdminDiscardDialog
        open={isAdminDialogOpen}
        onOpenChange={setIsAdminDialogOpen}
        onConfirm={handleAdminDiscard}
        imageOwnerName={ownerProfile?.display_name}
      />
    </>
  );
};

export default ImageCardActions;
