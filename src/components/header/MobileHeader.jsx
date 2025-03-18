
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
  onTopChange,
  searchQuery
}) => {
  const location = useLocation();
  const isInspiration = location.pathname === '/inspiration';
  const isMyImages = location.pathname === '/' && (!location.hash || location.hash === '#myimages');
  const [isSearchActive, setIsSearchActive] = useState(!!searchQuery);

  return (
    <div 
      className={cn(
        "md:hidden fixed top-0 left-0 right-0 z-10",
        "bg-background/95 backdrop-blur-[2px]",
        "shadow-[0_8px_30px_rgb(0,0,0,0.06)]",
        "transition-all duration-300 ease-in-out",
        isVisible ? "translate-y-0" : "-translate-y-full"
      )}
    >
      <div className={cn(
        "flex items-center h-10",
        isSearchActive ? "px-2" : "px-2 gap-2"
      )}>
        <div className={cn(
          "flex items-center gap-2 w-full",
          isSearchActive ? "justify-center" : "justify-between"
        )}>
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
              isSearchActive ? "w-full" : "ml-auto"
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default MobileHeader;
