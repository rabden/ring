
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useModelConfigs } from '@/hooks/useModelConfigs'
import { format } from 'date-fns'
import { cn } from "@/lib/utils"
import ImagePromptSection from './image-view/ImagePromptSection'
import ImageDetailsSection from './image-view/ImageDetailsSection'
import AdminDiscardDialog from './admin/AdminDiscardDialog'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/supabase'
import { toast } from 'sonner'
import { useSupabaseAuth } from '@/integrations/supabase/auth'
import { useIsAdmin } from '@/hooks/useIsAdmin'
import { useSimpleRemix } from '@/hooks/useSimpleRemix'
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

const ImageDetailsDialog = ({ open, onOpenChange, image, onDiscard }) => {
  const { data: modelConfigs } = useModelConfigs();
  const [copyIcon, setCopyIcon] = useState('copy');
  const [shareIcon, setShareIcon] = useState('share');
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const { session } = useSupabaseAuth();
  const { isAdmin } = useIsAdmin();
  const { remix } = useSimpleRemix();

  const isOwner = image?.user_id === session?.user?.id;
  const showAdminDelete = isAdmin && !isOwner;

  if (!image) return null;

  const detailItems = [
    { label: "Model", value: modelConfigs?.[image.model]?.name || image.model },
    { label: "Seed", value: image.seed },
    { label: "Size", value: `${image.width}x${image.height}` },
    { label: "Aspect Ratio", value: image.aspect_ratio },
    { label: "Quality", value: image.quality },
    { label: "Created", value: format(new Date(image.created_at), 'MMM d, yyyy h:mm a') }
  ];

  const handleCopyPrompt = async () => {
    await navigator.clipboard.writeText(image.prompt);
    setCopyIcon('check');
    setTimeout(() => setCopyIcon('copy'), 1500);
  };

  const handleShare = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/image/${image.id}`);
    setShareIcon('check');
    setTimeout(() => setShareIcon('share'), 1500);
  };

  const { data: owner } = useQuery({
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

  const handleAdminDiscard = (reason) => {
    setIsAdminDialogOpen(false);
    if (onDiscard) {
      onDiscard(reason);
    }
  };

  const handleRemixClick = () => {
    if (!session) {
      toast.error('Please sign in to remix images');
      return;
    }
    
    if (image) {
      remix(image);
      onOpenChange(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={cn(
          "sm:max-w-[500px] max-h-[80vh] overflow-hidden",
          "border-border/80 bg-card",
          "p-4 md:p-6 rounded-lg"
        )}>
          <DialogHeader className="px-2">
            <DialogTitle className="text-sm font-semibold text-foreground/90 uppercase tracking-wide">Image Details</DialogTitle>
          </DialogHeader>
          <ScrollArea className="mt-6 max-h-[calc(80vh-80px)]">
            <div className="space-y-6 px-2">
              {session && (
                <div className="flex gap-2">
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
                    <RefreshCw className="mr-1.5 h-3.5 w-3.5 text-foreground/70" />
                    <span>Remix</span>
                  </Button>
                </div>
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
              
              {(isOwner || showAdminDelete) && (
                <button
                  onClick={() => setIsAdminDialogOpen(true)}
                  className="text-red-500 hover:text-red-600"
                >
                  {showAdminDelete ? 'Admin Delete' : 'Delete'}
                </button>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <AdminDiscardDialog
        open={isAdminDialogOpen}
        onOpenChange={setIsAdminDialogOpen}
        onConfirm={handleAdminDiscard}
        imageOwnerName={owner?.display_name}
      />
    </>
  );
};

export default ImageDetailsDialog;
