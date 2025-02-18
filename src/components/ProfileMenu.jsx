import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useSupabaseAuth } from '@/integrations/supabase/auth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/supabase';
import { useProUser } from '@/hooks/useProUser';
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useRealtimeProfile } from '@/hooks/useRealtimeProfile';
import { handleAvatarUpload } from '@/utils/profileUtils';
import { useQueryClient } from '@tanstack/react-query';
import { LogOut, ChevronRight, Repeat } from 'lucide-react';
import ProfileAvatar from './profile/ProfileAvatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import CreditCounter from '@/components/ui/credit-counter';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const ProfileMenu = ({ 
  user, 
  credits, 
  bonusCredits, 
  isMobile,
  nsfwEnabled,
  setNsfwEnabled 
}) => {
  const { logout } = useSupabaseAuth();
  const [showImageDialog, setShowImageDialog] = useState(false);
  const { data: isPro } = useProUser(user?.id);
  const queryClient = useQueryClient();

  useRealtimeProfile(user?.id);

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) return null;
      return data;
    },
    enabled: !!user?.id
  });

  const { data: followCounts = { followers: 0, following: 0 } } = useQuery({
    queryKey: ['followCounts', user?.id],
    queryFn: async () => {
      if (!user?.id) return { followers: 0, following: 0 };
      
      const [followersResult, followingResult, imagesResult] = await Promise.all([
        supabase
          .from('user_follows')
          .select('*', { count: 'exact' })
          .eq('following_id', user.id),
        supabase
          .from('user_follows')
          .select('*', { count: 'exact' })
          .eq('follower_id', user.id),
        supabase
          .from('user_images')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id)
      ]);
      
      return {
        followers: followersResult.count || 0,
        following: followingResult.count || 0,
        totalImages: imagesResult.count || 0
      };
    },
    enabled: !!user?.id
  });

  const { data: totalLikes = 0 } = useQuery({
    queryKey: ['totalLikes', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const { count, error } = await supabase
        .from('user_image_likes')
        .select('*', { count: 'exact' })
        .eq('created_by', user.id);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id
  });

  const onAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const newAvatarUrl = await handleAvatarUpload(file, user?.id);
      if (newAvatarUrl) {
        queryClient.invalidateQueries(['user']);
        setShowImageDialog(false);
      }
    }
  };

  if (!user) return null;

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || '';

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
              "h-7 w-7 p-0 rounded-lg",
              "bg-muted/5 hover:bg-muted/10",
              "transition-all duration-200",
              isMobile && "h-10 w-10 p-2.5"
            )}
          >
            <ProfileAvatar 
              user={user} 
              avatarUrl={profile?.avatar_url}
              isPro={isPro}
              size={isMobile ? "sm" : "sm"} 
              showEditOnHover={false}
              className={cn(
                "w-full h-full rounded-lg",
                "transition-all duration-200",
                isMobile && "opacity-100"
              )}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className={cn(
            "w-80 p-4 m-4",
            "border-border bg-card",
            "animate-in fade-in-0 zoom-in-95 duration-200"
          )}
          align={isMobile ? "center" : "end"}
          side={isMobile ? "top" : "bottom"}
        >
          <div className="space-y-4">
            <Link 
              to="/userprofile" 
              className={cn(
                "flex items-center gap-3 group",
                "p-2 -m-2 rounded-xl",
                "bg-muted/20 hover:bg-muted/90",
                "transition-all duration-200"
              )}
            >
              <ProfileAvatar 
                user={user} 
                avatarUrl={profile?.avatar_url}
                isPro={isPro} 
                size="sm" 
                showEditOnHover={true}
                onClick={() => setShowImageDialog(true)}
                className="w-8 h-8 rounded-lg"
              />
              <div className="flex-1 flex flex-col justify-center min-w-0">
                <h4 className="text-sm font-medium text-foreground leading-tight truncate">{displayName}</h4>
                <p className="text-xs text-muted-foreground/80 leading-tight truncate">{user.email}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/80 group-hover:text-foreground transition-colors duration-200" />
            </Link>

            <CreditCounter credits={credits} bonusCredits={bonusCredits} />

            <div className={cn(
              "grid grid-cols-4 gap-2 p-3 rounded-xl",
              "transition-colors duration-200"
            )}>
              <div className="text-center">
                <span className="block text-sm font-medium text-foreground">{followCounts.followers}</span>
                <span className="text-xs text-muted-foreground/80">Followers</span>
              </div>
              <div className="text-center">
                <span className="block text-sm font-medium text-foreground">{followCounts.following}</span>
                <span className="text-xs text-muted-foreground/80">Following</span>
              </div>
              <div className="text-center">
                <span className="block text-sm font-medium text-foreground">{totalLikes}</span>
                <span className="text-xs text-muted-foreground/80">Likes</span>
              </div>
              <div className="text-center">
                <span className="block text-sm font-medium text-foreground">{followCounts.totalImages || 0}</span>
                <span className="text-xs text-muted-foreground/80">Images</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setNsfwEnabled(!nsfwEnabled)}
                className={cn(
                  "h-8 rounded-lg text-xs",
                  "transition-all duration-200",
                  nsfwEnabled ? (
                    "bg-destructive/5 hover:bg-destructive/10 text-destructive/90 hover:text-destructive"
                  ) : (
                    "bg-card hover:bg-background/50 text-primary/90 hover:text-primary"
                  )
                )}
              >
                {nsfwEnabled ? 'Unsafe' : 'Safe'}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => logout()}
                className={cn(
                  "h-8 rounded-lg text-xs",
                  "bg-destructive/5 hover:bg-destructive/10",
                  "text-destructive/90 hover:text-destructive",
                  "transition-all duration-200"
                )}
              >
                <LogOut className="w-3.5 h-3.5 mr-1.5" />
                Sign out
              </Button>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <AlertDialogContent className={cn(
          "sm:max-w-[400px]",
          "border-border/80 bg-card/95",
          "backdrop-blur-[2px]",
          "shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
        )}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-medium text-muted-foreground/70 uppercase tracking-wider">
              Change Profile Picture
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-foreground/90">
              Would you like to upload a new profile picture?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={cn(
              "h-8 rounded-lg text-sm",
              "bg-muted/5 hover:bg-muted/10",
              "transition-all duration-200"
            )}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = onAvatarUpload;
                input.click();
              }}
              className={cn(
                "h-8 rounded-lg text-sm",
                "bg-primary/90 hover:bg-primary/80",
                "transition-all duration-200"
              )}
            >
              Upload
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProfileMenu;