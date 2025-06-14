
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ImageGeneratorSettings from './ImageGeneratorSettings';
import ImageGallery from './ImageGallery';
import BottomNavbar from './BottomNavbar';
import MobileNotificationsMenu from './MobileNotificationsMenu';
import MobileProfileMenu from './MobileProfileMenu';
import ImageDetailsDialog from './ImageDetailsDialog';
import FullScreenImageView from './FullScreenImageView';
import DesktopHeader from './header/DesktopHeader';
import MobileHeader from './header/MobileHeader';
import DesktopPromptBox from './prompt/DesktopPromptBox';
import { cn } from '@/lib/utils';
import { useFollows } from '@/hooks/useFollows';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';

const ImageGeneratorContent = ({
  session,
  credits,
  bonusCredits,
  activeTab,
  setActiveTab,
  generatingImages,
  showPrivate,
  setShowPrivate,
  activeFilters,
  onFilterChange,
  onRemoveFilter,
  onSearch,
  isHeaderVisible,
  handleDownload,
  handleDiscard,
  handleRemix,
  handleViewDetails,
  selectedImage,
  detailsDialogOpen,
  setDetailsDialogOpen,
  fullScreenViewOpen,
  setFullScreenViewOpen,
  imageGeneratorProps,
  proMode
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isInspiration = location.pathname === '/inspiration';
  const isGenerateTab = activeTab === 'input';
  const shouldShowSettings = isMobile ? isGenerateTab : !isInspiration;
  const [isPromptVisible, setIsPromptVisible] = useState(true);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isSidebarMounted, setIsSidebarMounted] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const { settingsActive } = useUserPreferences();
  const {
    following
  } = useFollows(session?.user?.id);
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate if user has enough credits based on current quality and image count
  const calculateHasEnoughCredits = () => {
    if (!imageGeneratorProps || !imageGeneratorProps.quality) return false;
    
    const creditCost = {
      "HD": 1,
      "HD+": 2,
      "4K": 3
    }[imageGeneratorProps.quality] * (imageGeneratorProps.imageCount || 1);
    
    const totalCredits = (credits || 0) + (bonusCredits || 0);
    return totalCredits >= creditCost;
  };

  const hasEnoughCredits = calculateHasEnoughCredits();

  const handleModelChange = (newModel) => {
    if (imageGeneratorProps && imageGeneratorProps.onModelChange) {
      imageGeneratorProps.onModelChange(newModel);
    }
  };
  
  const handleAspectRatioChange = (newRatio) => {
    if (imageGeneratorProps && imageGeneratorProps.onAspectRatioChange) {
      imageGeneratorProps.onAspectRatioChange(newRatio);
    }
  };
  
  const handleImageCountChange = (newCount) => {
    if (imageGeneratorProps && imageGeneratorProps.setImageCount) {
      imageGeneratorProps.setImageCount(newCount);
    }
  };

  useEffect(() => {
    const shouldMount = isMobile 
      ? isGenerateTab 
      : shouldShowSettings && isPromptVisible && !isInspiration && !searchQuery && settingsActive;
      
    if (shouldMount) {
      setIsSidebarMounted(true);
      requestAnimationFrame(() => {
        setIsSidebarVisible(true);
      });
    } else {
      setIsSidebarVisible(false);
      const timer = setTimeout(() => {
        setIsSidebarMounted(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [shouldShowSettings, isPromptVisible, isInspiration, isGenerateTab, isMobile, searchQuery, settingsActive]);

  const handleSearch = query => {
    setSearchQuery(query);
    onSearch(query);
  };

  const handlePrivateToggle = newValue => {
    setShowPrivate(newValue);
  };

  useEffect(() => {
    if (!isInspiration) {
      setSearchQuery('');
      onSearch('');
    }
  }, [location.pathname]);

  const handleImageClick = (image) => {
    navigate(`/image/${image.id}`);
  };

  const handleSettingsToggle = (isActive) => {
    // This function is kept for compatibility but we're now using the context directly
  };

  return <>
      <div className="flex flex-col md:flex-row min-h-screen bg-background text-foreground image-generator-content overflow-x-hidden">
        <div className={cn("flex-grow p-2 md:p-6 overflow-y-auto transition-[padding] duration-300 ease-in-out", !isGenerateTab ? 'block' : 'hidden md:block', isSidebarVisible ? 'md:pr-[350px]' : 'md:pr-6', "pb-20 md:pb-6")}>
          {session && <>
              <DesktopHeader user={session.user} credits={credits} bonusCredits={bonusCredits} generatingImages={generatingImages} activeFilters={activeFilters} onFilterChange={onFilterChange} onRemoveFilter={onRemoveFilter} onSearch={handleSearch} showPrivate={showPrivate} onTogglePrivate={handlePrivateToggle} showFollowing={showFollowing} showTop={showTop} onFollowingChange={setShowFollowing} onTopChange={setShowTop} searchQuery={searchQuery} />
              <MobileHeader activeFilters={activeFilters} onFilterChange={onFilterChange} onRemoveFilter={onRemoveFilter} onSearch={handleSearch} isVisible={isHeaderVisible} showPrivate={showPrivate} onTogglePrivate={handlePrivateToggle} showFollowing={showFollowing} showTop={showTop} onFollowingChange={setShowFollowing} onTopChange={setShowTop} searchQuery={searchQuery} />
              
              {!isInspiration && !searchQuery && <DesktopPromptBox 
                prompt={imageGeneratorProps.prompt} 
                onChange={e => imageGeneratorProps.setPrompt(e.target.value)} 
                onSubmit={imageGeneratorProps.generateImage} 
                hasEnoughCredits={hasEnoughCredits} 
                onClear={() => imageGeneratorProps.setPrompt('')} 
                credits={credits} 
                bonusCredits={bonusCredits} 
                userId={session?.user?.id} 
                onVisibilityChange={setIsPromptVisible} 
                activeModel={imageGeneratorProps.model} 
                modelConfigs={imageGeneratorProps.modelConfigs}
                onSettingsToggle={handleSettingsToggle}
                onModelChange={handleModelChange}
                aspectRatio={imageGeneratorProps.aspectRatio}
                onAspectRatioChange={handleAspectRatioChange}
                proMode={proMode}
                imageCount={imageGeneratorProps.imageCount}
                onImageCountChange={handleImageCountChange}
                seed={imageGeneratorProps.seed}
                setSeed={imageGeneratorProps.setSeed}
                randomizeSeed={imageGeneratorProps.randomizeSeed}
                setRandomizeSeed={imageGeneratorProps.setRandomizeSeed}
              />}

              <div className="md:mt-16 -mx-2 md:mx-0">
                <ImageGallery 
                  userId={session?.user?.id} 
                  onImageClick={handleImageClick}
                  onDownload={handleDownload}
                  onDiscard={handleDiscard}
                  onRemix={handleRemix}
                  onViewDetails={handleViewDetails}
                  generatingImages={generatingImages}
                  modelConfigs={imageGeneratorProps.modelConfigs}
                  activeFilters={activeFilters}
                  searchQuery={searchQuery}
                  showPrivate={showPrivate}
                  showFollowing={showFollowing}
                  showTop={showTop}
                  following={following}
                  className="px-1"
                />
              </div>
            </>}
        </div>

        {isSidebarMounted && !searchQuery && <div className={cn(
          "fixed inset-y-0 w-full md:w-[350px] bg-background text-card-foreground",
          "md:fixed md:right-0 md:top-12 md:bottom-0",
          isGenerateTab ? 'block' : 'hidden md:block',
          "md:h-[calc(100vh-3rem)]",
          "transition-transform duration-300 ease-in-out",
          "z-20",
          "overflow-y-auto scrollbar-none", 
          isSidebarVisible ? "translate-x-0" : "translate-x-full"
        )}>
            <div className="min-h-[calc(100vh-56px)] md:h-full overflow-visible px-2 md:px-6 py-4 md:py-4">
              <ImageGeneratorSettings {...imageGeneratorProps} hidePromptOnDesktop={!isMobile && !isGenerateTab} credits={credits} bonusCredits={bonusCredits} session={session} updateCredits={imageGeneratorProps.updateCredits} proMode={proMode} />
            </div>
          </div>}
      </div>

      <MobileNotificationsMenu activeTab={activeTab} />
      <MobileProfileMenu user={session?.user} credits={credits} bonusCredits={bonusCredits} activeTab={activeTab} />

      <BottomNavbar activeTab={activeTab} setActiveTab={setActiveTab} session={session} credits={credits} bonusCredits={bonusCredits} generatingImages={generatingImages} />
      
      <ImageDetailsDialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen} image={selectedImage} />
      {selectedImage && (
        <FullScreenImageView 
          image={selectedImage} 
          isOpen={fullScreenViewOpen} 
          onClose={() => setFullScreenViewOpen(false)} 
          onDownload={handleDownload} 
          onDiscard={handleDiscard} 
          onRemix={handleRemix} 
          isOwner={selectedImage?.user_id === session?.user?.id} 
        />
      )}
    </>;
};

export default ImageGeneratorContent;
