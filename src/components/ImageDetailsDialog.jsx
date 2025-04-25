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

const ImageDetailsDialog = ({ open, onOpenChange, image, onDiscard }) => {
  const { data: modelConfigs } = useModelConfigs();
  const [copyIcon, setCopyIcon] = useState('copy');
  const [shareIcon, setShareIcon] = useState('share');
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const { session } = useSupabaseAuth();

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
