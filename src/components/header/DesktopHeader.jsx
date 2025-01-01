import React from 'react';
import { useLocation } from 'react-router-dom';
import ProfileMenu from '../ProfileMenu';
import ActionButtons from '../ActionButtons';
import SearchBar from '../search/SearchBar';
import NotificationBell from '../notifications/NotificationBell';
import PrivateFilterButton from '../filters/PrivateFilterButton';
import InspirationFilterButtons from '../filters/InspirationFilterButtons';
import { cn } from '@/lib/utils';

const DesktopHeader = ({ 
  user, 
  credits, 
  bonusCredits, 
  generatingImages,
  onSearch,
  showPrivate,
  onTogglePrivate,
  nsfwEnabled,
  setNsfwEnabled,
  showFollowing,
  showTop,
  onFollowingChange,
  onTopChange
}) => {
  const location = useLocation();
  const isInspiration = location.pathname === '/inspiration';
  const isMyImages = location.pathname === '/' && (!location.hash || location.hash === '#myimages');

  return (
    <>
      <div className={cn(
        "hidden md:block fixed top-0 left-0 right-0 z-10 h-12",
        "bg-background/95 backdrop-blur-[2px]",
        "border-b border-border/50",
      )}>
        <div className="flex justify-between items-center h-full px-10 max-w-full">
          <div className="flex items-center gap-3">
            <div className="h-8">
              <ProfileMenu 
                user={user} 
                credits={credits} 
                bonusCredits={bonusCredits}
                nsfwEnabled={nsfwEnabled}
                setNsfwEnabled={setNsfwEnabled}
              />
            </div>
            <div className="h-8">
              <NotificationBell />
            </div>
            <ActionButtons 
              generatingImages={generatingImages}
              className="gap-3"
              buttonClassName={cn(
                "h-8 rounded-lg px-3",
                "bg-transparent hover:bg-muted/10",
                "text-foreground/70 hover:text-foreground",
                "transition-colors duration-200"
              )}
            />
            {isMyImages && (
              <PrivateFilterButton
                showPrivate={showPrivate}
                onToggle={onTogglePrivate}
              />
            )}
            {isInspiration && (
              <InspirationFilterButtons
                className="flex-1"
              />
            )}
            <SearchBar onSearch={onSearch} />
          </div>
        </div>
      </div>
    </>
  );
};

export default DesktopHeader;