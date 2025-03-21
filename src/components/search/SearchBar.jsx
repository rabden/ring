
import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocation, useNavigate } from 'react-router-dom';

const SearchBar = ({ onSearch, onSearchOpenChange, className }) => {
  const [searchValue, setSearchValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract search query from URL on initial load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchQuery = params.get('search');
    if (searchQuery) {
      setSearchValue(searchQuery);
      if (onSearch) {
        onSearch(searchQuery);
      }
      setIsExpanded(true);
    }
  }, [location.search, onSearch]);

  useEffect(() => {
    if (onSearchOpenChange) {
      onSearchOpenChange(isExpanded);
    }
  }, [isExpanded, onSearchOpenChange]);

  const handleSearch = () => {
    if (searchValue.trim()) {
      // Update URL with search parameter
      const params = new URLSearchParams(location.search);
      params.set('search', searchValue.trim());
      navigate({ search: params.toString() }, { replace: true });
      
      if (onSearch) {
        onSearch(searchValue.trim());
      }
    } else {
      handleClear();
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
    
    // Remove search parameter from URL
    const params = new URLSearchParams(location.search);
    params.delete('search');
    navigate({ search: params.toString() }, { replace: true });
    
    if (onSearch) {
      onSearch('');
    }
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
        "bg-secondary/0",
        "rounded-full",
        "transition-all duration-200",
        (isFocused || isExpanded) && "bg-secondary/80 hover:bg-secondary/90",
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
