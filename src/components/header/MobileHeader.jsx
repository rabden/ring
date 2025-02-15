import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import SearchBar from '../search/SearchBar';
import PrivateFilterButton from '../filters/PrivateFilterButton';
import InspirationFilterButtons from '../filters/InspirationFilterButtons';
import { cn } from '@/lib/utils';

const MobileHeader = ({ 
  activeFilters,
  onFilterChange,
  onRemoveFilter,
  onSearch,
  isVisible,
  nsfwEnabled,
  showPrivate,
  onTogglePrivate,
  showFollowing,
  showTop,
  onFollowingChange,
  onTopChange
}) => {
  const location = useLocation();
  const isInspiration = location.pathname === '/inspiration';
  const isMyImages = location.pathname === '/' && (!location.hash || location.hash === '#myimages');
  const [isSearchActive, setIsSearchActive] = useState(false);

  return (
    <div 
      className={cn(
        "md:hidden fixed top-0 left-0 right-0 z-10",
        "bg-background/95 backdrop-blur-[2px]",
        "border-b border-border/80",
        "shadow-[0_8px_30px_rgb(0,0,0,0.06)]",
        "transition-all duration-300 ease-in-out",
        isVisible ? "translate-y-0" : "-translate-y-full"
      )}
    >
      <div className="flex items-center gap-1.5 px-2 h-10">
        {!isSearchActive && (
          <>
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
          </>
        )}
        <SearchBar 
          onSearch={onSearch} 
          onSearchOpenChange={setIsSearchActive}
          className={cn(
            "transition-all duration-200",
            isSearchActive ? "px-2" : "ml-auto"
          )}
        />
      </div>
      {/* Fade-out gradient */}
      <div className="h-1.5 bg-gradient-to-b from-background/50 to-transparent pointer-events-none" />
    </div>
  );
};

export default MobileHeader;