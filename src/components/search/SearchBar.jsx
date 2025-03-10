import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const SearchBar = ({ onSearch, onSearchOpenChange, className }) => {
  const [searchValue, setSearchValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (onSearchOpenChange) {
      onSearchOpenChange(isExpanded);
    }
  }, [isExpanded, onSearchOpenChange]);

  const handleSearch = () => {
    if (searchValue.trim()) {
      onSearch(searchValue.trim());
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      handleClear();
    }
  };

  const handleClear = () => {
    setSearchValue('');
    onSearch('');
    setIsExpanded(false);
  };

  const handleSearchClick = () => {
    setIsExpanded(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!searchValue) {
      setIsExpanded(false);
    }
  };

  return (
    <div className={cn(
      "relative flex items-center",
      "h-8",
      "transition-all duration-300 ease-in-out",
      isExpanded ? "md:w-[250px] w-full" : "w-8",
      className
    )}>
      <div className={cn(
        "absolute inset-0",
        "flex items-center",
        "bg-muted/5 hover:bg-muted/10",
        "rounded-xl",
        "transition-all duration-200",
        (isFocused || isExpanded) && "bg-muted/10 ring-1 ring-border",
      )}>
        {!isExpanded ? (
          <button
            onClick={handleSearchClick}
            className="w-full h-full flex items-center justify-center"
          >
            <Search className="h-5 w-5 text-muted-foreground/90" />
          </button>
        ) : (
          <div className="flex-1 flex items-center px-2.5">
            <Search className="h-5 w-5 text-muted-foreground/70 flex-shrink-0" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={handleBlur}
              placeholder="Search..."
              className={cn(
                "flex-1 h-full bg-transparent",
                "text-sm text-foreground placeholder:text-muted-foreground/50",
                "focus:outline-none",
                "px-2"
              )}
              autoFocus
            />
            {(searchValue || isExpanded) && (
              <button
                onClick={handleClear}
                className={cn(
                  "flex items-center justify-center",
                  "w-5 h-5",
                  "rounded-lg",
                  "hover:bg-muted/20",
                  "transition-all duration-200"
                )}
              >
                <X className="h-3.5 w-3.5 text-muted-foreground/50" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;