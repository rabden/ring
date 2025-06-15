import React, { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/integrations/supabase/auth';
import { useUserCredits } from '@/hooks/useUserCredits';
import { useFollows } from '@/hooks/useFollows';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { useGeneratingImages } from '@/contexts/GeneratingImagesContext';
import ImageGallery from '@/components/ImageGallery';
import DesktopHeader from '@/components/header/DesktopHeader';
import MobileHeader from '@/components/header/MobileHeader';
import ImageDetailsDialog from '@/components/ImageDetailsDialog';
import FullScreenImageView from '@/components/FullScreenImageView';
import BottomNavbar from '@/components/BottomNavbar';
import MobileNotificationsMenu from '@/components/MobileNotificationsMenu';
import MobileProfileMenu from '@/components/MobileProfileMenu';
import GeneratingImagesDropdown from '@/components/GeneratingImagesDropdown';
import { useNavigate, useLocation } from 'react-router-dom';
import { useProUser } from '@/hooks/useProUser';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { handleImageDiscard } from '@/utils/discardUtils';
import { remixImage } from '@/utils/remixUtils';

const Inspiration = () => {
  const { session } = useSupabaseAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedImage, setSelectedImage] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [fullScreenViewOpen, setFullScreenViewOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const { nsfwEnabled, setNsfwEnabled } = useUserPreferences();
  const { generatingImages } = useGeneratingImages();
  const [showFollowing, setShowFollowing] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [showLatest, setShowLatest] = useState(true);
  const { credits, bonusCredits } = useUserCredits(session?.user?.id);
  const { following } = useFollows(session?.user?.id);
  const isHeaderVisible = useScrollDirection();
  const [activeTab, setActiveTab] = useState('images');
  const { isPro } = useProUser();
  const { isAdmin } = useIsAdmin();
  const queryClient = useQueryClient();

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    switch (hash) {
      case 'notifications':
        setActiveTab('notifications');
        break;
      case 'following':
        setShowFollowing(true);
        setShowTop(false);
        setShowLatest(false);
        break;
      case 'top':
      case 'top-month':
      case 'top-week':
      case 'top-all':
        setShowFollowing(false);
        setShowTop(true);
        setShowLatest(false);
        setActiveFilters(prev => ({
          ...prev,
          period: hash === 'top-all' ? 'all' : 
                 hash === 'top-month' ? 'month' : 'week'
        }));
        break;
      case 'latest':
        setShowFollowing(false);
        setShowTop(false);
        setShowLatest(true);
        break;
      default:
        setActiveTab('images');
        if (!hash) {
          setShowFollowing(false);
          setShowTop(false);
          setShowLatest(true);
          navigate('/inspiration#latest', { replace: true });
        }
    }
  }, [location.hash]);

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setFullScreenViewOpen(true);
  };

  const handleViewDetails = (image) => {
    setSelectedImage(image);
    setDetailsDialogOpen(true);
  };

  const handleRemix = async (image) => {
    remixImage(image, navigate, session);
  };

  const handleDownload = async (image) => {
    const response = await fetch(image.image_url);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${image.id}.png`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleDiscard = async (reason) => {
    try {
      if (selectedImage) {
        await handleImageDiscard(selectedImage, queryClient, reason);
        setFullScreenViewOpen(false);
        setSelectedImage(null);
        toast.success('Image deleted successfully');
      }
    } catch (error) {
      console.error('Error discarding image:', error);
      toast.error('Failed to delete image');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DesktopHeader
        user={session?.user}
        credits={credits}
        bonusCredits={bonusCredits}
        onSearch={setSearchQuery}
        nsfwEnabled={nsfwEnabled}
        setNsfwEnabled={setNsfwEnabled}
        activeFilters={activeFilters}
        onFilterChange={(type, value) => setActiveFilters(prev => ({ ...prev, [type]: value }))}
        onRemoveFilter={(type) => {
          const newFilters = { ...activeFilters };
          delete newFilters[type];
          setActiveFilters(newFilters);
        }}
        showFollowing={showFollowing}
        showTop={showTop}
        showLatest={showLatest}
        onFollowingChange={setShowFollowing}
        onTopChange={setShowTop}
        onLatestChange={setShowLatest}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        rightContent={
          <div className="flex items-center gap-2">
            <GeneratingImagesDropdown generatingImages={generatingImages} />
          </div>
        }
      />

      <MobileHeader
        activeFilters={activeFilters}
        onFilterChange={(type, value) => setActiveFilters(prev => ({ ...prev, [type]: value }))}
        onRemoveFilter={(type) => {
          const newFilters = { ...activeFilters };
          delete newFilters[type];
          setActiveFilters(newFilters);
        }}
        onSearch={setSearchQuery}
        isVisible={isHeaderVisible}
        nsfwEnabled={nsfwEnabled}
        onToggleNsfw={() => setNsfwEnabled(!nsfwEnabled)}
        showFollowing={showFollowing}
        showTop={showTop}
        showLatest={showLatest}
        onFollowingChange={setShowFollowing}
        onTopChange={setShowTop}
        onLatestChange={setShowLatest}
      />

      <main className="pt-16 md:pt-20 px-1 md:px-6 pb-20 md:pb-6">
        <ImageGallery
          userId={session?.user?.id}
          onImageClick={handleImageClick}
          onDownload={handleDownload}
          onRemix={handleRemix}
          onViewDetails={handleViewDetails}
          nsfwEnabled={nsfwEnabled}
          activeFilters={activeFilters}
          searchQuery={searchQuery}
          showPrivate={false}
          showFollowing={showFollowing}
          showTop={showTop}
          showLatest={showLatest}
          following={following}
          className="px-0"
          isAdmin={isAdmin}
        />
      </main>

      <BottomNavbar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        session={session}
        credits={credits}
        bonusCredits={bonusCredits}
        generatingImages={generatingImages}
        nsfwEnabled={nsfwEnabled}
        setNsfwEnabled={setNsfwEnabled}
      />
      <MobileNotificationsMenu activeTab={activeTab} />
      <MobileProfileMenu 
        user={session?.user}
        credits={credits}
        bonusCredits={bonusCredits}
        activeTab={activeTab}
        nsfwEnabled={nsfwEnabled}
        setNsfwEnabled={setNsfwEnabled}
      />

      <ImageDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        image={selectedImage}
      />

      {selectedImage && (
        <FullScreenImageView
          image={selectedImage}
          isOpen={fullScreenViewOpen}
          onClose={() => setFullScreenViewOpen(false)}
          onDownload={handleDownload}
          onDiscard={handleDiscard}
          onRemix={handleRemix}
          isOwner={selectedImage?.user_id === session?.user?.id}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
};

export default Inspiration;
