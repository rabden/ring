import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/supabase';
import ImageGallery from '@/components/ImageGallery';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Image, Heart, ArrowLeft } from 'lucide-react';
import ProfileAvatar from '@/components/profile/ProfileAvatar';
import FollowButton from '@/components/profile/FollowButton';
import FollowStats from '@/components/profile/FollowStats';
import { useSupabaseAuth } from '@/integrations/supabase/auth';
import { Separator } from '@/components/ui/separator';
import FullScreenImageView from '@/components/FullScreenImageView';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const StatItem = ({ icon: Icon, value, label }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-center gap-1.5 group"
  >
    <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
    <span className="text-sm font-medium group-hover:text-primary transition-colors duration-300">{value}</span>
    <span className="text-xs text-muted-foreground ml-0.5">{label}</span>
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
    <div className="flex gap-4">
      <Skeleton className="h-8 w-[100px]" />
      <Skeleton className="h-8 w-[100px]" />
      <Skeleton className="h-8 w-[100px]" />
    </div>
  </div>
);

const PublicProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { session } = useSupabaseAuth();
  const currentUserId = session?.user?.id;
  const [selectedImage, setSelectedImage] = useState(null);

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, is_pro')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId
  });

  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['userStats', userId],
    queryFn: async () => {
      const [imagesResult, likesResult, followersResult, followingResult] = await Promise.all([
        supabase
          .from('user_images')
          .select('*', { count: 'exact' })
          .eq('user_id', userId)
          .eq('is_private', false),
        supabase
          .from('user_image_likes')
          .select('*', { count: 'exact' })
          .eq('created_by', userId),
        supabase
          .from('user_follows')
          .select('*', { count: 'exact' })
          .eq('following_id', userId),
        supabase
          .from('user_follows')
          .select('*', { count: 'exact' })
          .eq('follower_id', userId)
      ]);

      return {
        totalImages: imagesResult.count || 0,
        totalLikes: likesResult.count || 0,
        followers: followersResult.count || 0,
        following: followingResult.count || 0
      };
    },
    enabled: !!userId
  });

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  if (isProfileLoading || isStatsLoading) {
    return (
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <ProfileSkeleton />
      </div>
    );
  }

  if (!profile) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-4 py-8 text-center"
      >
        <h2 className="text-2xl font-semibold text-foreground/80">User not found</h2>
        <p className="text-muted-foreground mt-2">The profile you're looking for doesn't exist.</p>
        <Button 
          variant="default" 
          className="mt-4"
          onClick={() => navigate('/')}
        >
          Return Home
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container  mx-auto py-6 px-1 space-y-4"
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            className="group flex items-center gap-2 hover:gap-3 transition-all duration-300"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5 text-primary transition-colors" />
            <span className="text-2xl font-medium bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
              Profile
            </span>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* Profile Card */}
          <Card className="rounded-2xl border border-border bg-card text-card-foreground relative overflow-hidden">
            <div className="p-4 md:p-6 relative">
              <div className="flex flex-col sm:grid sm:grid-cols-2 gap-6">
                {/* Profile Details */}
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="flex-shrink-0">
                    <ProfileAvatar 
                      user={{ user_metadata: { avatar_url: profile.avatar_url } }} 
                      avatarUrl={profile.avatar_url}
                      size="lg" 
                      isPro={profile.is_pro}
                      className="w-24 h-24 sm:w-28 sm:h-28 ring-2 ring-border ring-offset-2 ring-offset-background"
                    />
                  </div>
                  
                  <div className="flex-1 text-center sm:text-left space-y-2">
                    <div className="space-y-1">
                      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        {profile.display_name}
                      </h1>
                      <p className="text-xs text-muted-foreground/70">
                        Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', {
                          month: 'long',
                          year: 'numeric'
                        }) : ''}
                      </p>
                    </div>
                    
                    {currentUserId && currentUserId !== userId && (
                      <div className="pt-2 sm:max-w-[200px]">
                        <FollowButton userId={userId} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats Section */}
                <div className="flex items-center">
                  <div className={cn(
                    "w-full grid grid-cols-4 gap-2 p-3 rounded-xl",
                    "bg-muted/5 hover:bg-muted/10",
                    "transition-colors duration-200"
                  )}>
                    <div className="text-center">
                      <span className="block text-base sm:text-lg font-medium text-foreground">{stats.totalImages}</span>
                      <span className="text-xs text-muted-foreground/80">Images</span>
                    </div>
                    <div className="text-center">
                      <span className="block text-base sm:text-lg font-medium text-foreground">{stats.totalLikes}</span>
                      <span className="text-xs text-muted-foreground/80">Likes</span>
                    </div>
                    <div className="text-center">
                      <span className="block text-base sm:text-lg font-medium text-foreground">{stats.followers}</span>
                      <span className="text-xs text-muted-foreground/80">Followers</span>
                    </div>
                    <div className="text-center">
                      <span className="block text-base sm:text-lg font-medium text-foreground">{stats.following}</span>
                      <span className="text-xs text-muted-foreground/80">Following</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Gallery Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <ImageGallery 
              userId={currentUserId}
              profileUserId={userId}
              activeView="myImages"
              nsfwEnabled={false}
              showPrivate={false}
              onImageClick={handleImageClick}
            />
          </motion.div>
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedImage && (
          <FullScreenImageView
            image={selectedImage}
            isOpen={!!selectedImage}
            onClose={() => setSelectedImage(null)}
            onDownload={() => {}}
            onDiscard={() => {}}
            onRemix={() => {}}
            isOwner={currentUserId === selectedImage.user_id}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PublicProfile;