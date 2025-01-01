import React, { useState } from 'react';
import { useSupabaseAuth } from '@/integrations/supabase/auth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/supabase';
import { useProUser } from '@/hooks/useProUser';
import { toast } from "sonner";
import { Button } from '@/components/ui/button';
import { ArrowLeft, LogOut, Pencil, Repeat, Calendar, Star, CreditCard, Image, Lock, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import LoadingScreen from '@/components/LoadingScreen';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { handleAvatarUpload } from '@/utils/profileUtils';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import CreditCounter from "@/components/ui/credit-counter";
import ProfileStats from "@/components/profile/ProfileStats";
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useProRequest } from '@/hooks/useProRequest';
import ImageGallery from '@/components/ImageGallery';
import FullScreenImageView from '@/components/FullScreenImageView';
import { Card } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import ProfileAvatar from '@/components/profile/ProfileAvatar';

const SettingsCard = ({ title, children, icon: Icon, isPro, rightHeader, topLeftText }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-2xl border border-border bg-card text-card-foreground relative overflow-hidden"
  >
    <div className="p-4 md:p-6 relative">
      {topLeftText && (
        <span className="absolute top-3 md:top-4 left-4 md:left-6 text-xs text-muted-foreground/70">
          {topLeftText}
        </span>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
        {rightHeader}
      </div>
    </div>
    <div className="p-4 md:p-6 pt-0 relative">
      {children}
    </div>
  </motion.div>
);

const ProfileSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center space-x-4">
      <Skeleton className="h-16 w-16 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[150px]" />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Skeleton className="h-[200px] rounded-xl" />
      <Skeleton className="h-[200px] rounded-xl" />
    </div>
  </div>
);

const UserCard = ({ user }) => {
  const navigate = useNavigate();
  const { data: userStats } = useQuery({
    queryKey: ['userCardStats', user.id],
    queryFn: async () => {
      const [imagesResult, likesResult, followersResult] = await Promise.all([
        supabase
          .from('user_images')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id),
        supabase
          .from('user_image_likes')
          .select('*', { count: 'exact' })
          .eq('created_by', user.id),
        supabase
          .from('user_follows')
          .select('*', { count: 'exact' })
          .eq('following_id', user.id)
      ]);

      return {
        totalImages: imagesResult.count || 0,
        totalLikes: likesResult.count || 0,
        followers: followersResult.count || 0
      };
    }
  });

  return (
    <Card 
      className="min-w-[180px] p-2 cursor-pointer bg-muted/5 hover:bg-muted/10 transition-all duration-300 group border-border/50"
      onClick={() => navigate(`/profile/${user.id}`)}
    >
      <div className="flex items-center gap-2">
        <Avatar className="h-7 w-7 rounded-full">
          <AvatarImage src={user.avatar_url} alt={user.display_name} />
          <AvatarFallback>{user.display_name?.[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate text-xs group-hover:text-primary transition-colors">{user.display_name}</p>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span>{userStats?.totalImages || 0} images</span>
            <span className="text-muted-foreground/40">•</span>
            <span>{userStats?.followers || 0} followers</span>
          </div>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
      </div>
    </Card>
  );
};

const UserSection = ({ title, users = [], icon: Icon }) => {
  if (users.length === 0) return null;

  return (
    <SettingsCard 
      title={`${title} (${users.length})`}
      icon={Icon}
    >
      <div className="overflow-x-auto scrollbar-none -mx-6 px-6 -mt-2">
        <div className="flex gap-1.5 pb-1">
          {users.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      </div>
    </SettingsCard>
  );
};

const UserCarousel = ({ title, users = [] }) => {
  if (users.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{title}</h3>
      <div className="relative">
        <Carousel
          opts={{
            align: "start",
            loop: true
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {users.map((user) => (
              <CarouselItem key={user.id} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                <UserCard user={user} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </div>
  );
};

const UserProfile = () => {
  const { session, loading, logout } = useSupabaseAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [tempDisplayName, setTempDisplayName] = useState('');
  const { data: isPro } = useProUser(session?.user?.id);
  const { data: isProRequest } = useProRequest(session?.user?.id);
  const [selectedImage, setSelectedImage] = useState(null);

  React.useEffect(() => {
    if (session?.user) {
      const name = session.user?.user_metadata?.display_name || session.user?.email?.split('@')[0] || '';
      setDisplayName(name);
      setTempDisplayName(name);
    }
  }, [session]);

  const { data: userStats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['userStats', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      try {
        const [followersResult, followingResult, likesResult, profileResult, imagesResult] = await Promise.all([
          supabase
            .from('user_follows')
            .select('*', { count: 'exact' })
            .eq('following_id', session.user.id),
          supabase
            .from('user_follows')
            .select('*', { count: 'exact' })
            .eq('follower_id', session.user.id),
          supabase
            .from('user_image_likes')
            .select('*', { count: 'exact' })
            .eq('created_by', session.user.id),
          supabase
            .from('profiles')
            .select('credit_count, bonus_credits, followers_count, following_count')
            .eq('id', session.user.id)
            .single(),
          supabase
            .from('user_images')
            .select('*', { count: 'exact' })
            .eq('user_id', session.user.id)
        ]);

        return {
          followers: profileResult.data?.followers_count || 0,
          following: profileResult.data?.following_count || 0,
          likes: likesResult.count || 0,
          credits: profileResult.data?.credit_count || 0,
          bonusCredits: profileResult.data?.bonus_credits || 0,
          totalImages: imagesResult.count || 0
        };
      } catch (error) {
        console.error('Error fetching user stats:', error);
        return {
          followers: 0,
          following: 0,
          likes: 0,
          credits: 0,
          bonusCredits: 0,
          totalImages: 0
        };
      }
    },
    enabled: !!session?.user?.id
  });

  const { data: followData } = useQuery({
    queryKey: ['followData', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return { followers: [], following: [] };

      const [followersResult, followingResult] = await Promise.all([
        supabase
          .from('user_follows')
          .select('profiles!user_follows_follower_id_fkey(*)')
          .eq('following_id', session.user.id),
        supabase
          .from('user_follows')
          .select('profiles!user_follows_following_id_fkey(*)')
          .eq('follower_id', session.user.id)
      ]);

      return {
        followers: followersResult.data?.map(f => f.profiles) || [],
        following: followingResult.data?.map(f => f.profiles) || []
      };
    },
    enabled: !!session?.user?.id
  });

  const handleDisplayNameUpdate = async () => {
    if (tempDisplayName.trim() === displayName.trim()) {
      setIsEditing(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        data: { display_name: tempDisplayName }
      });

      if (error) throw error;

      await supabase
        .from('profiles')
        .update({ display_name: tempDisplayName })
        .eq('id', session.user.id);

      setDisplayName(tempDisplayName);
      toast.success("Display name updated successfully");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update display name");
      console.error('Error updating display name:', error);
    }
  };

  const onAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const newAvatarUrl = await handleAvatarUpload(file, session.user.id);
      if (newAvatarUrl) {
        toast.success("Profile picture updated successfully");
      }
    }
  };

  const { data: profile } = useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error) return null;
      return data;
    },
    enabled: !!session?.user?.id
  });

  if (loading || isStatsLoading) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <ProfileSkeleton />
      </div>
    );
  }

  if (!session) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container max-w-5xl mx-auto py-6 px-1 space-y-4"
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link 
            to="/" 
            className="group flex items-center gap-2 hover:gap-3 transition-all duration-300"
          >
            <ArrowLeft className="h-5 w-5 text-primary transition-colors" />
            <span className="text-2xl font-medium bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
              Settings
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SettingsCard 
            title="Basic Information" 
            icon={Star}
            topLeftText={profile?.created_at ? `Joined ${new Date(profile.created_at).toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric'
            })}` : ''}
            rightHeader={
              <div className="relative">
                <ProfileAvatar 
                  user={session.user} 
                  avatarUrl={profile?.avatar_url}
                  isPro={isPro}
                  size="md"
                  showEditOnHover={false}
                  className="ring-2 ring-border ring-offset-2 ring-offset-background"
                />
                <label className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90 transition-colors">
                  <Repeat className="w-3.5 h-3.5" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={onAvatarUpload}
                  />
                </label>
              </div>
            }
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-base">Name</span>
                <div className="flex items-center gap-2">
                  <span className="text-base text-muted-foreground">{displayName}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditing(true)}
                    className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base">Email</span>
                <span className="text-base text-muted-foreground">{session.user.email}</span>
              </div>
            </div>
          </SettingsCard>

          <SettingsCard 
            title="Stats" 
            icon={CreditCard} 
            rightHeader={
              <div className="flex items-center gap-2">
                {isPro ? (
                  <span className="text-xs bg-gradient-to-r from-orange-500 via-purple-500 to-pink-500 text-white px-2 py-1 rounded-full">
                    Pro
                  </span>
                ) : isProRequest ? (
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                    Requested
                  </span>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs hover:bg-muted/50"
                    onClick={async () => {
                      try {
                        await supabase
                          .from('profiles')
                          .update({ is_pro_request: true })
                          .eq('id', session.user.id);
                        toast.success("Pro request submitted");
                      } catch (error) {
                        toast.error("Failed to submit request");
                      }
                    }}
                  >
                    Upgrade
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="h-7 text-xs bg-destructive/5 hover:bg-destructive/10 text-destructive/90 hover:text-destructive"
                >
                  <LogOut className="w-3.5 h-3.5 mr-1.5" />
                  Sign out
                </Button>
              </div>
            }
          >
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center">
                  <span className="block text-sm font-medium text-foreground">{userStats?.followers || 0}</span>
                  <span className="text-xs text-muted-foreground/80">Followers</span>
                </div>
                <div className="text-center">
                  <span className="block text-sm font-medium text-foreground">{userStats?.following || 0}</span>
                  <span className="text-xs text-muted-foreground/80">Following</span>
                </div>
                <div className="text-center">
                  <span className="block text-sm font-medium text-foreground">{userStats?.likes || 0}</span>
                  <span className="text-xs text-muted-foreground/80">Likes</span>
                </div>
                <div className="text-center">
                  <span className="block text-sm font-medium text-foreground">{userStats?.totalImages || 0}</span>
                  <span className="text-xs text-muted-foreground/80">Images</span>
                </div>
              </div>

              <CreditCounter 
                credits={userStats?.credits || 0} 
                bonusCredits={userStats?.bonusCredits || 0}
              />
            </div>
          </SettingsCard>
        </div>

        {/* Followers and Following Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UserSection 
            title="Followers"
            users={followData?.followers} 
            icon={Star}
          />
          <UserSection 
            title="Following"
            users={followData?.following} 
            icon={Star}
          />
        </div>

        {/* Private Images */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Your Privates
          </h2>
          <ImageGallery 
            userId={session.user.id}
            profileUserId={session.user.id}
            activeView="myImages"
            nsfwEnabled={false}
            showPrivate={true}
            onImageClick={setSelectedImage}
          />
        </motion.div>

        <AnimatePresence>
          {isEditing && (
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Display Name
                    </label>
                    <Input
                      id="name"
                      value={tempDisplayName}
                      onChange={(e) => setTempDisplayName(e.target.value)}
                      className="focus-visible:ring-primary"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleDisplayNameUpdate}>
                      Save Changes
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
          {selectedImage && (
            <FullScreenImageView
              image={selectedImage}
              isOpen={!!selectedImage}
              onClose={() => setSelectedImage(null)}
              onDownload={() => {}}
              onDiscard={() => {}}
              onRemix={() => {}}
              isOwner={session.user.id === selectedImage.user_id}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default UserProfile;
