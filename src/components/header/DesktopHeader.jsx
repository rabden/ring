
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
  onTopChange,
  rightContent
}) => {
  const location = useLocation();
  const isInspiration = location.pathname === '/inspiration';
  const isMyImages = location.pathname === '/' && (!location.hash || location.hash === '#myimages');

  return (
    <div className={cn(
      "hidden md:block fixed top-0 left-0 right-0 z-50 h-12",
      "bg-background",
      "transition-all duration-200 ease-in-out"
    )}>
      /* Gradient overlay at the top of header */
        <div className="absolute top-0 left-0 right-0 h-[10px] bg-gradient-to-b from-background to-background/10" />
        
        <div className={cn(
          "flex justify-between items-center h-full px-10 max-w-full",
          "transition-all duration-200 ease-in-out"
        )}>
          {/* Left side - Profile, Notifications, Search */}
        <div className={cn(
          "flex items-center gap-4",
          "transition-all duration-200 ease-in-out"
        )}>
          <div className={cn(
            "h-8",
            "transition-transform duration-200 ease-in-out",
          )}>
            <ProfileMenu 
              user={user} 
              credits={credits} 
              bonusCredits={bonusCredits}
              nsfwEnabled={nsfwEnabled}
              setNsfwEnabled={setNsfwEnabled}
            />
          </div>
          <div className={cn(
            "h-8",
            "transition-transform duration-200 ease-in-out",
          )}>
            <NotificationBell />
          </div>
          <div className="transition-all duration-200 ease-in-out">
            <SearchBar onSearch={onSearch} />
          </div>
        </div>

        {/* Right side - Navigation Buttons and Generating Status */}
        <div className={cn(
          "flex items-center gap-3",
          "transition-all duration-200 ease-in-out"
        )}>
          {isMyImages && (
            <div className="transition-transform duration-200 ease-in-out">
              <PrivateFilterButton
                showPrivate={showPrivate}
                onToggle={onTogglePrivate}
              />
            </div>
          )}
          {isInspiration && (
            <div className="transition-transform duration-200 ease-in-out">
              <InspirationFilterButtons
                className="flex-1"
              />
            </div>
          )}
          <div className="transition-transform duration-200 ease-in-out">
            <ActionButtons 
              generatingImages={generatingImages}
              className={cn(
                "gap-3",
                "transition-all duration-200 ease-in-out"
              )}
              buttonClassName={cn(
                "h-8 rounded-lg px-3",
                "bg-transparent hover:bg-muted/50",
                "text-foreground/70 hover:text-foreground",
                "transition-all duration-200 ease-in-out"
              )}
            />
          </div>
          {rightContent && (
            <div className="transition-transform duration-200 ease-in-out">
              {rightContent}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesktopHeader;
