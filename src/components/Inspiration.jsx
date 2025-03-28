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
import BottomNavbar from '@/components/BottomNavbar';
import MobileNotificationsMenu from '@/components/MobileNotificationsMenu';
import MobileProfileMenu from '@/components/MobileProfileMenu';
import GeneratingImagesDropdown from '@/components/GeneratingImagesDropdown';
import { useNavigate, useLocation } from 'react-router-dom';
import { useProUser } from '@/hooks/useProUser';

const Inspiration = () => {
  const { session } = useSupabaseAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedImage, setSelectedImage] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
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

  // Sync activeTab with URL hash and update filters based on hash
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
        setShowFollowing(false);
        setShowTop(true);
        setShowLatest(false);
        break;
      case 'latest':
        setShowFollowing(false);
        setShowTop(false);
        setShowLatest(true);
        break;
      default:
        setActiveTab('images');
        // If no hash, default to latest
        if (!hash) {
          setShowFollowing(false);
          setShowTop(false);
          setShowLatest(true);
          navigate('/inspiration#latest', { replace: true });
        }
    }
  }, [location.hash]);

  const handleImageClick = (image) => {
    navigate(`/image/${image.id}`);
  };

  const handleViewDetails = (image) => {
    setSelectedImage(image);
    setDetailsDialogOpen(true);
  };

  const handleRemix = async (image) => {
    navigate(`/remix/${image.id}`);
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

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Header */}
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

      {/* Mobile Header */}
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

      {/* Main Content */}
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
        />
      </main>

      {/* Mobile Navigation */}
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

      {/* Dialogs */}
      <ImageDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        image={selectedImage}
      />
    </div>
  );
};

export default Inspiration;