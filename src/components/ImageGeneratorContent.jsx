import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
import { usePromptImprovement } from '@/hooks/usePromptImprovement';
import { toast } from 'sonner';

const ImageGeneratorContent = ({
  session,
  credits,
  bonusCredits,
  activeTab,
  setActiveTab,
  generatingImages,
  nsfwEnabled,
  setNsfwEnabled,
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
  const isGenerateTab = location.hash === '#imagegenerate';
  const isNotificationsTab = location.hash === '#notifications';
  
  const [isPromptVisible, setIsPromptVisible] = useState(true);
  const shouldShowSettings = useMemo(() => {
    return isMobile 
      ? isGenerateTab 
      : !isInspiration && settingsActive;
  }, [isMobile, isGenerateTab, isInspiration, settingsActive]);
  
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isSidebarMounted, setIsSidebarMounted] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const { settingsActive } = useUserPreferences();
  const { isImproving, improveCurrentPrompt } = usePromptImprovement(session?.user?.id);
  const {
    following
  } = useFollows(session?.user?.id);
  const [searchQuery, setSearchQuery] = useState('');
  const totalCredits = (credits || 0) + (bonusCredits || 0);
  const hasEnoughCreditsForImprovement = totalCredits >= 1;
  const desktopPromptBoxRef = useRef(null);

  useEffect(() => {
    if (shouldShowSettings) {
      setIsSidebarMounted(true);
      requestAnimationFrame(() => {
        setIsSidebarVisible(true);
      });
    } else {
      setIsSidebarVisible(false);
      const timer = setTimeout(() => {
        setIsSidebarMounted(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [shouldShowSettings, searchQuery]);

  useEffect(() => {
    if (isGenerateTab) {
      setActiveTab('input');
    } else if (isNotificationsTab) {
      setActiveTab('notifications');
    } else {
      setActiveTab('images');
    }
  }, [location.hash, setActiveTab]);

  const focusMainPrompt = useCallback(() => {
    if (desktopPromptBoxRef.current) {
      desktopPromptBoxRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      
      const textarea = desktopPromptBoxRef.current.querySelector('textarea');
      if (textarea) {
        requestAnimationFrame(() => {
          textarea.focus();
        });
      }
    }
  }, []);

  const promptProps = useMemo(() => ({
    prompt: imageGeneratorProps.prompt,
    onChange: imageGeneratorProps.setPrompt,
    onSubmit: imageGeneratorProps.generateImage,
    hasEnoughCredits: true,
    handleImprovePrompt: async () => {
      if (!session?.user?.id) {
        toast.error('Please sign in to improve prompts');
        return;
      }

      if (!hasEnoughCreditsForImprovement) {
        toast.error('Not enough credits for prompt improvement');
        return;
      }

      try {
        let accumulatedPrompt = "";
        let isFirstChunk = true;
        await improveCurrentPrompt(
          imageGeneratorProps.prompt, 
          imageGeneratorProps.model, 
          imageGeneratorProps.modelConfigs, 
          (chunk, isStreaming) => {
            if (isStreaming) {
              if (isFirstChunk) {
                imageGeneratorProps.setPrompt("");
                isFirstChunk = false;
              }
              accumulatedPrompt += chunk;
              imageGeneratorProps.setPrompt(accumulatedPrompt);
            } else {
              imageGeneratorProps.setPrompt(chunk);
            }
          }
        );
      } catch (error) {
        console.error('Error improving prompt:', error);
        toast.error('Failed to improve prompt');
      }
    },
    isImproving,
    hasEnoughCreditsForImprovement
  }), [
    imageGeneratorProps.prompt, 
    imageGeneratorProps.setPrompt, 
    imageGeneratorProps.generateImage,
    imageGeneratorProps.model,
    imageGeneratorProps.modelConfigs,
    session?.user?.id,
    hasEnoughCreditsForImprovement,
    improveCurrentPrompt,
    isImproving
  ]);

  const handleSearch = query => {
    setSearchQuery(query);
    onSearch(query);
  };

  const handlePrivateToggle = newValue => {
    setShowPrivate(newValue);
  };

  useEffect(() => {
    if (!isInspiration && !location.hash.includes('myimages')) {
      setSearchQuery('');
      onSearch('');
    }
  }, [location.pathname, location.hash]);

  const handleImageClick = (image) => {
    navigate(`/image/${image.id}`);
  };

  const handleSettingsToggle = (isActive) => {
  };

  return <>
      <div className="flex flex-col md:flex-row min-h-screen bg-background text-foreground image-generator-content overflow-x-hidden">
        <div className={cn("flex-grow p-2 md:p-6 overflow-y-auto transition-[padding] duration-300 ease-in-out", !isGenerateTab ? 'block' : 'hidden md:block', isSidebarVisible ? 'md:pr-[350px]' : 'md:pr-6', "pb-20 md:pb-6")}>
          {session && <>
              <DesktopHeader 
                user={session.user} 
                credits={credits} 
                bonusCredits={bonusCredits} 
                generatingImages={generatingImages} 
                activeFilters={activeFilters} 
                onFilterChange={onFilterChange} 
                onRemoveFilter={onRemoveFilter} 
                onSearch={handleSearch} 
                nsfwEnabled={nsfwEnabled} 
                setNsfwEnabled={setNsfwEnabled} 
                showPrivate={showPrivate} 
                onTogglePrivate={handlePrivateToggle} 
                showFollowing={showFollowing} 
                showTop={showTop} 
                onFollowingChange={setShowFollowing} 
                onTopChange={setShowTop} 
                searchQuery={searchQuery}
                promptBoxVisible={isPromptVisible}
                promptProps={promptProps}
                focusMainPrompt={focusMainPrompt}
              />
              <MobileHeader activeFilters={activeFilters} onFilterChange={onFilterChange} onRemoveFilter={onRemoveFilter} onSearch={handleSearch} isVisible={isHeaderVisible} nsfwEnabled={nsfwEnabled} showPrivate={showPrivate} onTogglePrivate={handlePrivateToggle} showFollowing={showFollowing} showTop={showTop} onFollowingChange={setShowFollowing} onTopChange={setShowTop} searchQuery={searchQuery} />
              
              {!isInspiration && !searchQuery && <div ref={desktopPromptBoxRef}>
                <DesktopPromptBox 
                  prompt={imageGeneratorProps.prompt} 
                  onChange={e => imageGeneratorProps.setPrompt(e.target.value)} 
                  onSubmit={imageGeneratorProps.generateImage} 
                  hasEnoughCredits={true} 
                  onClear={() => imageGeneratorProps.setPrompt('')} 
                  credits={credits} 
                  bonusCredits={bonusCredits} 
                  userId={session?.user?.id} 
                  onVisibilityChange={setIsPromptVisible} 
                  activeModel={imageGeneratorProps.model} 
                  modelConfigs={imageGeneratorProps.modelConfigs}
                  onSettingsToggle={handleSettingsToggle}
                />
              </div>}

              <div className="md:mt-16 -mx-2 md:mx-0">
                <ImageGallery 
                  userId={session?.user?.id} 
                  onImageClick={handleImageClick}
                  onDownload={handleDownload}
                  onDiscard={handleDiscard}
                  onRemix={handleRemix}
                  onViewDetails={handleViewDetails}
                  generatingImages={generatingImages}
                  nsfwEnabled={nsfwEnabled}
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
              <ImageGeneratorSettings {...imageGeneratorProps} hidePromptOnDesktop={!isMobile && !isGenerateTab} credits={credits} bonusCredits={bonusCredits} session={session} updateCredits={imageGeneratorProps.updateCredits} proMode={proMode} nsfwEnabled={nsfwEnabled} setNsfwEnabled={setNsfwEnabled} negativePrompt={imageGeneratorProps.negativePrompt} setNegativePrompt={imageGeneratorProps.setNegativePrompt} />
            </div>
          </div>}
      </div>

      <MobileNotificationsMenu activeTab={activeTab} />
      <MobileProfileMenu user={session?.user} credits={credits} bonusCredits={bonusCredits} activeTab={activeTab} nsfwEnabled={nsfwEnabled} setNsfwEnabled={setNsfwEnabled} />

      <BottomNavbar activeTab={activeTab} setActiveTab={setActiveTab} session={session} credits={credits} bonusCredits={bonusCredits} generatingImages={generatingImages} nsfwEnabled={nsfwEnabled} setNsfwEnabled={setNsfwEnabled} />
      
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
