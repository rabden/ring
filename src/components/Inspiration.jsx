import React, { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/integrations/supabase/auth';
import { useUserCredits } from '@/hooks/useUserCredits';
import { useFollows } from '@/hooks/useFollows';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { useGeneratingImages } from '@/contexts/GeneratingImagesContext';
import { useModelConfigs } from '@/hooks/useModelConfigs';
import { isNsfwModel } from '@/utils/modelUtils';
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
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/supabase';
import { adminDeleteImage } from '@/integrations/supabase/imageUtils';
import { toast } from 'sonner';
import AdminDiscardDialog from '@/components/admin/AdminDiscardDialog';

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
  const [selectedImageForDelete, setSelectedImageForDelete] = useState(null);
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const { nsfwModelKeys } = useModelConfigs();

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

  const { data: imageOwner } = useQuery({
    queryKey: ['imageOwner', selectedImageForDelete?.user_id],
    queryFn: async () => {
      if (!selectedImageForDelete?.user_id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', selectedImageForDelete.user_id)
        .single();
      return data;
    },
    enabled: !!selectedImageForDelete?.user_id && isAdmin
  });

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

  const handleDiscard = async (imageId, reason = null, isAdminAction = false) => {
    try {
      if (isAdminAction) {
        await adminDeleteImage(imageId, reason);
      } else {
        const { data: image } = await supabase
          .from('user_images')
          .select('*')
          .eq('id', imageId)
          .single();

        if (!image) {
          toast.error('Image not found');
          return;
        }

        await supabase.storage
          .from('user-images')
          .remove([image.storage_path]);

        await supabase
          .from('user_images')
          .delete()
          .eq('id', imageId);
      }
      toast.success('Image deleted successfully');
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    }
  };

  const handleAdminDelete = (image) => {
    if (isNsfwModel(image.model)) {
      toast.info('This image was created with an NSFW model and is allowed to contain adult content.');
      return;
    }
    
    setSelectedImageForDelete(image);
    setIsAdminDialogOpen(true);
  };

  const confirmAdminDelete = (reason) => {
    handleDiscard(selectedImageForDelete.id, reason, true);
    setIsAdminDialogOpen(false);
    setSelectedImageForDelete(null);
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
          onDiscard={handleDiscard}
          onAdminDelete={handleAdminDelete}
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
      
      <AdminDiscardDialog
        open={isAdminDialogOpen}
        onOpenChange={setIsAdminDialogOpen}
        onConfirm={confirmAdminDelete}
        imageOwnerName={imageOwner?.display_name}
      />
    </div>
  );
};

export default Inspiration;
