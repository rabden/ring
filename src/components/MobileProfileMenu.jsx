import React from 'react';
import { Button } from "@/components/ui/button";
import { useSupabaseAuth } from '@/integrations/supabase/auth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/supabase';
import { useProUser } from '@/hooks/useProUser';
import { useProRequest } from '@/hooks/useProRequest';
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CreditCard, LogOut } from 'lucide-react';
import ProfileHeader from './profile/ProfileHeader';
import ProfileStats from './profile/ProfileStats';
import { useRealtimeProfile } from '@/hooks/useRealtimeProfile';
import { handleAvatarUpload } from '@/utils/profileUtils';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

const MobileProfileMenu = ({ user, credits, bonusCredits, activeTab }) => {
  const { logout } = useSupabaseAuth();
  const { data: isPro } = useProUser(user?.id);
  const { data: proRequest } = useProRequest(user?.id);
  const [isEditing, setIsEditing] = React.useState(false);
  const [displayName, setDisplayName] = React.useState('');
  const [showImageDialog, setShowImageDialog] = React.useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useRealtimeProfile(user?.id);

  const { data: followCounts = { followers: 0, following: 0 } } = useQuery({
    queryKey: ['followCounts', user?.id],
    queryFn: async () => {
      if (!user?.id) return { followers: 0, following: 0 };
      
      const [followersResult, followingResult] = await Promise.all([
        supabase
          .from('user_follows')
          .select('*', { count: 'exact' })
          .eq('following_id', user.id),
        supabase
          .from('user_follows')
          .select('*', { count: 'exact' })
          .eq('follower_id', user.id)
      ]);
      
      return {
        followers: followersResult.count || 0,
        following: followingResult.count || 0
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

  React.useEffect(() => {
    if (user) {
      setDisplayName(
        user.user_metadata?.display_name || 
        (user.email ? user.email.split('@')[0] : '') || 
        ''
      );
    }
  }, [user]);

  const handleDisplayNameUpdate = async () => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: { display_name: displayName }
      });

      if (error) throw error;

      await supabase
        .from('profiles')
        .update({ display_name: displayName })
        .eq('id', user.id);

      toast.success("Display name updated successfully");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update display name");
      console.error('Error updating display name:', error);
    }
  };

  const onAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    const newAvatarUrl = await handleAvatarUpload(file, user?.id);
    if (newAvatarUrl) {
      queryClient.invalidateQueries(['user']);
      setShowImageDialog(false);
    }
  };

  if (activeTab !== 'profile') return null;

  return (
    <div className="fixed inset-0 z-50 bg-background md:hidden">
      <div className="flex flex-col h-full">
        <div className="border-b px-4 py-3">
          <h2 className="text-lg font-semibold">Profile</h2>
        </div>
        <ScrollArea className="flex-1">
          {user ? (
            <div className="p-4 space-y-6">
              <ProfileHeader 
                user={user}
                isPro={isPro}
                displayName={displayName}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                setDisplayName={setDisplayName}
                onUpdate={handleDisplayNameUpdate}
                onAvatarEdit={() => setShowImageDialog(true)}
              />
              
              <ProfileStats 
                followersCount={followCounts.followers}
                followingCount={followCounts.following}
                totalLikes={totalLikes}
              />

              <div className="space-y-2">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Credits</span>
                    <span className="text-sm">{credits}+ B{bonusCredits}</span>
                  </div>
                </div>

                {!isPro && !proRequest && (
                  <Button 
                    variant="default" 
                    className="w-full bg-gradient-to-r from-yellow-300 via-yellow-500 to-amber-500 hover:from-yellow-400 hover:via-yellow-600 hover:to-amber-600"
                    onClick={() => toast.error("Pro request feature not implemented")}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Request Pro Access
                  </Button>
                )}
                {!isPro && proRequest && (
                  <div className="text-sm text-center text-muted-foreground p-3 bg-muted rounded-lg">
                    Pro request under review
                  </div>
                )}
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => logout()}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Log out
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center p-8 space-y-4">
              <Button 
                className="w-full" 
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
            </div>
          )}
        </ScrollArea>
      </div>

      <AlertDialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Profile Picture</AlertDialogTitle>
            <AlertDialogDescription>
              Would you like to upload a new profile picture?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = onAvatarUpload;
              input.click();
            }}>
              Upload
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MobileProfileMenu;